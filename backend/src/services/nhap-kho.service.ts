import { randomUUID } from 'node:crypto'
import { prisma } from '../config/prisma'
import { toPhieuNhapDto } from '../dtos/nhap-kho.dto'
import { AppError, ConflictError, ForbiddenError, NotFoundError } from '../errors/app-error'
import type {
  ChiTietInput,
  CreatePhieuNhapInput,
  ListPhieuInput,
} from '../validators/nhap-kho.validator'

type Db = Pick<typeof prisma, 'chiTietPhieuNhap' | 'phieuNhapKho' | 'sanPham' | 'nhanVien'>
const EDITABLE = ['NHAP', 'CHO_XAC_NHAN'] as const

function generateMaPn(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `PN-${date}-${randomUUID().slice(0, 6).toUpperCase()}`
}

function thanhTien(line: { soLuong: number; giaNhap: string }): string {
  return (line.soLuong * Number(line.giaNhap)).toFixed(2)
}

async function assertEditable(db: Db, phieuId: string) {
  const phieu = await db.phieuNhapKho.findUnique({ where: { id: phieuId } })
  if (!phieu) throw new NotFoundError('Không tìm thấy phiếu nhập')
  if (!(EDITABLE as readonly string[]).includes(phieu.trangThai)) {
    throw new ConflictError('Phiếu đã được xác nhận hoặc đã hủy, không thể chỉnh sửa')
  }
  return phieu
}

async function assertSanPhamExists(db: Db, sanPhamId: string) {
  const sanPham = await db.sanPham.findUnique({ where: { id: sanPhamId } })
  if (!sanPham) throw new NotFoundError('Sản phẩm không tồn tại')
}

async function recomputeTotal(db: Db, phieuId: string): Promise<void> {
  const sum = await db.chiTietPhieuNhap.aggregate({
    where: { phieuNhapId: phieuId },
    _sum: { thanhTien: true },
  })
  await db.phieuNhapKho.update({
    where: { id: phieuId },
    data: { tongTien: sum._sum.thanhTien ?? 0 },
  })
}

async function assertNhanVien(db: Db, taiKhoanId: string): Promise<string> {
  const nhanVien = await db.nhanVien.findUnique({ where: { taiKhoanId } })
  if (!nhanVien) throw new ForbiddenError('Tài khoản không có hồ sơ nhân viên')
  return nhanVien.id
}

async function create(input: CreatePhieuNhapInput, taiKhoanId: string) {
  const ids = input.chiTiet.map((line) => line.sanPhamId)
  if (new Set(ids).size !== ids.length) {
    throw new AppError(400, 'Sản phẩm bị trùng trong phiếu nhập', 'DUPLICATE_LINE')
  }

  const phieuId = await prisma.$transaction(async (tx) => {
    const nguoiLapId = await assertNhanVien(tx, taiKhoanId)
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
    await assertEditable(tx, phieuId)
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
    await assertEditable(tx, phieuId)
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

export const nhapKhoService = { create, upsertChiTiet, updateChiTiet, list, findById }
