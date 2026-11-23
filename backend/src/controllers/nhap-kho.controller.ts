import { nhapKhoService } from '../services/nhap-kho.service'
import {
  chiTietSchema,
  createPhieuNhapSchema,
  listPhieuSchema,
  phieuIdParamSchema,
  sanPhamIdParamSchema,
} from '../validators/nhap-kho.validator'
import { asyncHandler } from '../utils/async-handler'

export const nhapKhoController = {
  tao: asyncHandler(async (req, res) => {
    const input = createPhieuNhapSchema.parse(req.body)
    res.status(201).json(await nhapKhoService.create(input, req.authUser!.id))
  }),

  themChiTiet: asyncHandler(async (req, res) => {
    const { id } = phieuIdParamSchema.parse(req.params)
    const line = chiTietSchema.parse(req.body)
    res.status(200).json(await nhapKhoService.upsertChiTiet(id, line))
  }),

  suaChiTiet: asyncHandler(async (req, res) => {
    const { id, sanPhamId } = { ...phieuIdParamSchema.parse(req.params), ...sanPhamIdParamSchema.parse(req.params) }
    const line = chiTietSchema.parse(req.body)
    res.status(200).json(await nhapKhoService.updateChiTiet(id, sanPhamId, line))
  }),

  danhSach: asyncHandler(async (req, res) => {
    const input = listPhieuSchema.parse(req.query)
    res.status(200).json(await nhapKhoService.list(input))
  }),

  chiTiet: asyncHandler(async (req, res) => {
    const { id } = phieuIdParamSchema.parse(req.params)
    res.status(200).json(await nhapKhoService.findById(id))
  }),
}
