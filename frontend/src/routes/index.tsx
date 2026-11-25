import { Spin } from 'antd'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AdminPage } from '../pages/AdminPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { HomePage } from '../pages/HomePage'
import { KhoPage } from '../pages/KhoPage'
import { LoginPage } from '../pages/LoginPage'
import { OrdersPage } from '../pages/OrdersPage'
import { PosPage } from '../pages/PosPage'
import { RegisterPage } from '../pages/RegisterPage'
import { SanPhamChiTietPage } from '../pages/SanPhamChiTietPage'
import { SanPhamListPage } from '../pages/SanPhamListPage'
import { PublicLayout } from '../layouts/PublicLayout'
import { ROLE_HOME, ROLES } from '../services/auth.service'
import { useAuth } from './AuthContext'
import { POS_ROLES, RequireAuth } from './RequireAuth'

function HomeRedirect() {
  const { status, role } = useAuth()
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }
  if (status === 'guest' || !role) return <Navigate to="/dang-nhap" replace />
  return <Navigate to={ROLE_HOME[role]} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route path="/dang-ky" element={<RegisterPage />} />
      <Route path="/login" element={<Navigate to="/dang-nhap" replace />} />
      <Route path="/khong-co-quyen" element={<ForbiddenPage />} />

      {/* UC11 — duyệt sản phẩm công khai, không cần token. */}
      <Route element={<PublicLayout />}>
        <Route path="/san-pham" element={<SanPhamListPage />} />
        <Route path="/san-pham/:id" element={<SanPhamChiTietPage />} />
      </Route>

      {/* Trang chủ là trang công khai theo UC11 — mở cho mọi vai trò đã đăng nhập. */}
      <Route
        element={
          <RequireAuth
            allow={[ROLES.KHACH_HANG, ROLES.THU_NGAN, ROLES.NHAN_VIEN_KHO, ROLES.ADMIN]}
          >
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route element={<RequireAuth allow={POS_ROLES}><AppLayout /></RequireAuth>}>
        <Route path="/pos" element={<PosPage />} />
        <Route path="/pos/don-hang" element={<OrdersPage />} />
      </Route>
      <Route element={<RequireAuth allow={[ROLES.NHAN_VIEN_KHO, ROLES.ADMIN]}><AppLayout /></RequireAuth>}>
        <Route path="/kho" element={<KhoPage />} />
      </Route>
      <Route element={<RequireAuth allow={[ROLES.ADMIN]}><AppLayout /></RequireAuth>}>
        <Route path="/quan-tri" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
