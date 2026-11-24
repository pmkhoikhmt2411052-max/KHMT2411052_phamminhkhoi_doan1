/** Kiểm tra form thủ công (không dùng thư viện validate). */

type Validator = (_rule: unknown, value: unknown) => Promise<void>

const ok = (): Promise<void> => Promise.resolve()
const fail = (message: string): Promise<void> => Promise.reject(new Error(message))

export const requiredRule = (label: string) => ({
  validator: ((_rule, value) =>
    typeof value === 'string' && value.trim() ? ok() : fail(`Vui lòng nhập ${label}`)) as Validator,
})

export const minLengthRule = (label: string, min: number) => ({
  validator: ((_rule, value) =>
    typeof value === 'string' && value.length >= min
      ? ok()
      : fail(`${label} phải có ít nhất ${min} ký tự`)) as Validator,
})

export const emailRule = () => ({
  validator: ((_rule, value) => {
    if (value === undefined || value === null || String(value).trim() === '') return ok()
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
      ? ok()
      : fail('Email không hợp lệ')
  }) as Validator,
})

export const phoneRule = () => ({
  validator: ((_rule, value) => {
    if (value === undefined || value === null || String(value).trim() === '') return ok()
    return /^\+?\d{9,15}$/.test(String(value).replace(/[\s().-]/g, ''))
      ? ok()
      : fail('Số điện thoại không hợp lệ')
  }) as Validator,
})

/** Tiền: chuỗi thập phân tối đa 2 chữ số, lớn hơn 0. */
export const positiveMoneyRule = (label: string) => ({
  validator: ((_rule, value) => {
    const text = String(value ?? '').trim()
    return /^\d+(\.\d{1,2})?$/.test(text) && Number(text) > 0
      ? ok()
      : fail(`${label} phải là số lớn hơn 0, tối đa 2 chữ số thập phân`)
  }) as Validator,
})

export const idempotencyRule = () => ({
  validator: ((_rule, value) => {
    const text = String(value ?? '').trim()
    return text.length >= 1 && text.length <= 100 && /^[A-Za-z0-9._-]+$/.test(text)
      ? ok()
      : fail('Khóa giao dịch: 1–100 ký tự, chỉ dùng chữ, số, . _ -')
  }) as Validator,
})
