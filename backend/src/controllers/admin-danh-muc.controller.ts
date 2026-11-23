import { adminDanhMucService } from '../services/admin-danh-muc.service'
import {
  createDanhMucSchema,
  danhMucIdParamSchema,
  updateDanhMucSchema,
} from '../validators/admin-catalog.validator'
import { asyncHandler } from '../utils/async-handler'

export const adminDanhMucController = {
  tao: asyncHandler(async (req, res) => {
    const input = createDanhMucSchema.parse(req.body)
    res.status(201).json(await adminDanhMucService.create(input))
  }),

  capNhat: asyncHandler(async (req, res) => {
    const { id } = danhMucIdParamSchema.parse(req.params)
    const input = updateDanhMucSchema.parse(req.body)
    res.status(200).json(await adminDanhMucService.update(id, input))
  }),
}
