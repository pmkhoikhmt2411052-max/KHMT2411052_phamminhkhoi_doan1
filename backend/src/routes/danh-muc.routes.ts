import { Router } from 'express'
import { danhMucController } from '../controllers/danh-muc.controller'

/** API công khai UC11 — không cần đăng nhập. */
export const danhMucRouter = Router()

danhMucRouter.get('/', danhMucController.cay)
