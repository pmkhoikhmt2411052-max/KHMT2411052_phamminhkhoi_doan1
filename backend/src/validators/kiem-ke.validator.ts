import { z } from 'zod'

export const createKiemKeSchema = z
  .object({
    // null = toàn cửa hàng; một id = đúng danh mục đó (không gồm con — xem docs/api.md).
    danhMucId: z.number().int().positive().nullish(),
    ghiChu: z.string().max(1000).nullish().transform((value) => (value === '' ? null : value)),
  })
  .strict()

export const chiTietKiemKeSchema = z
  .object({
    soLuongThucTe: z.number().int().nonnegative('Số lượng thực tế không được âm'),
    ghiChu: z.string().max(1000).nullish().transform((value) => (value === '' ? null : value)),
  })
  .strict()

export const tuChoiSchema = z
  .object({
    lyDoTuChoi: z.string().trim().min(1, 'Bắt buộc nhập lý do từ chối').max(500),
  })
  .strict()

export const listKiemKeSchema = z
  .object({
    trangThai: z.enum(['NHAP', 'CHO_DUYET', 'DA_DUYET', 'TU_CHOI', 'DA_HUY']).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(60).default(12),
  })
  .strict()

export const kiemKeIdParamSchema = z.object({ id: z.string().uuid() })
export const sanPhamIdParamSchema = z.object({ sanPhamId: z.string().uuid() })

export type CreateKiemKeInput = z.infer<typeof createKiemKeSchema>
export type ChiTietKiemKeInput = z.infer<typeof chiTietKiemKeSchema>
export type TuChoiInput = z.infer<typeof tuChoiSchema>
export type ListKiemKeInput = z.infer<typeof listKiemKeSchema>
