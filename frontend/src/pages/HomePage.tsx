import { Alert, Button, Card, Col, Row, Spin, Statistic, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BookHeroArt } from '../components/BookHeroArt'
import { Icon } from '../components/Icon'
import { ApiError } from '../services/api'
import { catalogService, type DanhMucNode } from '../services/catalog.service'

const { Title, Paragraph, Text } = Typography

/** Trang chủ khách hàng theo mockup: banner storefront + số liệu thật từ API công khai. */
export function HomePage() {
  const [categories, setCategories] = useState<DanhMucNode[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([catalogService.danhMuc(), catalogService.danhSach({ page: 1, pageSize: 1 })])
      .then(([tree, products]) => {
        if (!active) return
        setCategories(tree)
        setTotalProducts(products.pagination.total)
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : 'Không tải được dữ liệu trang chủ')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (error) return <Alert type="error" showIcon message={error} />

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-surface px-6 py-8 sm:px-10 sm:py-10">
        <div className="relative z-10 max-w-xl">
          <Text className="!text-sm !font-semibold !text-primary">BookMark</Text>
          <Title level={1} className="!mt-1 !text-3xl !text-primary sm:!text-4xl">
            Tri thức Thắp sáng tương lai
          </Title>
          <Paragraph type="secondary" className="!mt-2 !text-base">
            Sách hay – Kiến thức thực – Cước sách độc đáo hơn.
          </Paragraph>
          <Link to="/san-pham">
            <Button type="primary" size="large" icon={<Icon name="book" size={17} />}>
              Khám phá ngay
            </Button>
          </Link>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[46%] lg:block">
          <BookHeroArt />
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card className="!border-line">
                <Statistic
                  title="Sản phẩm đang bán"
                  value={totalProducts}
                  prefix={<Icon name="package" className="mr-2 !text-primary" size={22} />}
                  valueStyle={{ color: '#171923', fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card className="!border-line">
                <Statistic
                  title="Danh mục sản phẩm"
                  value={categories.length}
                  prefix={<Icon name="chart" className="mr-2 !text-primary" size={22} />}
                  valueStyle={{ color: '#171923', fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>

          <Card className="!border-line" title={<span className="text-primary">Danh mục nổi bật</span>}>
            {categories.length === 0 ? (
              <Text type="secondary">Chưa có danh mục nào.</Text>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {categories.slice(0, 4).map((category) => (
                  <Link
                    key={category.id}
                    to="/san-pham"
                    className="flex items-center gap-3 rounded-lg border border-line bg-white p-3 transition hover:border-primary/40 hover:shadow-sm"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface text-primary">
                      <Icon name="book" size={18} />
                    </span>
                    <span className="truncate text-sm font-medium text-ink">{category.tenDanhMuc}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
