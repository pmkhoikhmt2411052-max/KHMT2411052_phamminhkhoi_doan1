import type { RequestHandler } from 'express'
import { prisma } from '../config/prisma'
import { ForbiddenError, UnauthorizedError } from '../errors/app-error'

/** Chặn POS khi hồ sơ nhân viên DA_NGHI (hoặc không có hồ sơ). */
export const requireActiveStaff: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.authUser) throw new UnauthorizedError()
    const nhanVien = await prisma.nhanVien.findUnique({
      where: { taiKhoanId: req.authUser.id },
    })
    if (!nhanVien || nhanVien.trangThai !== 'DANG_LAM') {
      throw new ForbiddenError('Nhân viên đã nghỉ hoặc không có hồ sơ, không dùng được POS')
    }
    next()
  } catch (error) {
    next(error)
  }
}
