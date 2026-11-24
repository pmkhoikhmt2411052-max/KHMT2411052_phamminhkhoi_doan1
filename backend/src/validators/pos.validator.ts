import { z } from 'zod'
import { moneySchema } from './admin-catalog.validator'

export const traCuuSchema = z
  .object({
    q: z.string().trim().max(200).optional(),
    danhMucId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(60).default(12),
  })
  .strict()

export const baoGiaSchema = z
  .object({
    chiTiet: z
      .array(
        z
          .object({
            sanPhamId: z.string().uuid(),
            soLuong: z.number().int().positive(),
          })
          .strict(),
      )
      .min(1, 'Đơn phải có ít nhất một dòng'),
    maVoucher: z.string().trim().max(50).optional(),
    diemSuDung: z.number().int().nonnegative().default(0),
    khachHangId: z.string().uuid().optional(),
    sdt: z.string().trim().max(20).optional(),
  })
  .strict()

export type TraCuuInput = z.infer<typeof traCuuSchema>
export type BaoGiaInput = z.infer<typeof baoGiaSchema>

/**
 * UC05 — chốt đơn POS. Kế thừa báo giá (strict), thêm tiền khách đưa và khóa idempotency.
 * Schema strict như các API khác: mọi trường lạ (tongTien, donGia, thanhTien, ...) → 400.
 * Mọi khoản tiền vẫn do server tính lại từ CSDL trong transaction, không tin client.
 */
export const chotDonSchema = baoGiaSchema
  .extend({
    tienKhachDua: moneySchema,
    idempotencyKey: z.string().trim().min(1).max(100).optional(),
  })
  .strict()

export type ChotDonInput = z.infer<typeof chotDonSchema>

/** Xem hóa đơn / danh sách đơn của thu ngân. */
export const donHangIdParamSchema = z.object({ id: z.string().uuid() })

export const listDonHangSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(60).default(12),
    trangThai: z.enum(['CHO_THANH_TOAN', 'DA_THANH_TOAN', 'CHO_HOAN_TIEN', 'DA_HOAN_TIEN', 'DA_HUY']).optional(),
    maDh: z.string().trim().max(30).optional(),
    tuNgay: z.coerce.date().optional(),
    denNgay: z.coerce.date().optional(),
  })
  .strict()

export type ListDonHangInput = z.infer<typeof listDonHangSchema>
