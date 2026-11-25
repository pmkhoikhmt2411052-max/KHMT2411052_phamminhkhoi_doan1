import { Avatar, Button, Layout, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { Logo } from '../components/Logo'
import { useAuth } from '../routes/AuthContext'
import { ROLES, ROLE_HOME, ROLE_LABELS, type Role } from '../services/auth.service'

const { Header, Content, Sider, Footer } = Layout

interface NavItem {
  to: string
  label: string
  icon: IconName
  roles: Role[]
  chevron?: boolean
}

const HEADER_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Trang chủ',
    icon: 'home',
    roles: [ROLES.KHACH_HANG, ROLES.THU_NGAN, ROLES.NHAN_VIEN_KHO, ROLES.ADMIN],
  },
  { to: '/san-pham', label: 'Sản phẩm', icon: 'book', roles: [ROLES.KHACH_HANG, ROLES.ADMIN] },
  { to: '/pos', label: 'Bán hàng', icon: 'cart', roles: [ROLES.THU_NGAN] },
  { to: '/pos/don-hang', label: 'Đơn hàng', icon: 'receipt', roles: [ROLES.THU_NGAN, ROLES.ADMIN] },
  { to: '/kho', label: 'Kho hàng', icon: 'warehouse', roles: [ROLES.NHAN_VIEN_KHO, ROLES.ADMIN] },
  { to: '/quan-tri', label: 'Quản trị', icon: 'settings', roles: [ROLES.ADMIN], chevron: true },
]

const SIDEBAR_ITEMS: NavItem[] = [
  { to: '/', label: 'Trang chủ', icon: 'home', roles: [ROLES.KHACH_HANG] },
  { to: '/quan-tri', label: 'Tổng quan', icon: 'chart', roles: [ROLES.ADMIN] },
  { to: '/pos', label: 'Tổng quan', icon: 'chart', roles: [ROLES.THU_NGAN] },
  { to: '/kho', label: 'Tổng quan', icon: 'chart', roles: [ROLES.NHAN_VIEN_KHO] },
  { to: '/san-pham', label: 'Sản phẩm', icon: 'book', roles: [ROLES.KHACH_HANG, ROLES.ADMIN] },
  { to: '/pos', label: 'Bán hàng', icon: 'cart', roles: [ROLES.THU_NGAN] },
  { to: '/pos/don-hang', label: 'Đơn hàng', icon: 'receipt', roles: [ROLES.THU_NGAN, ROLES.ADMIN] },
  { to: '/kho', label: 'Kho hàng', icon: 'warehouse', roles: [ROLES.NHAN_VIEN_KHO, ROLES.ADMIN] },
]

/** Khung chính theo mockup: header royal blue + sidebar royal blue thu gọn được. */
export function AppLayout() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const displayName = user?.nhanVien?.hoTen ?? user?.khachHang?.hoTen ?? user?.taiKhoan.username ?? '—'
  const headerItems = HEADER_ITEMS.filter((item) => role && item.roles.includes(role))
  const sidebarItems = SIDEBAR_ITEMS.filter((item) => role && item.roles.includes(role))

  const handleLogout = () => {
    signOut()
    navigate('/dang-nhap', { replace: true })
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-white text-primary shadow-sm' : 'text-white/85 hover:bg-white/15 hover:text-white'
    }`

  return (
    <Layout className="min-h-screen bg-white">
      <Header className="!flex !h-16 !items-center !gap-4 !bg-primary !px-4">
        <Button
          type="text"
          className="!text-white lg:!hidden"
          icon={<Icon name="menu" />}
          onClick={() => setCollapsed((value) => !value)}
          aria-label="Mở/đóng menu"
        />

        <Link
          to={role ? ROLE_HOME[role] : '/dang-nhap'}
          className="flex h-12 shrink-0 items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm"
        >
          <Logo className="h-12" />
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {headerItems.map((item) => (
            <NavLink key={`top-${item.to}-${item.label}`} to={item.to} end={item.to === '/'} className={navClass}>
              {item.label}
              {item.chevron && <Icon name="chevron" size={13} className="rotate-90" />}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {role && (
            <Tag
              className="!hidden sm:!inline-block"
              style={{ background: '#EAF0FF', color: '#183BFF', borderColor: '#D9E4FF' }}
            >
              {ROLE_LABELS[role as Role]}
            </Tag>
          )}
          <Tooltip title={user?.taiKhoan.username}>
            <div className="hidden items-center gap-2 text-white sm:flex">
              <Avatar size="small" className="!bg-white !text-primary" icon={<Icon name="user" size={16} />} />
              <span className="max-w-32 truncate text-sm">{displayName}</span>
            </div>
          </Tooltip>
          <Button
            size="small"
            onClick={handleLogout}
            icon={<Icon name="logout" size={15} />}
            className="!border-white/60 !bg-transparent !text-white hover:!border-white hover:!bg-white/15 hover:!text-white"
          >
            Đăng xuất
          </Button>
        </div>
      </Header>

      <Layout className="bg-white">
        <Sider
          theme="light"
          width={236}
          collapsedWidth={72}
          collapsed={collapsed}
          breakpoint="lg"
          onBreakpoint={(broken) => setCollapsed(broken)}
          trigger={null}
          style={{ background: '#183BFF' }}
        >
          <div className="flex h-full flex-col">
            {/* Logo chỉ nằm ở header; sidebar giữ nguyên màu xanh và toàn bộ mục điều hướng. */}
            <nav className="mt-6 flex-1 space-y-1 px-3">
              {sidebarItems.map((item) => (
                <Tooltip key={`side-${item.to}-${item.label}`} title={collapsed ? item.label : undefined} placement="right">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `${navClass({ isActive })} ${collapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon name={item.icon} size={19} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </Tooltip>
              ))}
            </nav>

            <div className="border-t border-white/20 p-3">
              <Button
                type="text"
                block
                onClick={() => setCollapsed((value) => !value)}
                icon={<Icon name="chevron" size={16} />}
                className={`!text-white hover:!bg-white/15 ${collapsed ? '!justify-center' : '!justify-start'}`}
              >
                {!collapsed && 'Thu gọn menu'}
              </Button>
            </div>
          </div>
        </Sider>

        <Layout className="bg-white">
          <Content className="mx-auto w-full max-w-6xl px-4 py-5">
            <Outlet />
          </Content>
          <Footer className="!border-t !border-line !bg-white !py-4">
            <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted sm:flex-row">
              <div className="flex items-center gap-2">
                <Logo className="h-8" />
                <span>© 2026 BookMark. Tất cả quyền được bảo lưu.</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span>Chính sách bảo mật</span>
                <span className="text-line">|</span>
                <span>Điều khoản dịch vụ</span>
                <span className="text-line">|</span>
                <a href="mailto:contact@bookmark.local" className="hover:text-primary">Liên hệ</a>
              </div>
            </div>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  )
}
