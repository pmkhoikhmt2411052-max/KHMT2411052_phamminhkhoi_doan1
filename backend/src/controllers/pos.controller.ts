import { posService } from '../services/pos.service'
import {
  baoGiaSchema,
  chotDonSchema,
  donHangIdParamSchema,
  listDonHangSchema,
  traCuuSchema,
} from '../validators/pos.validator'
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

  chotDon: asyncHandler(async (req, res) => {
    const input = chotDonSchema.parse(req.body)
    const result = await posService.chotDon(input, req.authUser!.id)
    res.status(result.replayed ? 200 : 201).json(result.invoice)
  }),

  xemHoaDon: asyncHandler(async (req, res) => {
    const { id } = donHangIdParamSchema.parse(req.params)
    res.status(200).json(await posService.xemHoaDon(id, req.authUser!.id, req.authUser!.vaiTro))
  }),

  danhSachDon: asyncHandler(async (req, res) => {
    const input = listDonHangSchema.parse(req.query)
    res.status(200).json(await posService.danhSachDon(input, req.authUser!.id, req.authUser!.vaiTro))
  }),
}
