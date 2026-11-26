import { Avatar, Button, Layout, Space, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { useAuth } from '../routes/AuthContext'
import { ROLE_LABELS, type Role } from '../services/auth.service'
import { catalogService, type DanhMucNode } from '../services/catalog.service'

const { Header, Content, Footer } = Layout

/** Khung công khai: header royal blue, mega menu danh mục lấy từ API, footer trắng. */
export function PublicLayout() {
  const { status, user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const sanPhamActive = pathname === '/san-pham' || pathname.startsWith('/san-pham/')
  const displayName = user?.khachHang?.hoTen ?? user?.taiKhoan.username ?? 'Khách hàng'

  const [categories, setCategories] = useState<DanhMucNode[]>([])
  const [megaOpen, setMegaOpen] = useState(false)
  const [activeParentId, setActiveParentId] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    catalogService
      .danhMuc()
      .then((rows) => {
        if (!active) return
        setCategories(rows)
        setActiveParentId(rows[0]?.id ?? null)
      })
      .catch(() => {
        if (active) setCategories([])
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setMegaOpen(false)
  }, [pathname])

  const activeParent = categories.find((item) => item.id === activeParentId) ?? categories[0]

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
      <Header className="!flex !h-16 !items-center !gap-3 !bg-primary !px-4">
        <Link to="/san-pham" className="flex h-11 shrink-0 items-center rounded-md bg-white px-1 py-0.5 shadow-sm">
          <Logo className="h-11" />
        </Link>

        {/* Mega menu danh mục — luôn hiển thị kể cả mobile. */}
        <div className="relative shrink-0" onMouseLeave={() => setMegaOpen(false)}>
          <button
            type="button"
            className={linkClass(megaOpen)}
            onMouseEnter={() => setMegaOpen(true)}
            onClick={() => setMegaOpen((value) => !value)}
            aria-expanded={megaOpen}
          >
            <span className="flex items-center gap-1">
              Danh mục
              <Icon name="chevron" size={13} className={megaOpen ? 'rotate-90 transition' : 'transition'} />
            </span>
          </button>

          {megaOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-[min(90vw,760px)] max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-white p-4 text-ink shadow-xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[210px_1fr]">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Danh mục chính</p>
                  <div className="space-y-1">
                    {categories.length === 0 && <p className="text-sm text-muted">Chưa có danh mục.</p>}
                    {categories.map((item) => {
                      const active = activeParent?.id === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setActiveParentId(item.id)}
                          onClick={() => setActiveParentId(item.id)}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                            active ? 'bg-surface font-semibold text-primary' : 'hover:bg-surface hover:text-primary'
                          }`}
                        >
                          <span className="truncate">{item.tenDanhMuc}</span>
                          <Icon name="chevron" size={13} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    {activeParent?.tenDanhMuc ?? 'Danh mục con'}
                  </p>
                  {activeParent?.con.length ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {activeParent.con.map((child) => (
                        <Link
                          key={child.id}
                          to={`/san-pham?danhMucId=${child.id}`}
                          onClick={() => setMegaOpen(false)}
                          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink transition hover:border-primary/40 hover:text-primary"
                        >
                          {child.tenDanhMuc}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Danh mục này chưa có danh mục con.</p>
                  )}
                  {activeParent && (
                    <Link
                      to={`/san-pham?danhMucId=${activeParent.id}`}
                      onClick={() => setMegaOpen(false)}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
                    >
                      Xem tất cả <Icon name="chevron" size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
            Trang chủ
          </NavLink>
          <NavLink to="/san-pham" className={linkClass(sanPhamActive)}>
            Sản phẩm
          </NavLink>
        </nav>

        <Space size="small" className="ml-auto">
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
