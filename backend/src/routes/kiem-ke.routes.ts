import { Router } from 'express'
import { kiemKeController } from '../controllers/kiem-ke.controller'
import { ROLE } from '../constants/roles'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireRole } from '../middlewares/require-role.middleware'

/** UC08 — lập phiếu kiểm kê (Nhân viên kho; ADMIN theo yêu cầu dự án). */
export const kiemKeRouter = Router()

kiemKeRouter.use(authenticate, requireRole(ROLE.NHAN_VIEN_KHO, ROLE.ADMIN))

kiemKeRouter.get('/', kiemKeController.danhSach)
kiemKeRouter.post('/', kiemKeController.tao)
kiemKeRouter.get('/:id', kiemKeController.chiTiet)
kiemKeRouter.patch('/:id/chi-tiet/:sanPhamId', kiemKeController.capNhatThucTe)
kiemKeRouter.post('/:id/gui', kiemKeController.gui)
kiemKeRouter.post('/:id/huy', kiemKeController.huy)
kiemKeRouter.post('/:id/sua-lai', kiemKeController.suaLai)
