import { Router } from 'express'
import { sanPhamController } from '../controllers/san-pham.controller'

/** API công khai UC11 — không cần đăng nhập. */
export const sanPhamRouter = Router()

sanPhamRouter.get('/', sanPhamController.danhSach)
sanPhamRouter.get('/:id', sanPhamController.chiTiet)
