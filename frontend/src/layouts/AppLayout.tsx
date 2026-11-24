import { Avatar, Button, Layout, Tag, Tooltip } from 'antd'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../routes/AuthContext'
import { ROLES, ROLE_LABELS, type Role } from '../services/auth.service'

const { Header, Content } = Layout

const NAV_ITEMS: Array<{ to: string; label: string; roles: Role[] }> = [
  { to: '/', label: 'Trang chủ', roles: [ROLES.KHACH_HANG] },
  { to: '/pos', label: 'Bán hàng', roles: [ROLES.THU_NGAN, ROLES.ADMIN] },
  { to: '/pos/don-hang', label: 'Hóa đơn', roles: [ROLES.THU_NGAN, ROLES.ADMIN] },
  { to: '/kho', label: 'Kho', roles: [ROLES.NHAN_VIEN_KHO, ROLES.ADMIN] },
  { to: '/quan-tri', label: 'Quản trị', roles: [ROLES.ADMIN] },
]

export function AppLayout() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.nhanVien?.hoTen ?? user?.khachHang?.hoTen ?? user?.taiKhoan.username ?? '—'

  const handleLogout = () => {
    signOut()
    navigate('/dang-nhap', { replace: true })
  }

  return (
    <Layout className="min-h-screen bg-slate-50">
      <Header className="!flex !h-16 !items-center !gap-5 !bg-slate-900 !px-5">
        <div className="flex shrink-0 items-center gap-2 text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold">B</span>
          <span className="text-base font-semibold">BookMark</span>
        </div>

        {/* Chỉ ẩn/hiện theo vai trò để UX; quyền thật do backend kiểm tra. */}
        <nav className="flex flex-1 items-center gap-1">
          {NAV_ITEMS.filter((item) => role && item.roles.includes(role)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {role && <Tag color="orange">{ROLE_LABELS[role as Role]}</Tag>}
          <Tooltip title={user?.taiKhoan.username}>
            <div className="hidden items-center gap-2 text-white sm:flex">
              <Avatar size="small" className="!bg-brand-600">
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              <span className="max-w-32 truncate text-sm">{displayName}</span>
            </div>
          </Tooltip>
          <Button size="small" danger onClick={handleLogout}>Đăng xuất</Button>
        </div>
      </Header>

      <Content className="mx-auto w-full max-w-6xl px-4 py-5">
        <Outlet />
      </Content>
    </Layout>
  )
}
