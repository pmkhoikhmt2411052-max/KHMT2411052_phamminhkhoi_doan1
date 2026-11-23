/** Bảng chuyển dùng cho SQL translate(): mọi nguyên âm tiếng Việt về a/e/i/o/u/y, đ → d. */
export const VIETNAMESE_FROM =
  'aàáảãạăằắẳẵặâầấẩẫậ' +
  'đ' +
  'eèéẻẽẹêềếểễệ' +
  'iìíỉĩị' +
  'oòóỏõọôồốổỗộơờớởỡợ' +
  'uùúủũụưừứửữự' +
  'yỳýỷỹỵ'

export const VIETNAMESE_TO =
  'a'.repeat(18) +
  'd' +
  'e'.repeat(12) +
  'i'.repeat(6) +
  'o'.repeat(18) +
  'u'.repeat(12) +
  'y'.repeat(6)

/** Chuẩn hóa chuỗi tìm kiếm: bỏ dấu tiếng Việt, về chữ thường. */
export function normalizeVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
}
