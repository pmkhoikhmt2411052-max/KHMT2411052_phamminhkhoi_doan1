import { posService } from '../services/pos.service'
import { baoGiaSchema, traCuuSchema } from '../validators/pos.validator'
import { asyncHandler } from '../utils/async-handler'

export const posController = {
  traCuu: asyncHandler(async (req, res) => {
    const input = traCuuSchema.parse(req.query)
    res.status(200).json(await posService.traCuu(input))
  }),

  baoGia: asyncHandler(async (req, res) => {
    const input = baoGiaSchema.parse(req.body)
    res.status(200).json(await posService.baoGia(input))
  }),
}
