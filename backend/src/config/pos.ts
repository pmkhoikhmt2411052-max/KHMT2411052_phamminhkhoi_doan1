import { env } from './env'

/** Hằng số nghiệp vụ POS đã được xác nhận ở bước 0. */
export const POS_CONFIG = {
  /** 1 điểm cho mỗi 10.000đ trên tong_tien (làm tròn xuống). */
  diemMoiTien: env.POS_DIEM_MOI_TIEN,
  /** 1 điểm = 100đ khi dùng. */
  giaTriDiem: env.POS_GIA_TRI_DIEM,
  /** Múi giờ cho ma_dh và so sánh ngày voucher. */
  timezone: env.POS_TIMEZONE,
} as const
