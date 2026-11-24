import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../routes/AuthContext'
import { ROLE_HOME, ROLE_LABELS, type Role } from '../services/auth.service'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { role, status, signOut } = useAuth()

  const roleText = role ? ROLE_LABELS[role as Role] : 'chưa đăng nhập'

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <Result
        status="403"
        title="Không có quyền truy cập"
        subTitle={`Vai trò hiện tại: ${roleText}. Vui lòng đăng nhập bằng tài khoản có quyền phù hợp.`}
        extra={[
          <Button
            type="primary"
            key="home"
            onClick={() => navigate(status === 'guest' ? '/dang-nhap' : role ? ROLE_HOME[role] : '/dang-nhap')}
          >
            {status === 'guest' ? 'Đi đến đăng nhập' : 'Về trang của tôi'}
          </Button>,
          ...(status === 'authenticated'
            ? [
                <Button
                  key="logout"
                  onClick={() => {
                    signOut()
                    navigate('/dang-nhap')
                  }}
                >
                  Đăng xuất
                </Button>,
              ]
            : []),
        ]}
      />
    </div>
  )
}
