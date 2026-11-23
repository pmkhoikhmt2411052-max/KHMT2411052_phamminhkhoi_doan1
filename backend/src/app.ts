import express from 'express'
import { errorHandler } from './middlewares/error-handler.middleware'
import { notFoundHandler } from './middlewares/not-found.middleware'
import { adminDanhMucRouter } from './routes/admin-danh-muc.routes'
import { adminSanPhamRouter } from './routes/admin-san-pham.routes'
import { authRouter } from './routes/auth.routes'
import { danhMucRouter } from './routes/danh-muc.routes'
import { sanPhamRouter } from './routes/san-pham.routes'
import { healthRouter } from './routes/health.routes'
import { adminKiemKeRouter } from './routes/admin-kiem-ke.routes'
import { kiemKeRouter } from './routes/kiem-ke.routes'
import { nhapKhoRouter } from './routes/nhap-kho.routes'
import { posRouter } from './routes/pos.routes'
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
  // UC15 — quản trị, chỉ ADMIN.
  app.use('/api/admin/danh-muc', adminDanhMucRouter)
  app.use('/api/admin/san-pham', adminSanPhamRouter)
  // UC06/UC07 — nhập kho.
  app.use('/api/nhap-kho', nhapKhoRouter)
  // UC08 — kiểm kê.
  app.use('/api/kiem-ke', kiemKeRouter)
  app.use('/api/kiem-ke', adminKiemKeRouter)
  // UC02/UC04 — POS tra cứu & báo giá.
  app.use('/api/pos', posRouter)
  // ⚠️ Route RBAC tạm, sẽ gỡ khi có API nghiệp vụ thật.
  app.use('/api/thu-nghiem', thuNghiemRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

export const app = createApp()
