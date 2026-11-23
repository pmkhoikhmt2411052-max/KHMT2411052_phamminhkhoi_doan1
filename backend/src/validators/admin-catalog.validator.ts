import { z } from 'zod'
import { LOAI_SAN_PHAM_VALUES } from './catalog.validator'

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value === '' ? null : value))

/** Tiền: chấp nhận số hoặc chuỗi thập phân, luôn chuẩn hóa về chuỗi 2 chữ số. */
export const moneySchema = z
  .union([
    z
      .number()
      .finite()
      .nonnegative()
      .refine((value) => Number.isInteger(value * 100), 'Giá tối đa 2 chữ số thập phân'),
    z.string().trim().regex(/^\d+(\.\d{1,2})?$/, 'Giá không hợp lệ'),
  ])
  .transform((value) => (typeof value === 'number' ? value.toFixed(2) : value))

export const createSanPhamSchema = z
  .object({
    danhMucId: z.number().int().positive(),
    nhaCungCapId: z.number().int().positive().nullish(),
    maSp: z.string().trim().min(1).max(50),
    isbn: nullableText(20),
    tenSp: z.string().trim().min(1).max(200),
    loaiSp: z.enum(LOAI_SAN_PHAM_VALUES),
    tacGia: nullableText(200),
    nhaXuatBan: nullableText(200),
    namXuatBan: z.number().int().nullish(),
    moTa: z.string().max(2000).nullish(),
    hinhAnh: nullableText(500),
    giaBan: moneySchema,
    nguongTonToiThieu: z.number().int().nonnegative().default(0),
    trangThai: z.enum(['DANG_BAN', 'NGUNG_BAN']).default('DANG_BAN'),
  })
  // Không có so_luong_ton: field lạ (kể cả soLuongTon) bị từ chối.
  .strict()

export const updateSanPhamSchema = createSanPhamSchema.partial().strict()

export const createDanhMucSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'slug chỉ gồm chữ thường, số và dấu gạch ngang'),
    tenDanhMuc: z.string().trim().min(1).max(100),
    moTa: nullableText(500),
    thuTu: z.number().int().default(0),
    danhMucChaId: z.number().int().positive().nullish(),
    trangThai: z.enum(['HOAT_DONG', 'TAM_AN']).default('HOAT_DONG'),
  })
  .strict()

export const updateDanhMucSchema = createDanhMucSchema.partial().strict()

export const thanhPhanSchema = z
  .object({
    thanhPhan: z
      .array(
        z
          .object({
            sanPhamId: z.string().uuid(),
            soLuong: z.number().int().positive(),
          })
          .strict(),
      )
      .max(100),
  })
  .strict()

export const danhMucIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export type CreateSanPhamInput = z.infer<typeof createSanPhamSchema>
export type UpdateSanPhamInput = z.infer<typeof updateSanPhamSchema>
export type CreateDanhMucInput = z.infer<typeof createDanhMucSchema>
export type UpdateDanhMucInput = z.infer<typeof updateDanhMucSchema>
export type ThanhPhanInput = z.infer<typeof thanhPhanSchema>
