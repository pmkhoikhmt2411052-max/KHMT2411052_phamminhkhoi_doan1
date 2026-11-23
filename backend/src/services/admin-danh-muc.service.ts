import { prisma } from '../config/prisma'
import { toDanhMucAdminDto } from '../dtos/catalog.dto'
import { AppError, ConflictError, NotFoundError } from '../errors/app-error'
import type { CreateDanhMucInput, UpdateDanhMucInput } from '../validators/admin-catalog.validator'

type Db = Pick<typeof prisma, 'danhMuc'>

async function assertSlugAvailable(db: Db, slug: string, excludeId?: number): Promise<void> {
  const other = await db.danhMuc.findFirst({
    where: { slug, ...(excludeId !== undefined ? { danhMucId: { not: excludeId } } : {}) },
  })
  if (other) throw new ConflictError('Slug danh mục đã tồn tại')
}

/** Chặn tự làm cha và mọi trường hợp tạo chu trình cha-con. */
async function assertParentValid(db: Db, id: number | null, parentId: number | null): Promise<void> {
  if (parentId === null) return
  if (id !== null && parentId === id) {
    throw new AppError(400, 'Danh mục cha không được là chính nó', 'INVALID_PARENT')
  }

  let current: number | null = parentId
  const seen = new Set<number>()
  while (current !== null) {
    if (id !== null && current === id) {
      throw new AppError(400, 'Danh mục cha không được là danh mục con của nó', 'INVALID_PARENT')
    }
    if (seen.has(current)) break
    seen.add(current)

    const row: { danhMucChaId: number | null } | null = await db.danhMuc.findUnique({
      where: { danhMucId: current },
      select: { danhMucChaId: true },
    })
    if (!row) throw new NotFoundError('Danh mục cha không tồn tại')
    current = row.danhMucChaId
  }
}

async function create(input: CreateDanhMucInput) {
  const created = await prisma.$transaction(async (tx) => {
    await assertSlugAvailable(tx, input.slug)
    await assertParentValid(tx, null, input.danhMucChaId ?? null)
    return tx.danhMuc.create({
      data: {
        slug: input.slug,
        tenDanhMuc: input.tenDanhMuc,
        moTa: input.moTa ?? null,
        thuTu: input.thuTu,
        danhMucChaId: input.danhMucChaId ?? null,
        trangThai: input.trangThai,
      },
    })
  })
  return toDanhMucAdminDto(created)
}

async function update(id: number, input: UpdateDanhMucInput) {
  const existing = await prisma.danhMuc.findUnique({ where: { danhMucId: id } })
  if (!existing) throw new NotFoundError('Không tìm thấy danh mục')

  const updated = await prisma.$transaction(async (tx) => {
    if (input.slug !== undefined) await assertSlugAvailable(tx, input.slug, id)
    const parentId = input.danhMucChaId !== undefined ? input.danhMucChaId : existing.danhMucChaId
    await assertParentValid(tx, id, parentId)
    return tx.danhMuc.update({ where: { danhMucId: id }, data: input })
  })
  return toDanhMucAdminDto(updated)
}

export const adminDanhMucService = { create, update }
