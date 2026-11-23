import { sanPhamService } from '../services/san-pham.service'
import { idParamSchema, listSanPhamSchema } from '../validators/catalog.validator'
import { asyncHandler } from '../utils/async-handler'

export const sanPhamController = {
  danhSach: asyncHandler(async (req, res) => {
    const input = listSanPhamSchema.parse(req.query)
    res.status(200).json(await sanPhamService.list(input))
  }),

  chiTiet: asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    res.status(200).json(await sanPhamService.findById(id))
  }),
}
