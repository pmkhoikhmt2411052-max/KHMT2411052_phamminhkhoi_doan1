import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../errors/app-error'

function prismaErrorToHttp(error: { code?: string }): AppError | null {
  switch (error.code) {
    case 'P2002':
      return new AppError(409, 'Giá trị đã tồn tại (vi phạm ràng buộc duy nhất)', 'CONFLICT')
    case 'P2025':
      return new AppError(404, 'Không tìm thấy bản ghi cần thao tác', 'NOT_FOUND')
    default:
      return null
  }
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) return

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu đầu vào không hợp lệ',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    })
    return
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: { code: error.code, message: error.message },
    })
    return
  }

  const prismaError = error && typeof error === 'object' ? prismaErrorToHttp(error) : null
  if (prismaError) {
    res.status(prismaError.statusCode).json({
      error: { code: prismaError.code, message: prismaError.message },
    })
    return
  }

  // Không in request body hay biến môi trường để tránh lộ dữ liệu nhạy cảm.
  console.error('[unhandled-error]', error)
  res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ nội bộ' },
  })
}
