import { Avatar, Badge, Button, Layout, Space, Tag, Tooltip } from 'antd'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { useAuth } from '../routes/AuthContext'
import { ROLE_LABELS, type Role } from '../services/auth.service'

const { Header, Content, Footer } = Layout

/** Khung công khai theo mockup: header royal blue, nav khách hàng, footer trắng. */
export function PublicLayout() {
  const { status, user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const sanPhamActive = pathname === '/san-pham' || pathname.startsWith('/san-pham/')
  const displayName = user?.khachHang?.hoTen ?? user?.taiKhoan.username ?? 'Khách hàng'

  const handleLogout = () => {
    signOut()
    navigate('/dang-nhap', { replace: true })
  }

  const linkClass = (active: boolean) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      active ? 'bg-white text-primary shadow-sm' : 'text-white/85 hover:bg-white/15 hover:text-white'
    }`

  return (
    <Layout className="min-h-screen bg-white">
      <Header className="!flex !h-16 !items-center !gap-4 !bg-primary !px-4">
        <Link to="/san-pham" className="flex h-12 shrink-0 items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm">
          <Logo className="h-12" />
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
            Trang chủ
          </NavLink>
          <NavLink to="/san-pham" className={linkClass(sanPhamActive)}>
            Sản phẩm
          </NavLink>
          <Tooltip title="Trang tin tức chưa có nghiệp vụ">
            <span className="cursor-not-allowed rounded-md px-3 py-2 text-sm font-medium text-white/60">
              Tin tức
            </span>
          </Tooltip>
          <Tooltip title="Liên hệ qua email ở footer">
            <span className="cursor-not-allowed rounded-md px-3 py-2 text-sm font-medium text-white/60">
              Liên hệ
            </span>
          </Tooltip>
        </nav>

        <Space size="small" className="ml-auto">
          <Tooltip title="Tìm sản phẩm">
            <Button
              type="text"
              className="!text-white hover:!bg-white/15"
              icon={<Icon name="search" size={18} />}
              onClick={() => navigate('/san-pham')}
              aria-label="Tìm sản phẩm"
            />
          </Tooltip>
          <Tooltip title="Giỏ hàng online chưa triển khai">
            <Badge count={0} size="small">
              <Button type="text" className="!text-white hover:!bg-white/15" icon={<Icon name="cart" size={18} />} aria-label="Giỏ hàng" />
            </Badge>
          </Tooltip>

          {status === 'authenticated' ? (
            <>
              {role && (
                <Tag className="!hidden sm:!inline-block" style={{ background: '#EAF0FF', color: '#183BFF', borderColor: '#D9E4FF' }}>
                  {ROLE_LABELS[role as Role]}
                </Tag>
              )}
              <Avatar size="small" className="!bg-white !text-primary" icon={<Icon name="user" size={16} />} />
              <span className="hidden max-w-28 truncate text-sm text-white lg:inline">{displayName}</span>
              <Button
                size="small"
                onClick={handleLogout}
                icon={<Icon name="logout" size={15} />}
                className="!border-white/60 !bg-transparent !text-white hover:!border-white hover:!bg-white/15 hover:!text-white"
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button size="small" icon={<Icon name="user" size={15} />} onClick={() => navigate('/dang-nhap')}>
                Đăng nhập
              </Button>
              <Button
                size="small"
                type="primary"
                icon={<Icon name="package" size={15} />}
                onClick={() => navigate('/dang-ky')}
              >
                Đăng ký
              </Button>
            </>
          )}
        </Space>
      </Header>

      <Content className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </Content>

      <Footer className="!border-t !border-line !bg-white !py-5">
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="h-9" />
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
  )
}
