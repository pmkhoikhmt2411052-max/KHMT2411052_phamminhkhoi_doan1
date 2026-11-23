import { z } from 'zod'

export const LOAI_SAN_PHAM_VALUES = [
  'SACH',
  'TRUYEN_TRANH',
  'DO_DUNG_HOC_TAP',
  'BO_TRUYEN',
  'COMBO',
] as const

export const listSanPhamSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(60).default(12),
  q: z.string().trim().max(200).optional(),
  danhMucId: z.coerce.number().int().positive().optional(),
  loaiSp: z.enum(LOAI_SAN_PHAM_VALUES).optional(),
  sortBy: z.enum(['gia', 'ten', 'ngayTao']).default('ngayTao'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const idParamSchema = z.object({
  id: z.string().uuid('id phải là UUID hợp lệ'),
})

export type ListSanPhamInput = z.infer<typeof listSanPhamSchema>
