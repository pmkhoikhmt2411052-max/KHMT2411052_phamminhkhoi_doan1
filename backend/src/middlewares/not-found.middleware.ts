import type { RequestHandler } from 'express'

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Không tìm thấy endpoint ${req.method} ${req.originalUrl}`,
    },
  })
}
