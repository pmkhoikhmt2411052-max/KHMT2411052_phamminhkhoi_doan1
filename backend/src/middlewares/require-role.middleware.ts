import type { RequestHandler } from 'express'
import type { Role } from '../constants/roles'
import { ForbiddenError, UnauthorizedError } from '../errors/app-error'

/**
 * Kiểm tra vai trò sau khi đã đi qua `authenticate`.
 * So sánh theo `ma_vai_tro` (đã được authenticate lấy từ bảng VaiTro).
 * - Chưa xác thực → 401
 * - Sai vai trò   → 403
 */
export function requireRole(...roles: Role[]): RequestHandler {
  const allowed = new Set<Role>(roles)
  return (req, _res, next) => {
    if (!req.authUser) {
      next(new UnauthorizedError())
      return
    }
    if (!allowed.has(req.authUser.vaiTro)) {
      next(new ForbiddenError())
      return
    }
    next()
  }
}
