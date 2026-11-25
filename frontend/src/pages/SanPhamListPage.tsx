import { Alert, Button, Card, Empty, Input, Pagination, Select, Spin, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { SanPhamImage } from '../components/SanPhamImage'
import { ApiError } from '../services/api'
import {
  catalogService,
  LOAI_SAN_PHAM,
  type DanhMucNode,
  type ListSanPhamParams,
  type LoaiSanPham,
  type PaginationDto,
  type SanPhamPublicDto,
  type SapXepTheo,
  type ThuTuSapXep,
} from '../services/catalog.service'
import { formatMoneyWhole } from '../utils/money'

const { Title, Text } = Typography

const sortOptions: Array<{ value: SapXepTheo; label: string }> = [
  { value: 'ngayTao', label: 'Mới nhất' },
  { value: 'gia', label: 'Giá bán' },
  { value: 'ten', label: 'Tên sản phẩm' },
]

const orderOptions: Array<{ value: ThuTuSapXep; label: string }> = [
  { value: 'desc', label: 'Giảm dần' },
  { value: 'asc', label: 'Tăng dần' },
]

function flattenCategories(nodes: DanhMucNode[], depth = 0): Array<{ id: number; tenDanhMuc: string; depth: number }> {
  return nodes.flatMap((node) => [
    { id: node.id, tenDanhMuc: node.tenDanhMuc, depth },
    ...flattenCategories(node.con, depth + 1),
  ])
}

/** UC11 — danh sách sản phẩm công khai theo mockup: sidebar danh mục + lưới card. */
export function SanPhamListPage() {
  const [keyword, setKeyword] = useState('')
  const [q, setQ] = useState('')
  const [danhMucId, setDanhMucId] = useState<number | undefined>()
  const [loaiSp, setLoaiSp] = useState<LoaiSanPham | undefined>()
  const [sort, setSort] = useState<SapXepTheo>('ngayTao')
  const [order, setOrder] = useState<ThuTuSapXep>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [reloadKey, setReloadKey] = useState(0)

  const [categories, setCategories] = useState<DanhMucNode[]>([])
  const [products, setProducts] = useState<SanPhamPublicDto[]>([])
  const [pagination, setPagination] = useState<PaginationDto>({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(keyword.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    let active = true
    catalogService
      .danhMuc()
      .then((rows) => {
        if (active) setCategories(rows)
      })
      .catch(() => {
        if (active) setCategories([])
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    const params: ListSanPhamParams = { page, pageSize, q: q || undefined, danhMucId, loaiSp, sort, order }
    catalogService
      .danhSach(params)
      .then((result) => {
        if (!active) return
        setProducts(result.data)
        setPagination(result.pagination)
      })
      .catch((caught: unknown) => {
        if (!active) return
        setProducts([])
        setError(caught instanceof ApiError ? caught.message : 'Không tải được danh sách sản phẩm')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [q, danhMucId, loaiSp, sort, order, page, pageSize, reloadKey])

  const chipClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition ${
      active ? 'bg-primary text-white' : 'border border-line bg-white text-muted hover:border-primary/40 hover:text-primary'
    }`

  return (
    <div className="space-y-5">
      <div>
        <Title level={2} className="!mb-1 !text-primary">
          Sản phẩm BookMark
        </Title>
        <Text type="secondary">Khám phá những cuốn sách hay nhất dành cho bạn.</Text>
      </div>

      <Card size="small" className="!border-line">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input
            allowClear
            size="large"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<Icon name="search" className="text-muted" />}
            className="flex-1"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button className={chipClass(sort === 'ngayTao' && order === 'desc')} onClick={() => { setSort('ngayTao'); setOrder('desc'); setPage(1) }}>
              Sách mới
            </button>
            <Select
              allowClear
              options={LOAI_SAN_PHAM}
              value={loaiSp}
              onChange={(value) => { setLoaiSp(value); setPage(1) }}
              placeholder="Tất cả loại"
              className="!w-36"
            />
            <Select
              options={sortOptions}
              value={sort}
              onChange={(value) => { setSort(value); setPage(1) }}
              className="!w-32"
            />
            <Select
              options={orderOptions}
              value={order}
              onChange={(value) => { setOrder(value); setPage(1) }}
              className="!w-28"
            />
          </div>
        </div>
      </Card>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={<Button size="small" onClick={() => setReloadKey((current) => current + 1)}>Thử lại</Button>}
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card size="small" title={<span className="text-primary">Danh mục</span>} className="lg:col-span-3">
          <div className="space-y-1">
            <button
              onClick={() => { setDanhMucId(undefined); setPage(1) }}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                danhMucId === undefined ? 'bg-surface font-semibold text-primary' : 'text-ink hover:bg-surface'
              }`}
            >
              <Icon name="book" size={15} />
              Tất cả danh mục
            </button>
            {flattenCategories(categories).map((category) => (
              <button
                key={category.id}
                onClick={() => { setDanhMucId(category.id); setPage(1) }}
                style={{ paddingLeft: `${8 + category.depth * 14}px` }}
                className={`flex w-full items-center gap-2 rounded-md py-2 text-left text-sm transition ${
                  danhMucId === category.id ? 'bg-surface font-semibold text-primary' : 'text-ink hover:bg-surface'
                }`}
              >
                <Icon name="chevron" size={13} />
                <span className="truncate">{category.tenDanhMuc}</span>
              </button>
            ))}
          </div>
          <Text type="secondary" className="!mt-3 !block !text-xs">
            Chọn danh mục cha sẽ gồm cả danh mục con.
          </Text>
        </Card>

        <div className="lg:col-span-9">
          <Spin spinning={loading}>
            {!loading && products.length === 0 && !error ? (
              <Card>
                <Empty description="Không tìm thấy sản phẩm. Hãy đổi từ khóa hoặc bộ lọc." />
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    hoverable
                    size="small"
                    cover={
                      <Link to={`/san-pham/${product.id}`}>
                        <SanPhamImage src={product.hinhAnh} alt={product.tenSp} className="h-44 w-full" />
                      </Link>
                    }
                    className="overflow-hidden !border-line transition hover:!border-primary/40 hover:!shadow-lg"
                  >
                    <Card.Meta
                      title={
                        <Link to={`/san-pham/${product.id}`} className="text-ink hover:text-primary">
                          {product.tenSp}
                        </Link>
                      }
                      description={
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            <Tag color="blue">{product.danhMuc.tenDanhMuc}</Tag>
                            <Tag color={product.conHang ? 'green' : 'red'}>
                              {product.conHang ? 'Còn hàng' : 'Hết hàng'}
                            </Tag>
                          </div>
                          <div className="text-lg font-semibold text-primary">{formatMoneyWhole(product.giaBan)}</div>
                          <div className="text-xs text-muted">
                            {product.tacGia ? `${product.tacGia} · ` : ''}
                            {product.maSp}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                ))}
              </div>
            )}
          </Spin>

          {pagination.total > 0 && (
            <div className="mt-4 flex justify-end">
              <Pagination
                current={pagination.page}
                pageSize={pagination.pageSize}
                total={pagination.total}
                pageSizeOptions={[12, 24, 36, 60]}
                showSizeChanger
                showTotal={(total) => `Tổng ${total} sản phẩm`}
                onChange={(nextPage, nextSize) => {
                  setPage(nextSize === pageSize ? nextPage : 1)
                  setPageSize(nextSize)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
