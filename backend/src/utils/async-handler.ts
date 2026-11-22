import type { NextFunction, Request, RequestHandler, Response } from 'express'

/** Chuyển lỗi của handler bất đồng bộ tới middleware bắt lỗi tập trung. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next)
  }
}
