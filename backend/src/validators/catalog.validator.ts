import { z } from 'zod'

export const LOAI_SAN_PHAM_VALUES = [
  'SACH',
  'TRUYEN_TRANH',
  'DO_DUNG_HOC_TAP',
  'BO_TRUYEN',
  'COMBO',
] as const

const SORT_VALUES = ['gia', 'ten', 'ngayTao'] as const

const listObject = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(60).default(12),
    q: z.string().trim().max(200).optional(),
    danhMucId: z.coerce.number().int().positive().optional(),
    loaiSp: z.enum(LOAI_SAN_PHAM_VALUES).optional(),
    sortBy: z.enum(SORT_VALUES).default('ngayTao'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  // Tham số lạ không được bỏ qua: trả 400.
  .strict()

/**
 * `sort` là tên tham số chính thức; `sortBy` giữ lại làm alias.
 * Sau khi gán alias thì xóa `sort` để object strict không coi là tham số lạ.
 */
export const listSanPhamSchema = z.preprocess((value) => {
  if (typeof value !== 'object' || value === null) return value
  const input = value as Record<string, unknown>
  const result = { ...input }
  if (result.sort !== undefined) {
    result.sortBy = result.sort
    delete result.sort
  }
  return result
}, listObject)

export const idParamSchema = z.object({
  id: z.string().uuid('id phải là UUID hợp lệ'),
})

export type ListSanPhamInput = z.infer<typeof listSanPhamSchema>
