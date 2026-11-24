import { Router } from 'express'
import { posController } from '../controllers/pos.controller'
import { ROLE } from '../constants/roles'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireActiveStaff } from '../middlewares/require-active-staff.middleware'
import { requireRole } from '../middlewares/require-role.middleware'

/** UC02/UC04/UC05 — tra cứu, báo giá và chốt đơn POS (thu ngân; ADMIN theo yêu cầu dự án). */
export const posRouter = Router()

posRouter.use(authenticate, requireRole(ROLE.THU_NGAN, ROLE.ADMIN), requireActiveStaff)

posRouter.get('/san-pham', posController.traCuu)
posRouter.post('/bao-gia', posController.baoGia)
posRouter.post('/chot-don', posController.chotDon)
