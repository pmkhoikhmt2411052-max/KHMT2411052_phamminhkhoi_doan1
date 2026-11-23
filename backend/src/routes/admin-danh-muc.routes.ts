import { Router } from 'express'
import { adminDanhMucController } from '../controllers/admin-danh-muc.controller'
import { ROLE } from '../constants/roles'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireRole } from '../middlewares/require-role.middleware'

/** UC15 — chỉ ADMIN. */
export const adminDanhMucRouter = Router()

adminDanhMucRouter.use(authenticate, requireRole(ROLE.ADMIN))

adminDanhMucRouter.post('/', adminDanhMucController.tao)
adminDanhMucRouter.patch('/:id', adminDanhMucController.capNhat)
