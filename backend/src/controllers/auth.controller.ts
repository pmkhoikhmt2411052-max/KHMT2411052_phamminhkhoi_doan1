import { authService } from '../services/auth.service'
import { loginSchema, registerSchema } from '../validators/auth.validator'
import { asyncHandler } from '../utils/async-handler'

export const authController = {
  dangKy: asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body)
    const result = await authService.register(input)
    res.status(201).json(result)
  }),

  dangNhap: asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body)
    const result = await authService.login(input)
    res.status(200).json(result)
  }),

  toi: asyncHandler(async (req, res) => {
    const result = await authService.getMe(req.authUser!.id)
    res.status(200).json(result)
  }),
}
