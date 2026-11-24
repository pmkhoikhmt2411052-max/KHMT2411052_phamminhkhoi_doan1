import { Alert, Button, Card, Descriptions, Empty, Spin, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SanPhamImage } from '../components/SanPhamImage'
import { ApiError } from '../services/api'
import { catalogService, tenLoaiSanPham, type SanPhamChiTietDto } from '../services/catalog.service'
import { formatDate, formatMoney } from '../utils/money'

const { Title, Text, Paragraph } = Typography

/** UC11 — chi tiết sản phẩm công khai (không yêu cầu đăng nhập). */
export function SanPhamChiTietPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<SanPhamChiTietDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setError('')
    setNotFound(false)
    catalogService
      .chiTiet(id)
      .then((result) => {
        if (active) setProduct(result)
      })
      .catch((caught: unknown) => {
        if (!active) return
        if (caught instanceof ApiError && caught.status === 404) setNotFound(true)
        else setError(caught instanceof ApiError ? caught.message : 'Không tải được chi tiết sản phẩm')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, reloadKey])

  if (loading) {
    return (
      <div className="grid min-h-96 place-items-center">
        <Spin size="large" />
      </div>
    )
  }

  if (notFound) {
    return (
      <Card>
        <Empty description="Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng bán.">
          <Link to="/san-pham">
            <Button type="primary">Về danh sách sản phẩm</Button>
          </Link>
        </Empty>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message={error}
        action={
          <Button size="small" onClick={() => setReloadKey((current) => current + 1)}>
            Thử lại
          </Button>
        }
      />
    )
  }

  if (!product) return null

  return (
    <div className="space-y-4">
      <Text type="secondary">
        <Link to="/san-pham" className="text-primary hover:text-primary-hover">
          Sản phẩm
        </Link>{' '}
        / {product.tenSp}
      </Text>

      <Card className="!border-line">
        <div className="grid gap-6 md:grid-cols-[320px_1fr]">
          <SanPhamImage
            src={product.hinhAnh}
            alt={product.tenSp}
            className="h-80 w-full rounded-lg"
          />

          <div className="space-y-4">
            <div>
              <Title level={2} className="!mb-2 !text-primary">
                {product.tenSp}
              </Title>
              <div className="flex flex-wrap gap-2">
                <Tag color="blue">{tenLoaiSanPham(product.loaiSp)}</Tag>
                <Tag>{product.danhMuc.tenDanhMuc}</Tag>
                <Tag color={product.conHang ? 'green' : 'red'}>
                  {product.conHang ? 'Còn hàng' : 'Hết hàng'}
                </Tag>
              </div>
            </div>

            <div className="text-3xl font-semibold text-primary">{formatMoney(product.giaBan)}</div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Mã sản phẩm">{product.maSp}</Descriptions.Item>
              <Descriptions.Item label="ISBN">{product.isbn ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Tác giả">{product.tacGia ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Nhà xuất bản">{product.nhaXuatBan ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Năm xuất bản">{product.namXuatBan ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Danh mục">{product.danhMuc.tenDanhMuc}</Descriptions.Item>
              <Descriptions.Item label="Ngày thêm">{formatDate(product.ngayTao)}</Descriptions.Item>
              <Descriptions.Item label="Tồn kho">
                {product.conHang ? 'Còn hàng' : 'Hết hàng'}
                <Text type="secondary" className="!ml-2 !text-xs">
                  (API công khai chỉ trả tình trạng, không trả số lượng cụ thể)
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {product.moTa && (
              <div>
                <Title level={5}>Giới thiệu</Title>
                <Paragraph className="!mb-0 whitespace-pre-line">{product.moTa}</Paragraph>
              </div>
            )}
          </div>
        </div>
      </Card>

      {product.thanhPhan.length > 0 && (
        <Card className="!border-line">
          <Title level={4} className="!text-primary">
            Thành phần combo / bộ truyện
          </Title>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {product.thanhPhan.map((item) => (
              <Card
                key={item.id}
                size="small"
                className="overflow-hidden !border-line transition hover:!border-primary/40"
              >
                <SanPhamImage src={item.hinhAnh} alt={item.tenSp} className="h-32 w-full" />
                <div className="mt-2 space-y-1">
                  <div className="font-medium">{item.tenSp}</div>
                  <div className="text-xs text-muted">
                    {item.maSp} · Số lượng: {item.soLuong}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{formatMoney(item.giaBan)}</span>
                    <Tag color={item.conHang ? 'green' : 'red'}>
                      {item.conHang ? 'Còn hàng' : 'Hết hàng'}
                    </Tag>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
