import { prisma } from '../config/prisma'
import { toSanPhamAdminDto } from '../dtos/catalog.dto'
import { AppError, ConflictError, NotFoundError } from '../errors/app-error'
import type {
  CreateSanPhamInput,
  ThanhPhanInput,
  UpdateSanPhamInput,
} from '../validators/admin-catalog.validator'

type Db = Pick<typeof prisma, 'sanPham' | 'danhMuc' | 'thanhPhanCombo'>

async function assertDanhMucExists(db: Db, danhMucId: number): Promise<void> {
  const danhMuc = await db.danhMuc.findUnique({ where: { danhMucId } })
  if (!danhMuc) throw new NotFoundError('Danh mục không tồn tại')
}

async function assertUnique(
  db: Db,
  input: { maSp?: string; isbn?: string | null },
  excludeId?: string,
): Promise<void> {
  const notId = excludeId ? { id: { not: excludeId } } : {}
  if (input.maSp !== undefined) {
    const other = await db.sanPham.findFirst({ where: { maSp: input.maSp, ...notId } })
    if (other) throw new ConflictError('Mã sản phẩm đã tồn tại')
  }
  if (input.isbn) {
    const other = await db.sanPham.findFirst({ where: { isbn: input.isbn, ...notId } })
    if (other) throw new ConflictError('ISBN đã tồn tại')
  }
}

async function create(input: CreateSanPhamInput) {
  const created = await prisma.$transaction(async (tx) => {
    await assertDanhMucExists(tx, input.danhMucId)
    await assertUnique(tx, input)

    // Không truyền soLuongTon: CSDL mặc định 0.
    return tx.sanPham.create({
      data: {
        danhMucId: input.danhMucId,
        nhaCungCapId: input.nhaCungCapId ?? null,
        maSp: input.maSp,
        isbn: input.isbn ?? null,
        tenSp: input.tenSp,
        loaiSp: input.loaiSp,
        tacGia: input.tacGia ?? null,
        nhaXuatBan: input.nhaXuatBan ?? null,
        namXuatBan: input.namXuatBan ?? null,
        moTa: input.moTa ?? null,
        hinhAnh: input.hinhAnh ?? null,
        giaBan: input.giaBan,
        nguongTonToiThieu: input.nguongTonToiThieu,
        trangThai: input.trangThai,
      },
    })
  })
  return toSanPhamAdminDto(created)
}

async function update(id: string, input: UpdateSanPhamInput) {
  const existing = await prisma.sanPham.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Không tìm thấy sản phẩm')

  const updated = await prisma.$transaction(async (tx) => {
    if (input.danhMucId !== undefined) await assertDanhMucExists(tx, input.danhMucId)
    await assertUnique(tx, input, id)
    return tx.sanPham.update({ where: { id }, data: input })
  })
  return toSanPhamAdminDto(updated)
}

/** Thay toàn bộ thành phần của combo/bộ truyện trong một transaction. */
async function setThanhPhan(id: string, input: ThanhPhanInput) {
  return prisma.$transaction(async (tx) => {
    const sanPham = await tx.sanPham.findUnique({ where: { id } })
    if (!sanPham) throw new NotFoundError('Không tìm thấy sản phẩm')
    if (sanPham.loaiSp !== 'COMBO' && sanPham.loaiSp !== 'BO_TRUYEN') {
      throw new AppError(400, 'Chỉ combo/bộ truyện mới có thành phần', 'INVALID_PRODUCT_TYPE')
    }

    const ids = input.thanhPhan.map((item) => item.sanPhamId)
    if (new Set(ids).size !== ids.length) {
      throw new AppError(400, 'Thành phần bị trùng trong một combo', 'DUPLICATE_COMPONENT')
    }

    for (const item of input.thanhPhan) {
      if (item.sanPhamId === id) {
        throw new AppError(400, 'Combo không thể chứa chính nó', 'INVALID_COMPONENT')
      }
      const component = await tx.sanPham.findUnique({ where: { id: item.sanPhamId } })
      if (!component) throw new NotFoundError('Sản phẩm thành phần không tồn tại')
      if (component.loaiSp === 'COMBO' || component.loaiSp === 'BO_TRUYEN') {
        throw new AppError(400, 'Thành phần không được là combo/bộ truyện khác', 'INVALID_COMPONENT')
      }
    }

    await tx.thanhPhanCombo.deleteMany({ where: { comboId: id } })
    if (input.thanhPhan.length > 0) {
      await tx.thanhPhanCombo.createMany({
        data: input.thanhPhan.map((item) => ({
          comboId: id,
          sanPhamId: item.sanPhamId,
          soLuong: item.soLuong,
        })),
      })
    }

    const rows = await tx.thanhPhanCombo.findMany({
      where: { comboId: id },
      include: { sanPham: { select: { maSp: true, tenSp: true } } },
    })
    return {
      comboId: id,
      thanhPhan: rows.map((row) => ({
        sanPhamId: row.sanPhamId,
        maSp: row.sanPham.maSp,
        tenSp: row.sanPham.tenSp,
        soLuong: row.soLuong,
      })),
    }
  })
}

export const adminSanPhamService = { create, update, setThanhPhan }
