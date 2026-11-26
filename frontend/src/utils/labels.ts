/** Dịch mã kỹ thuật từ API sang nhãn tiếng Việt trên hóa đơn. */

const ORDER_STATUS: Record<string, string> = {
  CHO_THANH_TOAN: 'Chờ thanh toán',
  DA_THANH_TOAN: 'Đã thanh toán',
  CHO_HOAN_TIEN: 'Chờ hoàn tiền',
  DA_HOAN_TIEN: 'Đã hoàn tiền',
  DA_HUY: 'Đã hủy',
}

const PAYMENT_METHOD: Record<string, string> = {
  TIEN_MAT: 'Tiền mặt',
  VNPAY: 'VNPAY',
}

const PAYMENT_STATUS: Record<string, string> = {
  CHO_XU_LY: 'Chờ xử lý',
  THANH_CONG: 'Thành công',
  THAT_BAI: 'Thất bại',
  DA_HOAN_TIEN: 'Đã hoàn tiền',
}

const CHANNEL: Record<string, string> = {
  POS: 'Tại quầy',
  ONLINE: 'Trực tuyến',
}

export function orderStatusLabel(code: string): string {
  return ORDER_STATUS[code] ?? code
}

export function paymentMethodLabel(code: string | null | undefined): string {
  return code ? (PAYMENT_METHOD[code] ?? code) : '—'
}

export function paymentStatusLabel(code: string | null | undefined): string {
  return code ? (PAYMENT_STATUS[code] ?? code) : '—'
}

export function channelLabel(code: string): string {
  return CHANNEL[code] ?? code
}
