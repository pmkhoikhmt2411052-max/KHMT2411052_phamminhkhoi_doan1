import { Spin } from 'antd'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROLES, type Role } from '../services/auth.service'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { useAuth } from './AuthContext'

interface RequireAuthProps {
  allow: readonly Role[]
  children: ReactNode
}

/** Route guard: xác thực lại qua /api/auth/toi ở AuthProvider, rồi mới kiểm tra vai trò. */
export function RequireAuth({ allow, children }: RequireAuthProps) {
  const { status, role } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-slate-500">
        <Spin size="large" />
        <span>Đang xác thực…</span>
      </div>
    )
  }
  if (status === 'guest' || !role) {
    return <Navigate to="/dang-nhap" replace state={{ from: location.pathname + location.search }} />
  }
  // Frontend chỉ chặn UX; backend vẫn là nơi kiểm quyền thật sự.
  if (!allow.includes(role)) return <ForbiddenPage />
  return <>{children}</>
}

export const POS_ROLES: readonly Role[] = [ROLES.THU_NGAN, ROLES.ADMIN]
