import { Alert, Card, Col, Row, Spin, Statistic, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { ApiError } from '../services/api'
import { catalogService } from '../services/catalog.service'

const { Title, Paragraph, Text } = Typography

/** Trang kho: phần nghiệp vụ sẽ bổ sung sau; số liệu hiển thị lấy từ API công khai có sẵn. */
export function KhoPage() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    catalogService
      .danhSach({ page: 1, pageSize: 1 })
      .then((result) => {
        if (active) setTotalProducts(result.pagination.total)
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : 'Không tải được dữ liệu')
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
      <Card className="!border-line">
        <div className="flex items-center gap-3">
          <Logo className="h-12" />
          <div>
            <Title level={2} className="!mb-0 !text-primary">
              Quản lý kho
            </Title>
            <Text type="secondary">Nhập kho, tồn kho và kiểm kê</Text>
          </div>
        </div>
        <Paragraph type="secondary" className="!mb-0 !mt-3">
          Khu vực nghiệp vụ kho sẽ được bổ sung ở bước sau. Hiện trang chỉ hiển thị số liệu sản phẩm công khai.
        </Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card className="!border-line">
            {loading ? (
              <Spin size="small" />
            ) : (
              <Statistic
                title="Sản phẩm đang bán"
                value={totalProducts}
                prefix={<Icon name="warehouse" className="mr-2 !text-primary" size={22} />}
                valueStyle={{ color: '#171923', fontWeight: 700 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
