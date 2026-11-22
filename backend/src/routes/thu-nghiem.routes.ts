import { Router } from 'express'
import { ROLE } from '../constants/roles'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireRole } from '../middlewares/require-role.middleware'
import { asyncHandler } from '../utils/async-handler'

/**
 * ⚠️ ROUTE TẠM — chỉ dùng để kiểm thử cơ chế RBAC.
 * Sẽ gỡ bỏ khi các API nghiệp vụ thật (UC01–UC17) được cài đặt xong.
 */
export const thuNghiemRouter = Router()

thuNghiemRouter.use(authenticate)

const ok = (tenRoute: string): ReturnType<typeof asyncHandler> =>
  asyncHandler(async (req, res) => {
    res.status(200).json({
      message: `Route thử nghiệm ${tenRoute}: hợp lệ`,
      vaiTro: req.authUser!.vaiTro,
    })
  })

thuNghiemRouter.get('/admin', requireRole(ROLE.ADMIN), ok('ADMIN'))
thuNghiemRouter.get('/thu-ngan', requireRole(ROLE.THU_NGAN), ok('THU_NGAN'))
thuNghiemRouter.get('/nhan-vien-kho', requireRole(ROLE.NHAN_VIEN_KHO), ok('NHAN_VIEN_KHO'))
thuNghiemRouter.get('/khach-hang', requireRole(ROLE.KHACH_HANG), ok('KHACH_HANG'))

// Route nhiều vai trò: ví dụ cho các API dùng chung (UC02 tra cứu SP cho thu ngân/kho/admin).
thuNghiemRouter.get(
  '/nhieu-vai-tro',
  requireRole(ROLE.ADMIN, ROLE.THU_NGAN, ROLE.NHAN_VIEN_KHO),
  ok('ADMIN | THU_NGAN | NHAN_VIEN_KHO'),
)
