import { z } from 'zod'
import { moneySchema } from './admin-catalog.validator'

export const chiTietSchema = z
  .object({
    sanPhamId: z.string().uuid(),
    soLuong: z.number().int().positive('Số lượng phải lớn hơn 0'),
    giaNhap: moneySchema.refine((value) => Number(value) >= 0, 'Giá nhập không được âm'),
  })
  .strict()

export const createPhieuNhapSchema = z
  .object({
    nhaCungCapId: z.number().int().positive(),
    ngayNhap: z.coerce.date({ message: 'Ngày nhập không hợp lệ' }),
    ghiChu: z.string().max(1000).nullish().transform((value) => (value === '' ? null : value)),
    trangThai: z.enum(['NHAP', 'CHO_XAC_NHAN']).default('CHO_XAC_NHAN'),
    chiTiet: z.array(chiTietSchema).min(1, 'Phiếu phải có ít nhất một dòng sản phẩm'),
  })
  .strict()

export const updateChiTietSchema = chiTietSchema

export const listPhieuSchema = z
  .object({
    trangThai: z.enum(['NHAP', 'CHO_XAC_NHAN', 'DA_NHAP_KHO', 'DA_HUY']).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(60).default(12),
  })
  .strict()

export const phieuIdParamSchema = z.object({
  id: z.string().uuid(),
})

export const sanPhamIdParamSchema = z.object({
  sanPhamId: z.string().uuid(),
})

export type CreatePhieuNhapInput = z.infer<typeof createPhieuNhapSchema>
export type ChiTietInput = z.infer<typeof chiTietSchema>
export type ListPhieuInput = z.infer<typeof listPhieuSchema>
