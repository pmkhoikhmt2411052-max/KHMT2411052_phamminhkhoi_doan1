import { prisma } from '../config/prisma'
import { AppError } from '../errors/app-error'
import { Decimal, roundToDong, toDecimal } from '../utils/money'

function min(a: Decimal, b: Decimal): Decimal {
  return a.lessThan(b) ? a : b
}

/**
 * Kiểm tra đủ 7 điều kiện voucher (docs/database-design.md 4.4) và tính số tiền giảm.
 * Dùng chung cho báo giá và chốt đơn; không ghi gì vào CSDL.
 */
export async function validateVoucher(options: {
  maVoucher: string
  kenh: 'POS' | 'ONLINE'
  tienHang: Decimal
  khachHangId?: string | null
  now?: Date
}) {
  const code = options.maVoucher.trim().toUpperCase()
  const voucher = await prisma.voucher.findUnique({ where: { maVoucher: code } })
  if (!voucher) throw new AppError(400, 'Mã voucher không tồn tại', 'VOUCHER_NOT_FOUND')

  const now = options.now ?? new Date()
  if (voucher.trangThai !== 'HOAT_DONG') {
    throw new AppError(400, 'Voucher không ở trạng thái hoạt động', 'VOUCHER_INACTIVE')
  }
  if (now < voucher.ngayBatDau) {
    throw new AppError(400, 'Voucher chưa đến ngày áp dụng', 'VOUCHER_NOT_STARTED')
  }
  if (now > voucher.ngayKetThuc) {
    throw new AppError(400, 'Voucher đã hết hạn', 'VOUCHER_EXPIRED')
  }
  if (voucher.soLuong !== null && voucher.daSuDung >= voucher.soLuong) {
    throw new AppError(400, 'Voucher đã hết lượt sử dụng', 'VOUCHER_OUT_OF_STOCK')
  }
  if (voucher.apDungKenh !== 'TAT_CA' && voucher.apDungKenh !== options.kenh) {
    throw new AppError(400, 'Voucher không áp dụng cho kênh bán này', 'VOUCHER_WRONG_CHANNEL')
  }
  if (options.tienHang.lessThan(voucher.giaTriDonToiThieu)) {
    throw new AppError(400, 'Đơn hàng chưa đạt giá trị tối thiểu của voucher', 'VOUCHER_MIN_ORDER')
  }
  if (voucher.gioiHanMoiKhach !== null && options.khachHangId) {
    const used = await prisma.voucherLuotDung.count({
      where: { voucherId: voucher.id, khachHangId: options.khachHangId },
    })
    if (used >= voucher.gioiHanMoiKhach) {
      throw new AppError(400, 'Khách đã dùng hết lượt voucher này', 'VOUCHER_PER_CUSTOMER_LIMIT')
    }
  }

  let discount: Decimal
  if (voucher.loaiGiam === 'PHAN_TRAM') {
    const percent = toDecimal(voucher.giaTri)
    if (percent.lessThan(0) || percent.greaterThan(100)) {
      throw new AppError(400, 'Voucher phần trăm phải nằm trong 0–100', 'VOUCHER_INVALID_PERCENT')
    }
    // Làm tròn về đồng nguyên, half-up.
    discount = roundToDong(options.tienHang.mul(percent).div(100))
    if (voucher.giamToiDa !== null) discount = min(discount, toDecimal(voucher.giamToiDa))
  } else {
    discount = toDecimal(voucher.giaTri)
  }
  discount = min(discount, options.tienHang)
  if (discount.lessThan(0)) discount = new Decimal(0)

  return { voucher, soTienGiam: discount }
}
