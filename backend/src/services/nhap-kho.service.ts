import { randomUUID } from 'node:crypto'
import { Prisma } from '../../generated/prisma/client.ts'
import { prisma } from '../config/prisma'
import { toPhieuNhapDto } from '../dtos/nhap-kho.dto'
import { AppError, ConflictError, ForbiddenError, NotFoundError } from '../errors/app-error'
import type {
  ChiTietInput,
  CreatePhieuNhapInput,
  ListPhieuInput,
} from '../validators/nhap-kho.validator'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
const EDITABLE = ['NHAP', 'CHO_XAC_NHAN'] as const

function generateMaPn(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `PN-${date}-${randomUUID().slice(0, 6).toUpperCase()}`
}

function thanhTien(line: { soLuong: number; giaNhap: string }): string {
  return (line.soLuong * Number(line.giaNhap)).toFixed(2)
}

/** Khóa dòng phiếu để mọi thao tác ghi đều nối hàng với nhau. */
async function lockPhieu(tx: Tx, id: string): Promise<{ id: string; trangThai: string } | null> {
  const rows = await tx.$queryRaw<{ id: string; trangThai: string }[]>(Prisma.sql`
    SELECT "id", "trang_thai" AS "trangThai" FROM "PhieuNhapKho" WHERE "id" = ${id} FOR UPDATE
  `)
  return rows[0] ?? null
}

async function requireEditable(tx: Tx, id: string) {
  const phieu = await lockPhieu(tx, id)
  if (!phieu) throw new NotFoundError('Không tìm thấy phiếu nhập')
  if (!(EDITABLE as readonly string[]).includes(phieu.trangThai)) {
    throw new ConflictError('Phiếu đã được xác nhận hoặc đã hủy, không thể chỉnh sửa')
  }
  return phieu
}

/** Khóa sản phẩm theo thứ tự id tăng dần để tránh deadlock giữa các phiếu. */
async function lockSanPhams(
  tx: Tx,
  ids: string[],
): Promise<Map<string, number>> {
  const rows = await tx.$queryRaw<{ id: string; soLuongTon: number }[]>(Prisma.sql`
    SELECT "id", "so_luong_ton" AS "soLuongTon"
    FROM "SanPham"
    WHERE "id" IN (${Prisma.join(ids)})
    ORDER BY "id" ASC
    FOR UPDATE
  `)
  return new Map(rows.map((row) => [row.id, row.soLuongTon]))
}

async function assertSanPhamExists(tx: Tx, sanPhamId: string) {
  const sanPham = await tx.sanPham.findUnique({ where: { id: sanPhamId } })
  if (!sanPham) throw new NotFoundError('Sản phẩm không tồn tại')
}

async function recomputeTotal(tx: Tx, phieuId: string): Promise<void> {
  const sum = await tx.chiTietPhieuNhap.aggregate({
    where: { phieuNhapId: phieuId },
    _sum: { thanhTien: true },
  })
  await tx.phieuNhapKho.update({
    where: { id: phieuId },
    data: { tongTien: sum._sum.thanhTien ?? 0 },
  })
}

async function nhanVienIdOf(tx: Tx, taiKhoanId: string): Promise<string> {
  const nhanVien = await tx.nhanVien.findUnique({ where: { taiKhoanId } })
  if (!nhanVien) throw new ForbiddenError('Tài khoản không có hồ sơ nhân viên')
  return nhanVien.id
}

async function create(input: CreatePhieuNhapInput, taiKhoanId: string) {
  const ids = input.chiTiet.map((line) => line.sanPhamId)
  if (new Set(ids).size !== ids.length) {
    throw new AppError(400, 'Sản phẩm bị trùng trong phiếu nhập', 'DUPLICATE_LINE')
  }

  const phieuId = await prisma.$transaction(async (tx) => {
    const nguoiLapId = await nhanVienIdOf(tx, taiKhoanId)
    const supplier = await tx.nhaCungCap.findUnique({
      where: { nhaCungCapId: input.nhaCungCapId },
    })
    if (!supplier) throw new NotFoundError('Nhà cung cấp không tồn tại')
    for (const sanPhamId of ids) await assertSanPhamExists(tx, sanPhamId)

    const phieu = await tx.phieuNhapKho.create({
      data: {
        maPn: generateMaPn(),
        nhaCungCapId: input.nhaCungCapId,
        nguoiLapId,
        trangThai: input.trangThai,
        tongTien: 0,
        ngayNhap: input.ngayNhap,
        ghiChu: input.ghiChu ?? null,
      },
    })

    await tx.chiTietPhieuNhap.createMany({
      data: input.chiTiet.map((line) => ({
        phieuNhapId: phieu.id,
        sanPhamId: line.sanPhamId,
        soLuong: line.soLuong,
        giaNhap: line.giaNhap,
        thanhTien: thanhTien(line),
      })),
    })
    await recomputeTotal(tx, phieu.id)
    return phieu.id
  })

  return findById(phieuId)
}

async function upsertChiTiet(phieuId: string, line: ChiTietInput) {
  await prisma.$transaction(async (tx) => {
    await requireEditable(tx, phieuId)
    await assertSanPhamExists(tx, line.sanPhamId)

    const values = {
      soLuong: line.soLuong,
      giaNhap: line.giaNhap,
      thanhTien: thanhTien(line),
    }
    await tx.chiTietPhieuNhap.upsert({
      where: { phieuNhapId_sanPhamId: { phieuNhapId: phieuId, sanPhamId: line.sanPhamId } },
      create: { phieuNhapId: phieuId, sanPhamId: line.sanPhamId, ...values },
      update: values,
    })
    await recomputeTotal(tx, phieuId)
  })
  return findById(phieuId)
}

async function updateChiTiet(phieuId: string, sanPhamId: string, line: ChiTietInput) {
  if (line.sanPhamId !== sanPhamId) {
    throw new AppError(400, 'sanPhamId trong body phải khớp với URL', 'MISMATCH_SAN_PHAM')
  }
  await prisma.$transaction(async (tx) => {
    await requireEditable(tx, phieuId)
    const existing = await tx.chiTietPhieuNhap.findUnique({
      where: { phieuNhapId_sanPhamId: { phieuNhapId: phieuId, sanPhamId } },
    })
    if (!existing) throw new NotFoundError('Không tìm thấy dòng chi tiết')
    await tx.chiTietPhieuNhap.update({
      where: { phieuNhapId_sanPhamId: { phieuNhapId: phieuId, sanPhamId } },
      data: {
        soLuong: line.soLuong,
        giaNhap: line.giaNhap,
        thanhTien: thanhTien(line),
      },
    })
    await recomputeTotal(tx, phieuId)
  })
  return findById(phieuId)
}

async function xoaChiTiet(phieuId: string, sanPhamId: string) {
  await prisma.$transaction(async (tx) => {
    await requireEditable(tx, phieuId)
    const existing = await tx.chiTietPhieuNhap.findUnique({
      where: { phieuNhapId_sanPhamId: { phieuNhapId: phieuId, sanPhamId } },
    })
    if (!existing) throw new NotFoundError('Không tìm thấy dòng chi tiết')
    await tx.chiTietPhieuNhap.delete({
      where: { phieuNhapId_sanPhamId: { phieuNhapId: phieuId, sanPhamId } },
    })
    await recomputeTotal(tx, phieuId)
  })
  return findById(phieuId)
}

/** NHAP → CHO_XAC_NHAN (phải có ít nhất một dòng). */
async function gui(phieuId: string) {
  await prisma.$transaction(async (tx) => {
    const phieu = await lockPhieu(tx, phieuId)
    if (!phieu) throw new NotFoundError('Không tìm thấy phiếu nhập')
    if (phieu.trangThai !== 'NHAP') {
      throw new ConflictError('Chỉ phiếu nháp (NHAP) mới có thể gửi chờ xác nhận')
    }
    const count = await tx.chiTietPhieuNhap.count({ where: { phieuNhapId: phieuId } })
    if (count === 0) throw new ConflictError('Phiếu phải có ít nhất một dòng trước khi gửi')

    const updated = await tx.phieuNhapKho.updateMany({
      where: { id: phieuId, trangThai: 'NHAP' },
      data: { trangThai: 'CHO_XAC_NHAN' },
    })
    if (updated.count !== 1) throw new ConflictError('Trạng thái phiếu đã thay đổi')
  })
  return findById(phieuId)
}

/** Hủy phiếu chưa nhập; không đụng tới tồn kho. */
async function huy(phieuId: string) {
  await prisma.$transaction(async (tx) => {
    const phieu = await lockPhieu(tx, phieuId)
    if (!phieu) throw new NotFoundError('Không tìm thấy phiếu nhập')
    if (phieu.trangThai === 'DA_NHAP_KHO') {
      throw new ConflictError('Phiếu đã nhập kho không thể hủy')
    }
    if (phieu.trangThai === 'DA_HUY') {
      throw new ConflictError('Phiếu đã bị hủy')
    }
    const updated = await tx.phieuNhapKho.updateMany({
      where: { id: phieuId, trangThai: { in: [...EDITABLE] } },
      data: { trangThai: 'DA_HUY' },
    })
    if (updated.count !== 1) throw new ConflictError('Trạng thái phiếu đã thay đổi')
  })
  return findById(phieuId)
}

/** Xác nhận nhập kho: khóa phiếu, khóa SP theo id ASC, cộng tồn + ghi sổ trong 1 transaction. */
async function xacNhan(phieuId: string, taiKhoanId: string) {
  const id = await prisma.$transaction(async (tx) => {
    const phieu = await lockPhieu(tx, phieuId)
    if (!phieu) throw new NotFoundError('Không tìm thấy phiếu nhập')
    if (phieu.trangThai !== 'CHO_XAC_NHAN') {
      throw new ConflictError('Phiếu không ở trạng thái chờ xác nhận (có thể đã được xác nhận hoặc hủy)')
    }

    const lines = await tx.chiTietPhieuNhap.findMany({
      where: { phieuNhapId: phieuId },
      orderBy: { sanPhamId: 'asc' },
    })
    if (lines.length === 0) throw new ConflictError('Phiếu không có dòng để xác nhận')

    const beforeByProductId = await lockSanPhams(
      tx,
      lines.map((line) => line.sanPhamId),
    )
    if (beforeByProductId.size !== lines.length) {
      throw new NotFoundError('Sản phẩm trong phiếu không còn tồn tại')
    }
    const nguoiXacNhanId = await nhanVienIdOf(tx, taiKhoanId)

    for (const line of lines) {
      const soLuongTruoc = beforeByProductId.get(line.sanPhamId)!
      const updated = await tx.sanPham.update({
        where: { id: line.sanPhamId },
        data: { soLuongTon: { increment: line.soLuong } },
        select: { soLuongTon: true },
      })
      await tx.lichSuTonKho.create({
        data: {
          sanPhamId: line.sanPhamId,
          nguoiThucHienId: nguoiXacNhanId,
          phieuNhapId: phieuId,
          loaiBienDong: 'NHAP_KHO',
          soLuongThayDoi: line.soLuong,
          soLuongTruoc,
          soLuongSau: updated.soLuongTon,
        },
      })
    }

    const result = await tx.phieuNhapKho.updateMany({
      where: { id: phieuId, trangThai: 'CHO_XAC_NHAN' },
      data: {
        trangThai: 'DA_NHAP_KHO',
        nguoiXacNhanId,
        ngayXacNhan: new Date(),
      },
    })
    if (result.count !== 1) throw new ConflictError('Phiếu đã được xác nhận bởi yêu cầu khác')
    return phieuId
  })
  return findById(id)
}

async function list(input: ListPhieuInput) {
  const where = input.trangThai ? { trangThai: input.trangThai } : {}
  const [rows, total] = await Promise.all([
    prisma.phieuNhapKho.findMany({
      where,
      include: {
        nhaCungCap: { select: { maNcc: true, tenNhaCungCap: true } },
        nguoiLap: { select: { id: true, maNv: true, hoTen: true } },
        nguoiXacNhan: { select: { id: true, maNv: true, hoTen: true } },
        chiTietPhieuNhaps: { include: { sanPham: { select: { maSp: true, tenSp: true } } } },
      },
      orderBy: { ngayTao: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.phieuNhapKho.count({ where }),
  ])

  return {
    data: rows.map(toPhieuNhapDto),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    },
  }
}

async function findById(id: string) {
  const phieu = await prisma.phieuNhapKho.findUnique({
    where: { id },
    include: {
      nhaCungCap: { select: { maNcc: true, tenNhaCungCap: true } },
      nguoiLap: { select: { id: true, maNv: true, hoTen: true } },
      nguoiXacNhan: { select: { id: true, maNv: true, hoTen: true } },
      chiTietPhieuNhaps: { include: { sanPham: { select: { maSp: true, tenSp: true } } } },
    },
  })
  if (!phieu) throw new NotFoundError('Không tìm thấy phiếu nhập')
  return toPhieuNhapDto(phieu)
}

async function lichSuTonKho(sanPhamId: string, page: number, pageSize: number) {
  const where = { sanPhamId }
  const [rows, total] = await Promise.all([
    prisma.lichSuTonKho.findMany({
      where,
      include: { nguoiThucHien: { select: { id: true, hoTen: true } } },
      orderBy: [{ ngayTao: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lichSuTonKho.count({ where }),
  ])

  return {
    data: rows.map((row) => ({
      id: row.id,
      loaiBienDong: row.loaiBienDong,
      soLuongThayDoi: row.soLuongThayDoi,
      soLuongTruoc: row.soLuongTruoc,
      soLuongSau: row.soLuongSau,
      ngayTao: row.ngayTao,
      ghiChu: row.ghiChu,
      nguoiThucHien: row.nguoiThucHien,
      phieuNhapId: row.phieuNhapId,
      donHangId: row.donHangId,
      phieuKiemKeId: row.phieuKiemKeId,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  }
}

export const nhapKhoService = {
  create,
  upsertChiTiet,
  updateChiTiet,
  xoaChiTiet,
  gui,
  huy,
  xacNhan,
  list,
  findById,
  lichSuTonKho,
}
