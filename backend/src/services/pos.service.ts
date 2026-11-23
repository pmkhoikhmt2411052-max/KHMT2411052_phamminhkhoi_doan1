import { Prisma } from '../../generated/prisma/client.ts'
import { prisma } from '../config/prisma'
import { POS_CONFIG } from '../config/pos'
import { AppError, NotFoundError } from '../errors/app-error'
import type { BaoGiaInput, TraCuuInput } from '../validators/pos.validator'
import { Decimal, formatMoney, toDecimal } from '../utils/money'
import { normalizeVietnamese, VIETNAMESE_FROM, VIETNAMESE_TO } from '../utils/text'
import { validateVoucher } from './voucher.service'

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

async function resolveCustomer(input: BaoGiaInput) {
  let byId = null
  if (input.khachHangId) {
    byId = await prisma.khachHang.findUnique({ where: { id: input.khachHangId } })
    if (!byId) throw new NotFoundError('Không tìm thấy khách hàng')
  }
  if (input.sdt) {
    const bySdt = await prisma.khachHang.findUnique({ where: { sdt: normalizeSdt(input.sdt) } })
    if (byId && (!bySdt || bySdt.id !== byId.id)) {
      throw new AppError(400, 'khachHangId và sdt không trỏ cùng một khách hàng', 'CUSTOMER_MISMATCH')
    }
    if (!byId && !bySdt) throw new NotFoundError('Không tìm thấy khách hàng theo số điện thoại')
    return bySdt ?? byId
  }
  return byId
}

/** Báo giá: chỉ đọc, không ghi CSDL. Giá luôn lấy từ SanPham.gia_ban. */
async function baoGia(input: BaoGiaInput) {
  const customer = await resolveCustomer(input)
  const customerLocked = customer?.trangThai === 'BI_KHOA'

  // Gộp dòng trùng sản phẩm (giống UC03 cộng dồn).
  const quantityById = new Map<string, number>()
  for (const line of input.chiTiet) {
    quantityById.set(line.sanPhamId, (quantityById.get(line.sanPhamId) ?? 0) + line.soLuong)
  }
  const ids = [...quantityById.keys()]
  const products = await prisma.sanPham.findMany({ where: { id: { in: ids } } })
  const productById = new Map(products.map((product) => [product.id, product]))

  let tienHang = new Decimal(0)
  const lines = ids.map((id) => {
    const product = productById.get(id)
    if (!product || product.trangThai !== 'DANG_BAN') {
      throw new AppError(400, `Sản phẩm ${id} không tồn tại hoặc đã ngừng bán`, 'PRODUCT_NOT_SELLABLE')
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
      donGia: formatMoney(donGia),
      thanhTien: formatMoney(thanhTien),
      duTon: product.soLuongTon >= soLuong,
    }
  })

  let tienGiamVoucher = new Decimal(0)
  let voucherInfo: { id: string; maVoucher: string; tenVoucher: string } | null = null
  if (input.maVoucher) {
    const result = await validateVoucher({
      maVoucher: input.maVoucher,
      kenh: 'POS',
      tienHang,
      khachHangId: customer?.id ?? null,
    })
    tienGiamVoucher = result.soTienGiam
    voucherInfo = {
      id: result.voucher.id,
      maVoucher: result.voucher.maVoucher,
      tenVoucher: result.voucher.tenVoucher,
    }
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
    chiTiet: lines,
    khachHang: customer
      ? { id: customer.id, hoTen: customer.hoTen, sdt: customer.sdt, diemTichLuy: customer.diemTichLuy }
      : null,
    voucher: voucherInfo,
    tienHang: formatMoney(tienHang),
    tienGiamVoucher: formatMoney(tienGiamVoucher),
    tienGiamDiem: formatMoney(tienGiamDiem),
    tongTien: formatMoney(tongTien),
    diemSuDung,
    diemToiDa,
    diemCong,
  }
}

export const posService = { traCuu, baoGia }
