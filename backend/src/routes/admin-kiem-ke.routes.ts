import { Router } from 'express'
import { kiemKeController } from '../controllers/kiem-ke.controller'
import { ROLE } from '../constants/roles'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireRole } from '../middlewares/require-role.middleware'

/** UC09 — chỉ ADMIN được duyệt/từ chối phiếu kiểm kê. */
export const adminKiemKeRouter = Router()

adminKiemKeRouter.use(authenticate, requireRole(ROLE.ADMIN))

adminKiemKeRouter.post('/:id/duyet', kiemKeController.duyet)
adminKiemKeRouter.post('/:id/tu-choi', kiemKeController.tuChoi)
