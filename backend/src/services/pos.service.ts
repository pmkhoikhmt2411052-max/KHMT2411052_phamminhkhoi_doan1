import { randomUUID } from 'node:crypto'
import { Prisma } from '../../generated/prisma/client.ts'
import type { KhachHang, Voucher } from '../../generated/prisma/client.ts'
import { prisma } from '../config/prisma'
import { POS_CONFIG } from '../config/pos'
import type { Role } from '../constants/roles'
import { AppError, ConflictError, ForbiddenError, NotFoundError } from '../errors/app-error'
import type {
  BaoGiaInput,
  ChotDonInput,
  ListDonHangInput,
  TraCuuInput,
} from '../validators/pos.validator'
import { Decimal, formatDateInTimezone, formatMoney, toDecimal } from '../utils/money'
import { normalizeVietnamese, VIETNAMESE_FROM, VIETNAMESE_TO } from '../utils/text'
import { validateVoucher } from './voucher.service'

/** Transaction client (prisma thường cũng assignable sang kiểu này). */
type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

type TraCuuRow = {
  id: string
  ma_sp: string
  isbn: string | null
  ten_sp: string
  loai_sp: string
  gia_ban: unknown
  so_luong_ton: number
  danh_muc_id: number
}

async function traCuu(input: TraCuuInput) {
  const conditions: Prisma.Sql[] = [Prisma.sql`sp."trang_thai" = 'DANG_BAN'`]
  if (input.q) {
    const pattern = `%${normalizeVietnamese(input.q)}%`
    conditions.push(Prisma.sql`(
      translate(lower(sp."ten_sp"), ${VIETNAMESE_FROM}, ${VIETNAMESE_TO}) LIKE ${pattern}
      OR lower(sp."ma_sp") LIKE ${pattern}
      OR lower(coalesce(sp."isbn", '')) LIKE ${pattern}
    )`)
  }
  if (input.danhMucId !== undefined) {
    conditions.push(Prisma.sql`sp."danh_muc_id" = ${input.danhMucId}`)
  }
  const where = Prisma.join(conditions, ' AND ')
  const offset = (input.page - 1) * input.pageSize

  const rows = await prisma.$queryRaw<TraCuuRow[]>(Prisma.sql`
    SELECT sp."id", sp."ma_sp", sp."isbn", sp."ten_sp", sp."loai_sp",
           sp."gia_ban", sp."so_luong_ton", sp."danh_muc_id"
    FROM "SanPham" sp
    WHERE ${where}
    ORDER BY sp."ten_sp" ASC, sp."id" ASC
    LIMIT ${input.pageSize} OFFSET ${offset}
  `)
  const countRows = await prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
    SELECT COUNT(*)::int AS count FROM "SanPham" sp WHERE ${where}
  `)
  const total = countRows[0]?.count ?? 0

  return {
    data: rows.map((row) => ({
      id: row.id,
      maSp: row.ma_sp,
      isbn: row.isbn,
      tenSp: row.ten_sp,
      loaiSp: row.loai_sp,
      giaBan: formatMoney(toDecimal(row.gia_ban)),
      soLuongTon: row.so_luong_ton,
      danhMucId: row.danh_muc_id,
    })),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    },
  }
}

function normalizeSdt(value: string): string {
  return value.replace(/[\s().-]/g, '')
}

async function resolveCustomer(db: Tx, input: BaoGiaInput): Promise<KhachHang | null> {
  let byId: KhachHang | null = null
  if (input.khachHangId) {
    byId = await db.khachHang.findUnique({ where: { id: input.khachHangId } })
    if (!byId) throw new NotFoundError('Không tìm thấy khách hàng')
  }
  if (input.sdt) {
    const bySdt = await db.khachHang.findUnique({ where: { sdt: normalizeSdt(input.sdt) } })
    if (byId && (!bySdt || bySdt.id !== byId.id)) {
      throw new AppError(400, 'khachHangId và sdt không trỏ cùng một khách hàng', 'CUSTOMER_MISMATCH')
    }
    if (!byId && !bySdt) throw new NotFoundError('Không tìm thấy khách hàng theo số điện thoại')
    return bySdt ?? byId
  }
  return byId
}

type QuoteLine = {
  sanPhamId: string
  maSp: string
  tenSp: string
  soLuong: number
  donGia: Decimal
  thanhTien: Decimal
  duTon: boolean
}

type Quote = {
  customer: KhachHang | null
  customerLocked: boolean
  lines: QuoteLine[]
  voucher: Voucher | null
  tienHang: Decimal
  tienGiamVoucher: Decimal
  tienGiamDiem: Decimal
  tongTien: Decimal
  diemSuDung: number
  diemToiDa: number
  diemCong: number
}

/** Gộp dòng trùng sản phẩm (UC03 cộng dồn). */
function mergeLines(chiTiet: { sanPhamId: string; soLuong: number }[]): Map<string, number> {
  const quantityById = new Map<string, number>()
  for (const line of chiTiet) {
    quantityById.set(line.sanPhamId, (quantityById.get(line.sanPhamId) ?? 0) + line.soLuong)
  }
  return quantityById
}

/**
 * Tính lại toàn bộ giá / voucher / điểm từ CSDL — KHÔNG tin số tiền từ client.
 * Dùng chung cho báo giá (db = prisma, chỉ đọc) và chốt đơn (db = tx, SAU khi đã khóa).
 * Thứ tự: voucher trước, điểm sau; giá luôn lấy từ SanPham.gia_ban.
 */
async function computeQuote(db: Tx, input: BaoGiaInput): Promise<Quote> {
  const customer = await resolveCustomer(db, input)
  const customerLocked = customer?.trangThai === 'BI_KHOA'

  const quantityById = mergeLines(input.chiTiet)
  const ids = [...quantityById.keys()]
  const products = await db.sanPham.findMany({ where: { id: { in: ids } } })
  const productById = new Map(products.map((product) => [product.id, product]))

  let tienHang = new Decimal(0)
  const lines: QuoteLine[] = ids.map((id) => {
    const product = productById.get(id)
    if (!product || product.trangThai !== 'DANG_BAN') {
      throw new AppError(
        400,
        `Sản phẩm ${product?.maSp ?? id} không tồn tại hoặc đã ngừng bán`,
        'PRODUCT_NOT_SELLABLE',
      )
    }
    const soLuong = quantityById.get(id)!
    const donGia = toDecimal(product.giaBan)
    const thanhTien = donGia.mul(soLuong)
    tienHang = tienHang.add(thanhTien)
    return {
      sanPhamId: id,
      maSp: product.maSp,
      tenSp: product.tenSp,
      soLuong,
      donGia,
      thanhTien,
      duTon: product.soLuongTon >= soLuong,
    }
  })

  let tienGiamVoucher = new Decimal(0)
  let voucher: Voucher | null = null
  if (input.maVoucher) {
    const result = await validateVoucher({
      maVoucher: input.maVoucher,
      kenh: 'POS',
      tienHang,
      khachHangId: customer?.id ?? null,
      db,
    })
    tienGiamVoucher = result.soTienGiam
    voucher = result.voucher
  }

  const remaining = tienHang.sub(tienGiamVoucher)
  const diemSuDung = input.diemSuDung
  if (diemSuDung > 0) {
    if (!customer) throw new AppError(400, 'Chỉ khách thành viên mới được dùng điểm', 'POINTS_REQUIRE_CUSTOMER')
    if (customerLocked) throw new AppError(400, 'Khách bị khóa không được dùng điểm', 'CUSTOMER_LOCKED')
    if (customer.diemTichLuy < diemSuDung) {
      throw new AppError(400, 'Không đủ điểm tích lũy', 'INSUFFICIENT_POINTS')
    }
  }
  const tienGiamDiem = new Decimal(diemSuDung).mul(POS_CONFIG.giaTriDiem)
  if (tienGiamDiem.greaterThan(remaining)) {
    throw new AppError(400, 'Điểm dùng vượt quá số tiền còn lại sau voucher', 'POINTS_EXCEED_REMAINING')
  }

  const tongTien = remaining.sub(tienGiamDiem)
  const diemToiDa =
    customer && !customerLocked
      ? Math.min(customer.diemTichLuy, remaining.div(POS_CONFIG.giaTriDiem).floor().toNumber())
      : 0
  const diemCong =
    customer && !customerLocked ? tongTien.div(POS_CONFIG.diemMoiTien).floor().toNumber() : 0

  return {
    customer,
    customerLocked,
    lines,
    voucher,
    tienHang,
    tienGiamVoucher,
    tienGiamDiem,
    tongTien,
    diemSuDung,
    diemToiDa,
    diemCong,
  }
}

/** Báo giá: chỉ đọc, không ghi CSDL. Giá luôn lấy từ SanPham.gia_ban. */
async function baoGia(input: BaoGiaInput) {
  const quote = await computeQuote(prisma, input)
  return {
    chiTiet: quote.lines.map((line) => ({
      sanPhamId: line.sanPhamId,
      maSp: line.maSp,
      tenSp: line.tenSp,
      soLuong: line.soLuong,
      donGia: formatMoney(line.donGia),
      thanhTien: formatMoney(line.thanhTien),
      duTon: line.duTon,
    })),
    khachHang: quote.customer
      ? {
          id: quote.customer.id,
          hoTen: quote.customer.hoTen,
          sdt: quote.customer.sdt,
          diemTichLuy: quote.customer.diemTichLuy,
        }
      : null,
    voucher: quote.voucher
      ? { id: quote.voucher.id, maVoucher: quote.voucher.maVoucher, tenVoucher: quote.voucher.tenVoucher }
      : null,
    tienHang: formatMoney(quote.tienHang),
    tienGiamVoucher: formatMoney(quote.tienGiamVoucher),
    tienGiamDiem: formatMoney(quote.tienGiamDiem),
    tongTien: formatMoney(quote.tongTien),
    diemSuDung: quote.diemSuDung,
    diemToiDa: quote.diemToiDa,
    diemCong: quote.diemCong,
  }
}

// ============================================================
// UC05 — Chốt đơn & thanh toán tiền mặt
// ============================================================

const MAX_MA_DH_ATTEMPTS = 5

/** ma_dh = DH-yyyyMMdd-XXXXXX theo múi giờ Asia/Ho_Chi_Minh. */
function generateMaDh(): string {
  const date = formatDateInTimezone(new Date(), POS_CONFIG.timezone)
  return `DH-${date}-${randomUUID().slice(0, 6).toUpperCase()}`
}

async function nhanVienIdOf(db: Tx, taiKhoanId: string): Promise<string> {
  const nhanVien = await db.nhanVien.findUnique({ where: { taiKhoanId } })
  if (!nhanVien) throw new ForbiddenError('Tài khoản không có hồ sơ nhân viên')
  return nhanVien.id
}

type LockedProduct = {
  id: string
  maSp: string
  soLuongTon: number
  trangThai: string
  danhMucTrangThai: string
}

/** Khóa sản phẩm theo id tăng dần (FOR UPDATE) để tránh deadlock; chỉ khóa bảng SanPham. */
async function lockSanPhams(tx: Tx, ids: string[]): Promise<Map<string, LockedProduct>> {
  if (ids.length === 0) return new Map()
  const rows = await tx.$queryRaw<LockedProduct[]>(Prisma.sql`
    SELECT sp."id", sp."ma_sp" AS "maSp", sp."so_luong_ton" AS "soLuongTon",
           sp."trang_thai" AS "trangThai", dm."trang_thai" AS "danhMucTrangThai"
    FROM "SanPham" sp
    JOIN "DanhMuc" dm ON dm."danh_muc_id" = sp."danh_muc_id"
    WHERE sp."id" IN (${Prisma.join(ids)})
    ORDER BY sp."id" ASC
    FOR UPDATE OF sp
  `)
  return new Map(rows.map((row) => [row.id, row]))
}

async function lockVoucher(tx: Tx, maVoucher: string): Promise<void> {
  await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Voucher" WHERE "ma_voucher" = ${maVoucher} FOR UPDATE`)
}

async function lockCustomer(tx: Tx, id: string): Promise<void> {
  await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "KhachHang" WHERE "id" = ${id} FOR UPDATE`)
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const e = error as { code?: string; meta?: { originalCode?: string }; message?: string }
  return (
    e.code === 'P2002' ||
    e.meta?.originalCode === '23505' ||
    /duplicate key value|unique constraint/i.test(e.message ?? '')
  )
}

/** Đánh dấu lỗi trùng ma_dh để thử lại toàn bộ transaction với mã khác (có giới hạn). */
class MaDhCollision extends Error {
  constructor(public readonly original: unknown) {
    super('Trùng mã đơn hàng (ma_dh)')
    this.name = 'MaDhCollision'
  }
}

/** Đánh dấu lỗi trùng ma_giao_dich để xử lý idempotency (không lộ lỗi CSDL). */
class IdempotencyCollision extends Error {
  constructor(public readonly original: unknown) {
    super('Trùng khóa idempotency (ma_giao_dich)')
    this.name = 'IdempotencyCollision'
  }
}

/** Dịch lỗi ràng buộc CSDL (CHECK/unique/FK/trigger) thành lỗi API rõ ràng, không lộ nội dung CSDL. */
function translateCheckoutDbError(error: unknown): unknown {
  if (error instanceof AppError) return error
  if (typeof error !== 'object' || error === null) return error
  const e = error as {
    code?: string
    message?: string
    meta?: { originalCode?: string }
  }
  const originalCode = e.meta?.originalCode
  const message = e.message ?? ''

  if (e.code === 'P2002' || originalCode === '23505') {
    // ma_dh và ma_giao_dich đã được xử lý riêng; các unique còn lại.
    return new ConflictError('Dữ liệu bị trùng (vi phạm ràng buộc duy nhất)')
  }
  if (
    originalCode === '23514' ||
    e.code === 'P2004' ||
    /check constraint|violates check|check_violation/i.test(message)
  ) {
    if (message.includes('ThanhToan_so_tien_check')) {
      return new AppError(400, 'Số tiền thanh toán phải lớn hơn 0', 'INVALID_PAYMENT_AMOUNT')
    }
    if (
      message.includes('DonHang_tong_tien_check') ||
      message.includes('DonHang_giam_diem_check') ||
      message.includes('DonHang_giam_voucher_check') ||
      message.includes('DonHang_gia_tri_khong_am_check')
    ) {
      return new AppError(400, 'Số tiền đơn hàng không hợp lệ', 'INVALID_ORDER_AMOUNT')
    }
    if (message.includes('DonHang_kenh_ban_check')) {
      return new AppError(400, 'Đơn POS thiếu thông tin nhân viên', 'INVALID_ORDER_CHANNEL')
    }
    if (
      message.includes('KhachHang_diem_tich_luy_check') ||
      message.includes('LichSuDiem_so_du_sau_check') ||
      message.includes('LichSuDiem_so_diem_check')
    ) {
      return new AppError(400, 'Điểm tích lũy không hợp lệ', 'INVALID_POINTS')
    }
    if (message.includes('Voucher_so_luong_check') || message.includes('Voucher_gia_tri_khong_am_check')) {
      return new AppError(400, 'Voucher đã hết lượt hoặc không hợp lệ', 'VOUCHER_OUT_OF_STOCK')
    }
    if (message.includes('LichSuTonKho_cong_thuc_check') || message.includes('LichSuTonKho_mot_nguon_check')) {
      return new AppError(409, 'Sổ kho không hợp lệ', 'INVALID_STOCK_LEDGER')
    }
    if (message.includes('SanPham_gia_tri_khong_am_check')) {
      return new AppError(409, 'Tồn kho không đủ', 'INSUFFICIENT_STOCK')
    }
    if (message.includes('ChiTietDonHang')) {
      return new AppError(400, 'Dòng đơn hàng không hợp lệ', 'INVALID_ORDER_LINE')
    }
    return new AppError(400, 'Dữ liệu không thỏa ràng buộc nghiệp vụ', 'CONSTRAINT_VIOLATION')
  }
  if (originalCode === '23503' || e.code === 'P2003') {
    return new AppError(400, 'Dữ liệu tham chiếu không tồn tại', 'INVALID_REFERENCE')
  }
  if (originalCode === '23P01') {
    return new ConflictError('Xung đột phạm vi dữ liệu')
  }
  return error
}

// ---- Idempotency: vân tay nội dung đơn (dòng, voucher, điểm, khách, nhân viên) ----

function linesFingerprint(chiTiet: { sanPhamId: string; soLuong: number }[]): string {
  const merged = mergeLines(chiTiet)
  return [...merged.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, quantity]) => `${id}:${quantity}`)
    .join('|')
}

function requestFingerprint(input: ChotDonInput, khachHangId: string | null, nhanVienId: string): string {
  return JSON.stringify({
    lines: linesFingerprint(input.chiTiet),
    voucher: input.maVoucher ? input.maVoucher.trim().toUpperCase() : '',
    diemSuDung: input.diemSuDung,
    khachHangId: khachHangId ?? '',
    nhanVienId,
  })
}

type OrderWithRelations = {
  khachHangId: string | null
  nhanVienId: string | null
  diemSuDung: number
  chiTietDonHangs: { sanPhamId: string; soLuong: number }[]
  voucherLuotDung: { voucher: { maVoucher: string } } | null
}

function orderFingerprint(order: OrderWithRelations): string {
  return JSON.stringify({
    lines: linesFingerprint(order.chiTietDonHangs),
    voucher: order.voucherLuotDung ? order.voucherLuotDung.voucher.maVoucher.trim().toUpperCase() : '',
    diemSuDung: order.diemSuDung,
    khachHangId: order.khachHangId ?? '',
    nhanVienId: order.nhanVienId ?? '',
  })
}

const ORDER_INCLUDE = {
  khachHang: true,
  nhanVien: { select: { id: true, maNv: true, hoTen: true } },
  chiTietDonHangs: {
    include: { sanPham: { select: { maSp: true, tenSp: true } } },
    orderBy: { sanPhamId: 'asc' as const },
  },
  thanhToans: true,
  voucherLuotDung: { include: { voucher: true } },
}

async function findOrderByMaGiaoDich(maGiaoDich: string) {
  return prisma.thanhToan.findUnique({
    where: { maGiaoDich },
    include: { donHang: { include: ORDER_INCLUDE } },
  })
}

/**
 * Dựng hóa đơn từ đơn đã lưu; tiền thừa = tiền khách đưa - tong_tien.
 * Khi xem lại hóa đơn (không có request gốc), tiền khách đưa không được lưu trong CSDL
 * nên trả null cho cả hai khoản này.
 */
async function buildInvoice(orderId: string, tienKhachDua: Decimal | null) {
  const order = await prisma.donHang.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE })
  if (!order) throw new NotFoundError('Không tìm thấy đơn hàng')
  const tongTien = toDecimal(order.tongTien)
  const thanhToan = order.thanhToans.find((t) => t.trangThai === 'THANH_CONG') ?? order.thanhToans[0]
  return {
    id: order.id,
    maDh: order.maDh,
    kenhBan: order.kenhBan,
    trangThai: order.trangThai,
    khachHang: order.khachHang
      ? {
          id: order.khachHang.id,
          hoTen: order.khachHang.hoTen,
          sdt: order.khachHang.sdt,
          diemTichLuy: order.khachHang.diemTichLuy,
        }
      : null,
    nhanVien: order.nhanVien,
    voucher: order.voucherLuotDung
      ? {
          id: order.voucherLuotDung.voucher.id,
          maVoucher: order.voucherLuotDung.voucher.maVoucher,
          tenVoucher: order.voucherLuotDung.voucher.tenVoucher,
        }
      : null,
    chiTiet: order.chiTietDonHangs.map((line) => ({
      sanPhamId: line.sanPhamId,
      maSp: line.sanPham.maSp,
      tenSp: line.sanPham.tenSp,
      soLuong: line.soLuong,
      donGia: formatMoney(toDecimal(line.donGia)),
      thanhTien: formatMoney(toDecimal(line.thanhTien)),
    })),
    tienHang: formatMoney(toDecimal(order.tienHang)),
    tienGiamVoucher: formatMoney(toDecimal(order.tienGiamVoucher)),
    tienGiamDiem: formatMoney(toDecimal(order.tienGiamDiem)),
    phiVanChuyen: formatMoney(toDecimal(order.phiVanChuyen)),
    tongTien: formatMoney(tongTien),
    diemSuDung: order.diemSuDung,
    diemCong: order.diemCong,
    tienKhachDua: tienKhachDua ? formatMoney(tienKhachDua) : null,
    tienThua: tienKhachDua ? formatMoney(tienKhachDua.sub(tongTien)) : null,
    thanhToan: thanhToan
      ? {
          id: thanhToan.id,
          maGiaoDich: thanhToan.maGiaoDich,
          phuongThuc: thanhToan.phuongThuc,
          soTien: formatMoney(toDecimal(thanhToan.soTien)),
          trangThai: thanhToan.trangThai,
          thoiGian: thanhToan.thoiGian,
        }
      : null,
    ngayTao: order.ngayTao,
    ngayThanhToan: order.ngayThanhToan,
  }
}

type ExistingOrder = NonNullable<Awaited<ReturnType<typeof findOrderByMaGiaoDich>>>

/** Cùng khóa + cùng nội dung → trả đơn cũ (200); khác nội dung → 409. */
async function replayOrder(
  existing: ExistingOrder,
  input: ChotDonInput,
  khachHangId: string | null,
  nhanVienId: string,
) {
  const order = existing.donHang
  if (orderFingerprint(order) !== requestFingerprint(input, khachHangId, nhanVienId)) {
    throw new AppError(
      409,
      'Khóa idempotency đã được dùng cho một đơn hàng khác nội dung',
      'IDEMPOTENCY_CONFLICT',
    )
  }
  const tongTien = toDecimal(order.tongTien)
  const tienKhachDua = toDecimal(input.tienKhachDua)
  if (tienKhachDua.lessThan(tongTien)) {
    throw new AppError(400, 'Tiền khách đưa nhỏ hơn tổng thanh toán của đơn', 'INSUFFICIENT_CASH')
  }
  return { replayed: true as const, invoice: await buildInvoice(order.id, tienKhachDua) }
}

/**
 * Một transaction ACID. Thứ tự khóa: sản phẩm (id ASC) → voucher → khách hàng.
 * Tính lại giá/voucher/điểm bằng computeQuote SAU khi khóa; không tin tiền từ client.
 */
async function runCheckoutTx(
  input: ChotDonInput,
  nhanVienId: string,
  maGiaoDich: string | null,
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const quantityById = mergeLines(input.chiTiet)
    const ids = [...quantityById.keys()].sort((a, b) => a.localeCompare(b))

    // 1) Khóa sản phẩm theo id tăng dần.
    const locked = await lockSanPhams(tx, ids)
    if (locked.size !== ids.length) throw new NotFoundError('Sản phẩm trong đơn không còn tồn tại')
    for (const id of ids) {
      const product = locked.get(id)!
      if (product.trangThai !== 'DANG_BAN') {
        throw new AppError(400, `Sản phẩm ${product.maSp} đã ngừng bán`, 'PRODUCT_NOT_SELLABLE')
      }
      if (product.danhMucTrangThai !== 'HOAT_DONG') {
        throw new AppError(400, `Sản phẩm ${product.maSp} thuộc danh mục đang ẩn`, 'CATEGORY_HIDDEN')
      }
    }

    // 2) Khóa voucher (nếu có).
    if (input.maVoucher) await lockVoucher(tx, input.maVoucher.trim().toUpperCase())

    // 3) Khóa khách hàng (nếu có).
    const customer = await resolveCustomer(tx, input)
    if (customer) await lockCustomer(tx, customer.id)

    // 4) Tính lại toàn bộ bằng đúng hàm báo giá, trên các dòng đã khóa.
    const quote = await computeQuote(tx, input)

    // 5) Tiền khách đưa phải đủ; tổng thanh toán phải dương (ThanhToan.so_tien > 0).
    const tienKhachDua = toDecimal(input.tienKhachDua)
    if (tienKhachDua.lessThan(quote.tongTien)) {
      throw new AppError(400, 'Tiền khách đưa nhỏ hơn tổng thanh toán', 'INSUFFICIENT_CASH')
    }
    if (quote.tongTien.lessThanOrEqualTo(0)) {
      throw new AppError(400, 'Tổng thanh toán phải lớn hơn 0', 'INVALID_TOTAL')
    }

    // 6) Trừ tồn bằng UPDATE có điều kiện; thiếu → rollback toàn bộ, báo rõ maSp.
    for (const id of ids) {
      const soLuong = quantityById.get(id)!
      const affected = await tx.$executeRaw(Prisma.sql`
        UPDATE "SanPham" SET "so_luong_ton" = "so_luong_ton" - ${soLuong}
        WHERE "id" = ${id} AND "so_luong_ton" >= ${soLuong}
      `)
      if (affected === 0) {
        throw new AppError(409, `Không đủ tồn kho cho sản phẩm ${locked.get(id)!.maSp}`, 'INSUFFICIENT_STOCK')
      }
    }

    // 7) DonHang (POS, DA_THANH_TOAN, phí vận chuyển 0, đủ cột tiền/điểm, ngay_thanh_toan).
    let donHang
    try {
      donHang = await tx.donHang.create({
        data: {
          maDh: generateMaDh(),
          khachHangId: quote.customer?.id ?? null,
          nhanVienId,
          kenhBan: 'POS',
          trangThai: 'DA_THANH_TOAN',
          tienHang: quote.tienHang,
          tienGiamVoucher: quote.tienGiamVoucher,
          tienGiamDiem: quote.tienGiamDiem,
          phiVanChuyen: new Decimal(0),
          tongTien: quote.tongTien,
          diemSuDung: quote.diemSuDung,
          diemCong: quote.diemCong,
          ngayThanhToan: new Date(),
        },
      })
    } catch (error) {
      if (isUniqueViolation(error)) throw new MaDhCollision(error)
      throw error
    }
    const orderId = donHang.id

    // 8) ChiTietDonHang — chốt don_gia và thanh_tien.
    await tx.chiTietDonHang.createMany({
      data: quote.lines.map((line) => ({
        donHangId: orderId,
        sanPhamId: line.sanPhamId,
        soLuong: line.soLuong,
        donGia: line.donGia,
        thanhTien: line.thanhTien,
      })),
    })

    // 9) ThanhToan TIEN_MAT / THANH_CONG, so_tien = tong_tien, ma_giao_dich = POS-<khóa>.
    try {
      await tx.thanhToan.create({
        data: {
          donHangId: orderId,
          maGiaoDich,
          phuongThuc: 'TIEN_MAT',
          soTien: quote.tongTien,
          trangThai: 'THANH_CONG',
          thoiGian: new Date(),
        },
      })
    } catch (error) {
      if (isUniqueViolation(error)) throw new IdempotencyCollision(error)
      throw error
    }

    // 10) LichSuTonKho BAN_HANG — số lượng thay đổi âm, trước/sau đúng công thức.
    for (const id of ids) {
      const soLuong = quantityById.get(id)!
      const before = locked.get(id)!.soLuongTon
      await tx.lichSuTonKho.create({
        data: {
          sanPhamId: id,
          nguoiThucHienId: nhanVienId,
          donHangId: orderId,
          loaiBienDong: 'BAN_HANG',
          soLuongThayDoi: -soLuong,
          soLuongTruoc: before,
          soLuongSau: before - soLuong,
        },
      })
    }

    // 11) Voucher — tăng da_su_dung có điều kiện (còn lượt) + ghi lượt dùng.
    if (quote.voucher) {
      const affected = await tx.$executeRaw(Prisma.sql`
        UPDATE "Voucher" SET "da_su_dung" = "da_su_dung" + 1
        WHERE "id" = ${quote.voucher.id} AND ("so_luong" IS NULL OR "da_su_dung" < "so_luong")
      `)
      if (affected === 0) throw new AppError(400, 'Voucher đã hết lượt sử dụng', 'VOUCHER_OUT_OF_STOCK')
      await tx.voucherLuotDung.create({
        data: {
          voucherId: quote.voucher.id,
          donHangId: orderId,
          khachHangId: quote.customer?.id ?? null,
          soTienGiam: quote.tienGiamVoucher,
        },
      })
    }

    // 12) Điểm — trừ điểm dùng, cộng điểm thưởng (trên tong_tien); khách lẻ/bị khóa bỏ qua.
    if (quote.customer && !quote.customerLocked) {
      const initial = quote.customer.diemTichLuy
      let running = initial
      if (quote.diemSuDung > 0) {
        running -= quote.diemSuDung
        await tx.lichSuDiem.create({
          data: {
            khachHangId: quote.customer.id,
            donHangId: orderId,
            nguoiThucHienId: nhanVienId,
            loai: 'TRU',
            soDiem: quote.diemSuDung,
            soDuSau: running,
          },
        })
      }
      if (quote.diemCong > 0) {
        running += quote.diemCong
        await tx.lichSuDiem.create({
          data: {
            khachHangId: quote.customer.id,
            donHangId: orderId,
            nguoiThucHienId: nhanVienId,
            loai: 'CONG',
            soDiem: quote.diemCong,
            soDuSau: running,
          },
        })
      }
      if (running !== initial) {
        const affected = await tx.$executeRaw(Prisma.sql`
          UPDATE "KhachHang" SET "diem_tich_luy" = "diem_tich_luy" - ${quote.diemSuDung} + ${quote.diemCong}
          WHERE "id" = ${quote.customer.id} AND "diem_tich_luy" >= ${quote.diemSuDung}
        `)
        if (affected === 0) throw new AppError(400, 'Không đủ điểm tích lũy', 'INSUFFICIENT_POINTS')
      }
    }

    return orderId
  })
}

/** UC05 — chốt đơn và thanh toán tiền mặt. Trả 201 (đơn mới) hoặc 200 (idempotency replay). */
async function chotDon(input: ChotDonInput, taiKhoanId: string) {
  const nhanVienId = await nhanVienIdOf(prisma, taiKhoanId)
  const maGiaoDich = input.idempotencyKey ? `POS-${input.idempotencyKey}` : null

  // Idempotency: cùng khóa đã có đơn → so vân tay nội dung, trả đơn cũ hoặc 409.
  let khachHangId: string | null = null
  if (maGiaoDich) {
    const customer = await resolveCustomer(prisma, input)
    khachHangId = customer?.id ?? null
    const existing = await findOrderByMaGiaoDich(maGiaoDich)
    if (existing) return replayOrder(existing, input, khachHangId, nhanVienId)
  }

  const tienKhachDua = toDecimal(input.tienKhachDua)
  for (let attempt = 0; attempt < MAX_MA_DH_ATTEMPTS; attempt++) {
    try {
      const orderId = await runCheckoutTx(input, nhanVienId, maGiaoDich)
      return { replayed: false as const, invoice: await buildInvoice(orderId, tienKhachDua) }
    } catch (error) {
      // Trùng ma_dh → thử lại toàn bộ transaction với mã khác (có giới hạn).
      if (error instanceof MaDhCollision) continue
      // Hai yêu cầu cùng khóa đồng thời → chỉ một đơn được tạo; yêu cầu thua trả đơn cũ.
      if (error instanceof IdempotencyCollision && maGiaoDich) {
        const existing = await findOrderByMaGiaoDich(maGiaoDich)
        if (existing) return replayOrder(existing, input, khachHangId, nhanVienId)
        throw translateCheckoutDbError(error.original)
      }
      throw translateCheckoutDbError(error)
    }
  }
  throw new AppError(409, 'Không thể sinh mã đơn hàng duy nhất, vui lòng thử lại', 'MA_DH_GENERATION_FAILED')
}

/** UC05 — xem lại hóa đơn để in lại; chỉ đơn POS, thu ngân thấy đơn của mình, ADMIN thấy mọi đơn. */
async function xemHoaDon(id: string, taiKhoanId: string, vaiTro: Role) {
  const order = await prisma.donHang.findUnique({ where: { id }, include: ORDER_INCLUDE })
  if (!order || order.kenhBan !== 'POS') throw new NotFoundError('Không tìm thấy hóa đơn')
  if (vaiTro !== 'ADMIN') {
    const nhanVien = await prisma.nhanVien.findUnique({ where: { taiKhoanId }, select: { id: true } })
    if (!nhanVien || order.nhanVienId !== nhanVien.id) {
      throw new NotFoundError('Không tìm thấy hóa đơn')
    }
  }
  // Tiền khách đưa không được lưu; xem lại hóa đơn trả null cho hai khoản này.
  return buildInvoice(id, null)
}

/** UC05 — danh sách đơn POS; thu ngân chỉ thấy đơn mình thu, ADMIN thấy mọi đơn. */
async function danhSachDon(input: ListDonHangInput, taiKhoanId: string, vaiTro: Role) {
  let nhanVienId: string | undefined
  if (vaiTro !== 'ADMIN') {
    const nhanVien = await prisma.nhanVien.findUnique({ where: { taiKhoanId }, select: { id: true } })
    nhanVienId = nhanVien?.id ?? ''
  }
  const where: Prisma.DonHangWhereInput = {
    kenhBan: 'POS',
    ...(nhanVienId !== undefined ? { nhanVienId } : {}),
    ...(input.trangThai ? { trangThai: input.trangThai } : {}),
    ...(input.maDh ? { maDh: { contains: input.maDh } } : {}),
    ...(input.tuNgay || input.denNgay
      ? {
          ngayTao: {
            ...(input.tuNgay ? { gte: input.tuNgay } : {}),
            ...(input.denNgay ? { lte: input.denNgay } : {}),
          },
        }
      : {}),
  }
  const [rows, total] = await Promise.all([
    prisma.donHang.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { ngayTao: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.donHang.count({ where }),
  ])
  return {
    data: rows.map((order) => ({
      id: order.id,
      maDh: order.maDh,
      trangThai: order.trangThai,
      tongTien: formatMoney(toDecimal(order.tongTien)),
      diemSuDung: order.diemSuDung,
      diemCong: order.diemCong,
      khachHang: order.khachHang
        ? { id: order.khachHang.id, hoTen: order.khachHang.hoTen, sdt: order.khachHang.sdt }
        : null,
      nhanVien: order.nhanVien,
      soDong: order.chiTietDonHangs.length,
      ngayTao: order.ngayTao,
      ngayThanhToan: order.ngayThanhToan,
    })),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    },
  }
}

export const posService = { traCuu, baoGia, chotDon, xemHoaDon, danhSachDon }
