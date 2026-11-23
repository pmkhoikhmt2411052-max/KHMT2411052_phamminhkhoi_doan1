import { Prisma } from '../../generated/prisma/client.ts'
import { prisma } from '../config/prisma'
import { toSanPhamChiTietDto, toSanPhamPublicDto } from '../dtos/catalog.dto'
import { NotFoundError } from '../errors/app-error'
import type { ListSanPhamInput } from '../validators/catalog.validator'
import { normalizeVietnamese, VIETNAMESE_FROM, VIETNAMESE_TO } from '../utils/text'

type SanPhamRow = {
  id: string
  ma_sp: string
  isbn: string | null
  ten_sp: string
  loai_sp: string
  tac_gia: string | null
  nha_xuat_ban: string | null
  nam_xuat_ban: number | null
  mo_ta: string | null
  hinh_anh: string | null
  gia_ban: unknown
  so_luong_ton: number
  danh_muc_id: number
  ngay_tao: Date
  danh_muc_ten: string
  danh_muc_slug: string
}

const SORT_COLUMNS = {
  gia: Prisma.sql`sp."gia_ban"`,
  ten: Prisma.sql`sp."ten_sp"`,
  ngayTao: Prisma.sql`sp."ngay_tao"`,
} as const

/** Lấy danh mục được yêu cầu + toàn bộ danh mục con (chỉ xét danh mục đang hoạt động). */
async function categoryIdsWithDescendants(rootId: number): Promise<number[]> {
  const categories = await prisma.danhMuc.findMany({
    where: { trangThai: 'HOAT_DONG' },
    select: { danhMucId: true, danhMucChaId: true },
  })
  if (!categories.some((category) => category.danhMucId === rootId)) return []

  const childrenByParent = new Map<number, number[]>()
  for (const category of categories) {
    if (category.danhMucChaId === null) continue
    const list = childrenByParent.get(category.danhMucChaId) ?? []
    list.push(category.danhMucId)
    childrenByParent.set(category.danhMucChaId, list)
  }

  const found = new Set<number>([rootId])
  const stack = [rootId]
  while (stack.length > 0) {
    const current = stack.pop()!
    for (const child of childrenByParent.get(current) ?? []) {
      if (!found.has(child)) {
        found.add(child)
        stack.push(child)
      }
    }
  }
  return [...found]
}

async function list(input: ListSanPhamInput) {
  const { page, pageSize, q, danhMucId, loaiSp, sortBy, order } = input

  if (danhMucId !== undefined) {
    const ids = await categoryIdsWithDescendants(danhMucId)
    if (ids.length === 0) {
      return { data: [], pagination: { page, pageSize, total: 0, totalPages: 0 } }
    }
    return query({ page, pageSize, q, categoryIds: ids, loaiSp, sortBy, order })
  }

  return query({ page, pageSize, q, categoryIds: undefined, loaiSp, sortBy, order })
}

async function query(options: {
  page: number
  pageSize: number
  q?: string
  categoryIds?: number[]
  loaiSp?: ListSanPhamInput['loaiSp']
  sortBy: ListSanPhamInput['sortBy']
  order: ListSanPhamInput['order']
}) {
  const conditions: Prisma.Sql[] = [Prisma.sql`sp."trang_thai" = 'DANG_BAN'`]

  if (options.q) {
    // Tên: dịch dấu tiếng Việt ở cả hai chiều (DB và chuỗi tìm kiếm).
    // Mã/ISBN/tác giả: so sánh thường hóa chữ thường.
    const pattern = `%${normalizeVietnamese(options.q)}%`
    conditions.push(Prisma.sql`(
      translate(lower(sp."ten_sp"), ${VIETNAMESE_FROM}, ${VIETNAMESE_TO}) LIKE ${pattern}
      OR translate(lower(coalesce(sp."tac_gia", '')), ${VIETNAMESE_FROM}, ${VIETNAMESE_TO}) LIKE ${pattern}
      OR lower(sp."ma_sp") LIKE ${pattern}
      OR lower(coalesce(sp."isbn", '')) LIKE ${pattern}
    )`)
  }
  if (options.categoryIds) {
    conditions.push(Prisma.sql`sp."danh_muc_id" IN (${Prisma.join(options.categoryIds)})`)
  }
  if (options.loaiSp) {
    conditions.push(Prisma.sql`sp."loai_sp" = ${options.loaiSp}`)
  }

  const where = Prisma.join(conditions, ' AND ')
  const direction = options.order === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`
  const orderBy = Prisma.sql`ORDER BY ${SORT_COLUMNS[options.sortBy]} ${direction}, sp."id" ASC`
  const offset = (options.page - 1) * options.pageSize

  const rows = await prisma.$queryRaw<SanPhamRow[]>(Prisma.sql`
    SELECT sp."id", sp."ma_sp", sp."isbn", sp."ten_sp", sp."loai_sp",
           sp."tac_gia", sp."nha_xuat_ban", sp."nam_xuat_ban", sp."mo_ta",
           sp."hinh_anh", sp."gia_ban", sp."so_luong_ton", sp."danh_muc_id",
           sp."ngay_tao", dm."ten_danh_muc" AS "danh_muc_ten",
           dm."slug" AS "danh_muc_slug"
    FROM "SanPham" sp
    JOIN "DanhMuc" dm ON dm."danh_muc_id" = sp."danh_muc_id"
    WHERE ${where}
    ${orderBy}
    LIMIT ${options.pageSize} OFFSET ${offset}
  `)

  const countRows = await prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
    SELECT COUNT(*)::int AS count FROM "SanPham" sp WHERE ${where}
  `)
  const total = countRows[0]?.count ?? 0

  return {
    data: rows.map((row) =>
      toSanPhamPublicDto({
        id: row.id,
        maSp: row.ma_sp,
        isbn: row.isbn,
        tenSp: row.ten_sp,
        loaiSp: row.loai_sp,
        tacGia: row.tac_gia,
        nhaXuatBan: row.nha_xuat_ban,
        namXuatBan: row.nam_xuat_ban,
        moTa: row.mo_ta,
        hinhAnh: row.hinh_anh,
        giaBan: row.gia_ban,
        soLuongTon: row.so_luong_ton,
        danhMucId: row.danh_muc_id,
        ngayTao: row.ngay_tao,
        danhMuc: { tenDanhMuc: row.danh_muc_ten, slug: row.danh_muc_slug },
      }),
    ),
    pagination: {
      page: options.page,
      pageSize: options.pageSize,
      total,
      totalPages: Math.ceil(total / options.pageSize),
    },
  }
}

async function findById(id: string) {
  const sanPham = await prisma.sanPham.findUnique({
    where: { id },
    include: {
      danhMuc: { select: { tenDanhMuc: true, slug: true } },
      thanhPhanComboCombo: {
        where: { sanPham: { trangThai: 'DANG_BAN' } },
        include: {
          sanPham: {
            select: {
              id: true,
              tenSp: true,
              maSp: true,
              giaBan: true,
              soLuongTon: true,
              hinhAnh: true,
            },
          },
        },
      },
    },
  })

  if (!sanPham || sanPham.trangThai !== 'DANG_BAN') {
    throw new NotFoundError('Không tìm thấy sản phẩm')
  }
  return toSanPhamChiTietDto(sanPham)
}

export const sanPhamService = { list, findById }
