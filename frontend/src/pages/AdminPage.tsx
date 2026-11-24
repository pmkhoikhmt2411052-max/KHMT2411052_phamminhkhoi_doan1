import { Alert, Card, Col, Row, Spin, Statistic, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { ApiError } from '../services/api'
import { catalogService, type DanhMucNode } from '../services/catalog.service'
import { posService } from '../services/pos.service'

const { Title, Paragraph, Text } = Typography

interface CategoryStat {
  tenDanhMuc: string
  total: number
}

/** Trang quản trị: dùng số liệu thật từ các API đã có (không gọi API báo cáo mới). */
export function AdminPage() {
  const [categories, setCategories] = useState<DanhMucNode[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      catalogService.danhMuc(),
      catalogService.danhSach({ page: 1, pageSize: 1 }),
      posService.danhSachDonHang({ page: 1, pageSize: 1 }),
    ])
      .then(async ([tree, products, orders]) => {
        if (!active) return
        setCategories(tree)
        setTotalProducts(products.pagination.total)
        setTotalOrders(orders.pagination.total)

        const roots = tree.slice(0, 5)
        const stats = await Promise.all(
          roots.map(async (root) => {
            try {
              const result = await catalogService.danhSach({ page: 1, pageSize: 1, danhMucId: root.id })
              return { tenDanhMuc: root.tenDanhMuc, total: result.pagination.total }
            } catch {
              return { tenDanhMuc: root.tenDanhMuc, total: 0 }
            }
          }),
        )
        if (active) setCategoryStats(stats)
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : 'Không tải được dữ liệu quản trị')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="grid min-h-96 place-items-center">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return <Alert type="error" showIcon message={error} />
  }

  const max = Math.max(1, ...categoryStats.map((item) => item.total))

  return (
    <div className="space-y-5">
      <Card className="!border-line">
        <div className="mb-4 flex items-center gap-3">
          <Logo className="h-12" />
          <div>
            <Title level={2} className="!mb-0 !text-primary">
              Quản trị hệ thống
            </Title>
            <Text type="secondary">Quản lý toàn bộ hệ thống BookMark</Text>
          </div>
        </div>
        <Paragraph type="secondary" className="!mb-0">
          Khu vực quản trị (danh mục, tài khoản, báo cáo) sẽ được bổ sung nghiệp vụ ở bước sau.
        </Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="!border-line">
            <Statistic
              title="Tổng sản phẩm"
              value={totalProducts}
              prefix={<Icon name="package" className="mr-2 !text-primary" size={22} />}
              valueStyle={{ color: '#171923', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="!border-line">
            <Statistic
              title="Tổng danh mục"
              value={categories.length}
              prefix={<Icon name="book" className="mr-2 !text-primary" size={22} />}
              valueStyle={{ color: '#171923', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="!border-line">
            <Statistic
              title="Đơn hàng"
              value={totalOrders}
              prefix={<Icon name="receipt" className="mr-2 !text-primary" size={22} />}
              valueStyle={{ color: '#171923', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="!border-line" title={<span className="text-primary">Số sản phẩm theo danh mục</span>}>
        {categoryStats.length === 0 ? (
          <Text type="secondary">Chưa có danh mục để hiển thị.</Text>
        ) : (
          <div className="space-y-3">
            {categoryStats.map((item) => (
              <div key={item.tenDanhMuc}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-ink">{item.tenDanhMuc}</span>
                  <span className="font-semibold text-primary">{item.total}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.round((item.total / max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
