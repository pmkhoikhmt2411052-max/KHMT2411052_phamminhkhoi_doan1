import { Prisma } from '../../generated/prisma/client.ts'

/** Mọi phép tính tiền dùng Decimal (decimal.js), không dùng số thực. */
export const Decimal = Prisma.Decimal
export type Decimal = Prisma.Decimal

export function toDecimal(value: unknown): Decimal {
  return new Decimal(value as string | number | Decimal)
}

/** Luôn trả chuỗi đúng 2 chữ số thập phân. */
export function formatMoney(value: Decimal): string {
  return value.toFixed(2)
}

/** Làm tròn về đồng nguyên, half-up (cho voucher phần trăm). */
export function roundToDong(value: Decimal): Decimal {
  return value.toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
}

/** Định dạng ngày theo múi giờ cấu hình (dùng cho ma_dh). */
export function formatDateInTimezone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${get('year')}${get('month')}${get('day')}`
}
