import type { RequestHandler } from 'express'
import { prisma } from '../config/prisma'
import type { Role } from '../constants/roles'
import { UnauthorizedError } from '../errors/app-error'
import { verifyAccessToken } from '../services/token.service'

/** Xác thực JWT và gắn thông tin tài khoản vào req.authUser. */
export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization
    if (!header || !/^Bearer\s+/i.test(header)) {
      throw new UnauthorizedError()
    }

    const payload = verifyAccessToken(header.replace(/^Bearer\s+/i, '').trim())

    const account = await prisma.taiKhoan.findUnique({
      where: { id: payload.id },
      include: { vaiTro: true },
    })

    // Từ chối nếu tài khoản bị khóa hoặc vai trò đã đổi sau khi cấp token.
    if (
      !account ||
      account.trangThai === 'BI_KHOA' ||
      account.vaiTro.maVaiTro !== payload.vaiTro
    ) {
      throw new UnauthorizedError()
    }

    req.authUser = {
      id: account.id,
      username: account.username,
      vaiTro: account.vaiTro.maVaiTro as Role,
      trangThai: account.trangThai,
    }
    next()
  } catch (error) {
    next(error)
  }
}
