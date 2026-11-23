import 'dotenv/config'
import { z } from 'zod'

// Chỉ đọc tên biến và kiểm tra giá trị; không bao giờ in nội dung file .env.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().min(1, 'Thiếu DATABASE_URL'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET phải có ít nhất 16 ký tự'),
  JWT_EXPIRES_IN: z.string().min(1, 'Thiếu JWT_EXPIRES_IN').default('1d'),
  // Cấu hình POS/điểm — tập trung một chỗ, không rải rác trong code.
  POS_DIEM_MOI_TIEN: z.coerce.number().int().positive().default(10000),
  POS_GIA_TRI_DIEM: z.coerce.number().int().positive().default(100),
  POS_TIMEZONE: z.string().min(1).default('Asia/Ho_Chi_Minh'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const messages = parsed.error.issues.map((issue) => issue.message).join('; ')
  // Không log giá trị biến môi trường, chỉ log tên/mô tả lỗi.
  throw new Error(`Cấu hình môi trường không hợp lệ: ${messages}`)
}

export const env = parsed.data
