import { adminSanPhamService } from '../services/admin-san-pham.service'
import { idParamSchema } from '../validators/catalog.validator'
import {
  createSanPhamSchema,
  thanhPhanSchema,
  updateSanPhamSchema,
} from '../validators/admin-catalog.validator'
import { asyncHandler } from '../utils/async-handler'

export const adminSanPhamController = {
  tao: asyncHandler(async (req, res) => {
    const input = createSanPhamSchema.parse(req.body)
    res.status(201).json(await adminSanPhamService.create(input))
  }),

  capNhat: asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    const input = updateSanPhamSchema.parse(req.body)
    res.status(200).json(await adminSanPhamService.update(id, input))
  }),

  datThanhPhan: asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    const input = thanhPhanSchema.parse(req.body)
    res.status(200).json(await adminSanPhamService.setThanhPhan(id, input))
  }),
}
