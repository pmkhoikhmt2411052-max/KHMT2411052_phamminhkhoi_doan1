import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/authenticate.middleware'

export const authRouter = Router()

authRouter.post('/dang-ky', authController.dangKy)
authRouter.post('/dang-nhap', authController.dangNhap)
authRouter.get('/toi', authenticate, authController.toi)
