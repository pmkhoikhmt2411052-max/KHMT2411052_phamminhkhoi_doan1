import { randomUUID } from 'node:crypto'
import { Prisma } from '../../generated/prisma/client.ts'
import { prisma } from '../config/prisma'
import { toPhieuKiemKeDto } from '../dtos/kiem-ke.dto'
import { AppError, ConflictError, ForbiddenError, NotFoundError } from '../errors/app-error'
import type {
  ChiTietKiemKeInput,
  CreateKiemKeInput,
  ListKiemKeInput,
  TuChoiInput,
} from '../validators/kiem-ke.validator'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
const OPEN = ['NHAP', 'CHO_DUYET'] as const

function generateMaPkk(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `PKK-${date}-${randomUUID().slice(0, 6).toUpperCase()}`
}

async function lockPhieu(
  tx: Tx,
  id: string,
): Promise<{ id: string; trangThai: string; danhMucId: number | null } | null> {
  const rows = await tx.$queryRaw<{ id: string; trangThai: string; danhMucId: number | null }[]>(Prisma.sql`
    SELECT "id", "trang_thai" AS "trangThai", "danh_muc_id" AS "danhMucId"
    FROM "PhieuKiemKe" WHERE "id" = ${id} FOR UPDATE
  `)
  return rows[0] ?? null
}

/** Khóa sản phẩm theo id tăng dần để tránh deadlock. */
async function lockSanPhams(tx: Tx, ids: string[]) {
  const rows = await tx.$queryRaw<{ id: string; maSp: string; soLuongTon: number }[]>(Prisma.sql`
    SELECT "id", "ma_sp" AS "maSp", "so_luong_ton" AS "soLuongTon"
    FROM "SanPham"
    WHERE "id" IN (${Prisma.join(ids)})
    ORDER BY "id" ASC
    FOR UPDATE
  `)
  return new Map(rows.map((row) => [row.id, row]))
}

/** Exclusion constraint chỉ xét phiếu NHAP/CHO_DUYET; NULL phủ mọi phạm vi. */
async function assertScopeAvailable(tx: Tx, danhMucId: number | null, excludeId?: string) {
  const open = await tx.phieuKiemKe.findFirst({
    where: {
      trangThai: { in: [...OPEN] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      ...(danhMucId === null ? {} : { OR: [{ danhMucId: null }, { danhMucId }] }),
    },
  })
  if (open) throw new ConflictError('Đã có phiếu kiểm kê đang mở trùng phạm vi')
}

function isExclusionViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const candidate = error as { code?: string; meta?: { originalCode?: string }; message?: string }
  return (
    candidate.meta?.originalCode === '23P01' ||
    (candidate.message ?? '').includes('PhieuKiemKe_khong_chong_pham_vi')
  )
}

async function nhanVienIdOf(tx: Tx, taiKhoanId: string): Promise<string> {
  const nhanVien = await tx.nhanVien.findUnique({ where: { taiKhoanId } })
  if (!nhanVien) throw new ForbiddenError('Tài khoản không có hồ sơ nhân viên')
  return nhanVien.id
}

async function create(input: CreateKiemKeInput, taiKhoanId: string) {
  const danhMucId = input.danhMucId ?? null
  try {
    const phieuId = await prisma.$transaction(async (tx) => {
      const nguoiLapId = await nhanVienIdOf(tx, taiKhoanId)
      if (danhMucId !== null) {
        const danhMuc = await tx.danhMuc.findUnique({ where: { danhMucId } })
        if (!danhMuc) throw new NotFoundError('Danh mục không tồn tại')
      }
      await assertScopeAvailable(tx, danhMucId)

      // Chụp ảnh tồn hệ thống tại thời điểm lập phiếu.
      const products = await tx.sanPham.findMany({
        where: danhMucId === null ? {} : { danhMucId },
        select: { id: true, soLuongTon: true },
        orderBy: { id: 'asc' },
      })
      if (products.length === 0) {
        throw new AppError(400, 'Phạm vi kiểm kê không có sản phẩm nào', 'EMPTY_SCOPE')
      }

      const phieu = await tx.phieuKiemKe.create({
        data: {
          maPkk: generateMaPkk(),
          danhMucId,
          nguoiLapId,
          trangThai: 'NHAP',
          ghiChu: input.ghiChu ?? null,
        },
      })

      await tx.chiTietPhieuKiemKe.createMany({
        data: products.map((product) => ({
          phieuKiemKeId: phieu.id,
          sanPhamId: product.id,
          soLuongHeThong: product.soLuongTon,
          // Mặc định bằng số hệ thống; nhân viên kho nhập lại số thực tế.
          soLuongThucTe: product.soLuongTon,
          chenhLech: 0,
        })),
      })
      return phieu.id
    })
    return findById(phieuId)
  } catch (error) {
    if (isExclusionViolation(error)) {
      throw new ConflictError('Đã có phiếu kiểm kê đang mở trùng phạm vi')
    }
    throw error
  }
}

async function capNhatThucTe(phieuId: string, sanPhamId: string, input: ChiTietKiemKeInput) {
  await prisma.$transaction(async (tx) => {
    const phieu = await lockPhieu(tx, phieuId)
    if (!phieu) throw new NotFoundError('Không tìm thấy phiếu kiểm kê')
    if (phieu.trangThai !== 'NHAP') {
      throw new ConflictError('Chỉ phiếu nháp (NHAP) mới được nhập số thực tế')
    }
    const line = await tx.chiTietPhieuKiemKe.findUnique({
      where: { phieuKiemKeId_sanPhamId: { phieuKiemKeId: phieuId, sanPhamId } },
    })
    if (!line) throw new NotFoundError('Không tìm thấy dòng kiểm kê')

    await tx.chiTietPhieuKiemKe.update({
      where: { phieuKiemKeId_sanPhamId: { phieuKiemKeId: phieuId, sanPhamId } },
      data: {
        soLuongThucTe: input.soLuongThucTe,
        chenhLech: input.soLuongThucTe - line.soLuongHeThong,
        ghiChu: input.ghiChu ?? null,
      },
    })
  })
  return findById(phieuId)
}

async function gui(phieuId: string) {
  await prisma.$transaction(async (tx) => {
    const phieu = await lockPhieu(tx, phieuId)
    if (!phieu) throw new NotFoundError('Không tìm thấy phiếu kiểm kê')
    if (phieu.trangThai !== 'NHAP') {
      throw new ConflictError('Chỉ phiếu nháp (NHAP) mới có thể gửi duyệt')
    }
    const updated = await tx.phieuKiemKe.updateMany({
      where: { id: phieuId, trangThai: 'NHAP' },
      data: { trangThai: 'CHO_DUYET', ngayGui: new Date() },
    })
    if (updated.count !== 1) throw new ConflictError('Trạng thái phiếu đã thay đổi')
  })
  return findById(phieuId)
}

async function huy(phieuId: string) {
  await prisma.$transaction(async (tx) => {
    const phieu = await lockPhieu(tx, phieuId)
    if (!phieu) throw new NotFoundError('Không tìm thấy phiếu kiểm kê')
    if (phieu.trangThai === 'DA_DUYET') {
      throw new ConflictError('Phiếu đã duyệt không thể hủy')
    }
    if (phieu.trangThai === 'DA_HUY') throw new ConflictError('Phiếu đã bị hủy')
    if (!(OPEN as readonly string[]).includes(phieu.trangThai)) {
      throw new ConflictError('Phiếu bị từ chối phải chuyển về nháp trước khi hủy')
    }
    const updated = await tx.phieuKiemKe.updateMany({
      where: { id: phieuId, trangThai: { in: [...OPEN] } },
      data: { trangThai: 'DA_HUY' },
    })
    if (updated.count !== 1) throw new ConflictError('Trạng thái phiếu đã thay đổi')
  })
  return findById(phieuId)
}

/** UC09 — ADMIN duyệt: cộng chênh lệch vào tồn hiện tại, không gán đè. */
async function duyet(phieuId: string, taiKhoanId: string) {
  const id = await prisma.$transaction(async (tx) => {
    const phieu = await lockPhieu(tx, phieuId)
    if (!phieu) throw new NotFoundError('Không tìm thấy phiếu kiểm kê')
    if (phieu.trangThai !== 'CHO_DUYET') {
      throw new ConflictError('Phiếu không ở trạng thái chờ duyệt (có thể đã được xử lý)')
    }

    const lines = await tx.chiTietPhieuKiemKe.findMany({
      where: { phieuKiemKeId: phieuId },
      orderBy: { sanPhamId: 'asc' },
    })
    if (lines.length === 0) throw new ConflictError('Phiếu không có dòng để duyệt')

    const products = await lockSanPhams(tx, lines.map((line) => line.sanPhamId))
    if (products.size !== lines.length) {
      throw new NotFoundError('Sản phẩm trong phiếu không còn tồn tại')
    }

    // Kiểm tra trước toàn bộ: chỉ cần một dòng âm là hủy cả giao dịch.
    for (const line of lines) {
      const product = products.get(line.sanPhamId)!
      if (product.soLuongTon + line.chenhLech < 0) {
        throw new ConflictError(`Tồn kho sau kiểm kê bị âm cho sản phẩm ${product.maSp}`)
      }
    }

    const nguoiDuyetId = await nhanVienIdOf(tx, taiKhoanId)
    for (const line of lines) {
      if (line.chenhLech === 0) continue
      const product = products.get(line.sanPhamId)!
      const updated = await tx.sanPham.update({
        where: { id: line.sanPhamId },
        data: { soLuongTon: { increment: line.chenhLech } },
        select: { soLuongTon: true },
      })
      await tx.lichSuTonKho.create({
        data: {
          sanPhamId: line.sanPhamId,
          nguoiThucHienId: nguoiDuyetId,
          phieuKiemKeId: phieuId,
          loaiBienDong: 'KIEM_KE',
          soLuongThayDoi: line.chenhLech,
          soLuongTruoc: product.soLuongTon,
          soLuongSau: updated.soLuongTon,
        },
      })
    }

    const result = await tx.phieuKiemKe.updateMany({
      where: { id: phieuId, trangThai: 'CHO_DUYET' },
      data: { trangThai: 'DA_DUYET', nguoiDuyetId, ngayDuyet: new Date() },
    })
    if (result.count !== 1) throw new ConflictError('Phiếu đã được duyệt bởi yêu cầu khác')
    return phieuId
  })
  return findById(id)
}

/** UC09 — ADMIN từ chối: bắt buộc lý do, không đổi tồn. */
async function tuChoi(phieuId: string, input: TuChoiInput) {
  await prisma.$transaction(async (tx) => {
    const phieu = await lockPhieu(tx, phieuId)
    if (!phieu) throw new NotFoundError('Không tìm thấy phiếu kiểm kê')
    if (phieu.trangThai !== 'CHO_DUYET') {
      throw new ConflictError('Phiếu không ở trạng thái chờ duyệt (có thể đã được xử lý)')
    }
    const result = await tx.phieuKiemKe.updateMany({
      where: { id: phieuId, trangThai: 'CHO_DUYET' },
      data: { trangThai: 'TU_CHOI', lyDoTuChoi: input.lyDoTuChoi },
    })
    if (result.count !== 1) throw new ConflictError('Trạng thái phiếu đã thay đổi')
  })
  return findById(phieuId)
}

/** TU_CHOI → NHAP để nhân viên kho sửa và gửi lại. */
async function suaLai(phieuId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const phieu = await lockPhieu(tx, phieuId)
      if (!phieu) throw new NotFoundError('Không tìm thấy phiếu kiểm kê')
      if (phieu.trangThai !== 'TU_CHOI') {
        throw new ConflictError('Chỉ phiếu bị từ chối mới được chuyển về nháp')
      }
      await assertScopeAvailable(tx, phieu.danhMucId, phieuId)
      const result = await tx.phieuKiemKe.updateMany({
        where: { id: phieuId, trangThai: 'TU_CHOI' },
        data: { trangThai: 'NHAP', lyDoTuChoi: null },
      })
      if (result.count !== 1) throw new ConflictError('Trạng thái phiếu đã thay đổi')
    })
  } catch (error) {
    if (isExclusionViolation(error)) {
      throw new ConflictError('Đã có phiếu kiểm kê đang mở trùng phạm vi')
    }
    throw error
  }
  return findById(phieuId)
}

const INCLUDE = {
  danhMuc: { select: { tenDanhMuc: true } },
  nguoiLap: { select: { id: true, maNv: true, hoTen: true } },
  nguoiDuyet: { select: { id: true, maNv: true, hoTen: true } },
  chiTietPhieuKiemKes: {
    include: { sanPham: { select: { maSp: true, tenSp: true } } },
    orderBy: { sanPhamId: 'asc' as const },
  },
}

async function list(input: ListKiemKeInput) {
  const where = input.trangThai ? { trangThai: input.trangThai } : {}
  const [rows, total] = await Promise.all([
    prisma.phieuKiemKe.findMany({
      where,
      include: INCLUDE,
      orderBy: { ngayTao: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.phieuKiemKe.count({ where }),
  ])
  return {
    data: rows.map(toPhieuKiemKeDto),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    },
  }
}

async function findById(id: string) {
  const phieu = await prisma.phieuKiemKe.findUnique({ where: { id }, include: INCLUDE })
  if (!phieu) throw new NotFoundError('Không tìm thấy phiếu kiểm kê')
  return toPhieuKiemKeDto(phieu)
}

export const kiemKeService = { create, capNhatThucTe, gui, huy, duyet, tuChoi, suaLai, list, findById }
