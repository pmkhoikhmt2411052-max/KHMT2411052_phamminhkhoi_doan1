import { Router } from 'express'
import { nhapKhoController } from '../controllers/nhap-kho.controller'
import { ROLE } from '../constants/roles'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireRole } from '../middlewares/require-role.middleware'

/** UC06/UC07 — lập, xác nhận và theo dõi phiếu nhập kho. */
export const nhapKhoRouter = Router()

nhapKhoRouter.use(authenticate, requireRole(ROLE.NHAN_VIEN_KHO, ROLE.ADMIN))

// Đường dẫn tĩnh phải đứng trước '/:id'.
nhapKhoRouter.get('/', nhapKhoController.danhSach)
nhapKhoRouter.post('/', nhapKhoController.tao)
nhapKhoRouter.get('/lich-su-ton-kho/:sanPhamId', nhapKhoController.lichSuTonKho)

nhapKhoRouter.get('/:id', nhapKhoController.chiTiet)
nhapKhoRouter.post('/:id/gui', nhapKhoController.gui)
nhapKhoRouter.post('/:id/huy', nhapKhoController.huy)
nhapKhoRouter.post('/:id/xac-nhan', nhapKhoController.xacNhan)
nhapKhoRouter.post('/:id/chi-tiet', nhapKhoController.themChiTiet)
nhapKhoRouter.patch('/:id/chi-tiet/:sanPhamId', nhapKhoController.suaChiTiet)
nhapKhoRouter.delete('/:id/chi-tiet/:sanPhamId', nhapKhoController.xoaChiTiet)
