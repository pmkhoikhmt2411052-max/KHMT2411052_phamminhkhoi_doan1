import { danhMucService } from '../services/danh-muc.service'
import { asyncHandler } from '../utils/async-handler'

export const danhMucController = {
  cay: asyncHandler(async (_req, res) => {
    res.status(200).json(await danhMucService.tree())
  }),
}
