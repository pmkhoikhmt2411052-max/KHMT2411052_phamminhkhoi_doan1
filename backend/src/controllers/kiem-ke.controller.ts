import { kiemKeService } from '../services/kiem-ke.service'
import {
  chiTietKiemKeSchema,
  createKiemKeSchema,
  kiemKeIdParamSchema,
  listKiemKeSchema,
  sanPhamIdParamSchema,
  tuChoiSchema,
} from '../validators/kiem-ke.validator'
import { asyncHandler } from '../utils/async-handler'

export const kiemKeController = {
  tao: asyncHandler(async (req, res) => {
    const input = createKiemKeSchema.parse(req.body)
    res.status(201).json(await kiemKeService.create(input, req.authUser!.id))
  }),

  capNhatThucTe: asyncHandler(async (req, res) => {
    const { id, sanPhamId } = {
      ...kiemKeIdParamSchema.parse(req.params),
      ...sanPhamIdParamSchema.parse(req.params),
    }
    const input = chiTietKiemKeSchema.parse(req.body)
    res.status(200).json(await kiemKeService.capNhatThucTe(id, sanPhamId, input))
  }),

  gui: asyncHandler(async (req, res) => {
    const { id } = kiemKeIdParamSchema.parse(req.params)
    res.status(200).json(await kiemKeService.gui(id))
  }),

  huy: asyncHandler(async (req, res) => {
    const { id } = kiemKeIdParamSchema.parse(req.params)
    res.status(200).json(await kiemKeService.huy(id))
  }),

  danhSach: asyncHandler(async (req, res) => {
    const input = listKiemKeSchema.parse(req.query)
    res.status(200).json(await kiemKeService.list(input))
  }),

  duyet: asyncHandler(async (req, res) => {
    const { id } = kiemKeIdParamSchema.parse(req.params)
    res.status(200).json(await kiemKeService.duyet(id, req.authUser!.id))
  }),

  tuChoi: asyncHandler(async (req, res) => {
    const { id } = kiemKeIdParamSchema.parse(req.params)
    const input = tuChoiSchema.parse(req.body)
    res.status(200).json(await kiemKeService.tuChoi(id, input))
  }),

  suaLai: asyncHandler(async (req, res) => {
    const { id } = kiemKeIdParamSchema.parse(req.params)
    res.status(200).json(await kiemKeService.suaLai(id))
  }),

  chiTiet: asyncHandler(async (req, res) => {
    const { id } = kiemKeIdParamSchema.parse(req.params)
    res.status(200).json(await kiemKeService.findById(id))
  }),
}
