import express from 'express'
import { errorHandler } from './middlewares/error-handler.middleware'
import { notFoundHandler } from './middlewares/not-found.middleware'
import { authRouter } from './routes/auth.routes'
import { danhMucRouter } from './routes/danh-muc.routes'
import { sanPhamRouter } from './routes/san-pham.routes'
import { healthRouter } from './routes/health.routes'
import { thuNghiemRouter } from './routes/thu-nghiem.routes'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(express.json())

  app.use('/api', healthRouter)
  app.use('/api/auth', authRouter)
  // UC11 — công khai.
  app.use('/api/san-pham', sanPhamRouter)
  app.use('/api/danh-muc', danhMucRouter)
  // ⚠️ Route RBAC tạm, sẽ gỡ khi có API nghiệp vụ thật.
  app.use('/api/thu-nghiem', thuNghiemRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

export const app = createApp()
