import { z } from 'zod'

const normalizePhone = (value: string) => value.replace(/[\s().-]/g, '')
const isPhone = (value: string) => /^\+?\d{9,15}$/.test(normalizePhone(value))

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .max(50, 'Tên đăng nhập tối đa 50 ký tự')
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .max(72, 'Mật khẩu tối đa 72 ký tự'),
    xacNhatMatKhau: z.string().optional(),
    hoTen: z.string().trim().min(1, 'Họ tên không được để trống').max(100),
    email: z
      .string()
      .trim()
      .email('Email không hợp lệ')
      .max(255)
      .transform((value) => value.toLowerCase())
      .optional(),
    sdt: z
      .string()
      .trim()
      .refine(isPhone, 'Số điện thoại không hợp lệ')
      .transform(normalizePhone)
      .optional(),
  })
  .refine((data) => Boolean(data.email || data.sdt), {
    message: 'Phải cung cấp ít nhất email hoặc số điện thoại',
    path: ['email'],
  })
  .refine((data) => !data.xacNhatMatKhau || data.xacNhatMatKhau === data.password, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['xacNhatMatKhau'],
  })

/** Chấp nhận `dinhDanh` hoặc alias `username` / `email` / `sdt`. */
export const loginSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'object' || value === null) return value
    const input = value as Record<string, unknown>
    if (input.dinhDanh) return input
    return { ...input, dinhDanh: input.username ?? input.email ?? input.sdt }
  },
  z.object({
    dinhDanh: z.string().trim().min(1, 'Thiếu định danh đăng nhập'),
    matKhau: z.string().min(1, 'Thiếu mật khẩu'),
  }),
)

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
