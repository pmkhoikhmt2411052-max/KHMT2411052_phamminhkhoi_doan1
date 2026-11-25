/** Múi giờ nghiệp vụ của BookMark (khớp POS_TIMEZONE ở backend). */
export const APP_TIMEZONE = 'Asia/Ho_Chi_Minh'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Định dạng tiền về chuỗi có đúng 2 chữ số thập phân, ví dụ "1.234.500,00 đ".
 * Backend luôn trả tiền dưới dạng chuỗi NUMERIC; không dùng số thực để tính tiền ở client.
 */
export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return `${moneyFormatter.format(amount)} đ`
}

const wholeFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

/** Chỉ đổi cách hiển thị trên trang sản phẩm: "35.000 đ" (không lẻ thập phân). */
export function formatMoneyWhole(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return `${wholeFormatter.format(amount)} đ`
}

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: APP_TIMEZONE,
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: APP_TIMEZONE,
  dateStyle: 'medium',
})

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return dateTimeFormatter.format(date)
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return dateFormatter.format(date)
}
