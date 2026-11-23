import { Router } from 'express'
import { adminSanPhamController } from '../controllers/admin-san-pham.controller'
import { ROLE } from '../constants/roles'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireRole } from '../middlewares/require-role.middleware'

/** UC15 — chỉ ADMIN. */
export const adminSanPhamRouter = Router()

adminSanPhamRouter.use(authenticate, requireRole(ROLE.ADMIN))

adminSanPhamRouter.post('/', adminSanPhamController.tao)
adminSanPhamRouter.patch('/:id', adminSanPhamController.capNhat)
adminSanPhamRouter.put('/:id/thanh-phan', adminSanPhamController.datThanhPhan)
