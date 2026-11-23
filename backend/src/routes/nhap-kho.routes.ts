import { Router } from 'express'
import { nhapKhoController } from '../controllers/nhap-kho.controller'
import { ROLE } from '../constants/roles'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireRole } from '../middlewares/require-role.middleware'

/**
 * UC06 — lập phiếu nhập kho (Nhân viên kho; ADMIN theo yêu cầu dự án).
 * Bước này chưa cộng tồn: chỉ lưu phiếu + tính tiền.
 */
export const nhapKhoRouter = Router()

nhapKhoRouter.use(authenticate, requireRole(ROLE.NHAN_VIEN_KHO, ROLE.ADMIN))

nhapKhoRouter.get('/', nhapKhoController.danhSach)
nhapKhoRouter.post('/', nhapKhoController.tao)
nhapKhoRouter.get('/:id', nhapKhoController.chiTiet)
nhapKhoRouter.post('/:id/chi-tiet', nhapKhoController.themChiTiet)
nhapKhoRouter.patch('/:id/chi-tiet/:sanPhamId', nhapKhoController.suaChiTiet)
