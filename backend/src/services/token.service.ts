import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env'
import { ROLE_VALUES, type Role } from '../constants/roles'
import { UnauthorizedError } from '../errors/app-error'

export interface AccessTokenPayload {
  id: string
  username: string
  vaiTro: Role
}

const payloadSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1),
  vaiTro: z.enum(ROLE_VALUES),
})

/** Ký token với HS256. Không đưa password_hash hay dữ liệu nhạy cảm vào payload. */
export function signAccessToken(payload: AccessTokenPayload): string {
  const options = {
    algorithm: 'HS256' as const,
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions
  return jwt.sign(payload, env.JWT_SECRET, options)
}

/** Chỉ chấp nhận HS256; từ chối token ký bằng thuật toán khác (kể cả 'none'). */
export function verifyAccessToken(token: string): AccessTokenPayload {
  let decoded: unknown
  try {
    decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] })
  } catch {
    throw new UnauthorizedError()
  }

  const parsed = payloadSchema.safeParse(decoded)
  if (!parsed.success) {
    throw new UnauthorizedError()
  }
  return parsed.data
}
