import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  type TableProps,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { InvoicePanel } from '../components/InvoicePanel'
import { ApiError } from '../services/api'
import {
  posService,
  type BaoGiaResponse,
  type HoaDonDto,
  type SanPhamPosDto,
} from '../services/pos.service'
import { formatMoney, toMoneyNumber } from '../utils/money'
import { positiveMoneyRule } from '../utils/formRules'

const { Title, Text } = Typography

interface CartLine {
  sanPhamId: string
  maSp: string
  tenSp: string
  soLuong: number
  donGia: string
  soLuongTon: number
}

interface CheckoutValues {
  tienKhachDua: string
}

interface FieldErrors {
  search?: string
  voucher?: string
  khach?: string
  diem?: string
  cart?: string
  cash?: string
  general?: string
}

function newIdempotencyKey(): string {
  return `POS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Dịch mã lỗi POS thành thông báo tiếng Việt và vị trí field tương ứng. */
function mapPosError(error: unknown): { fields: FieldErrors; message: string } {
  if (!(error instanceof ApiError)) {
    return { fields: { general: 'Có lỗi xảy ra. Vui lòng thử lại.' }, message: 'Có lỗi xảy ra.' }
  }
  const message = error.message
  const code = error.code
  if (code.startsWith('VOUCHER')) return { fields: { voucher: message }, message }
  if (code === 'POINTS_REQUIRE_CUSTOMER' || code === 'CUSTOMER_LOCKED' || code === 'CUSTOMER_MISMATCH') {
    return { fields: { khach: message }, message }
  }
  if (code.startsWith('POINTS') || code === 'INSUFFICIENT_POINTS') {
    return { fields: { diem: message }, message }
  }
  if (code === 'INSUFFICIENT_STOCK' || code === 'PRODUCT_NOT_SELLABLE' || code === 'CATEGORY_HIDDEN') {
    return { fields: { cart: message }, message }
  }
  if (code === 'INSUFFICIENT_CASH' || code === 'INVALID_TOTAL' || code === 'INVALID_PAYMENT_AMOUNT') {
    return { fields: { cash: message }, message }
  }
  return { fields: { general: message }, message }
}

const productColumns: NonNullable<TableProps<SanPhamPosDto>['columns']> = [
  { title: 'Sản phẩm', dataIndex: 'tenSp', key: 'tenSp', ellipsis: true },
  { title: 'Mã SP', dataIndex: 'maSp', key: 'maSp', width: 110 },
  {
    title: 'Giá bán',
    dataIndex: 'giaBan',
    key: 'giaBan',
    width: 110,
    align: 'right',
    render: (value: string) => formatMoney(value),
  },
  {
    title: 'Tồn',
    dataIndex: 'soLuongTon',
    key: 'soLuongTon',
    width: 70,
    align: 'center',
    render: (value: number) => <Tag color={value > 0 ? 'green' : 'red'}>{value}</Tag>,
  },
]

/** UC05 — màn bán hàng tại quầy: tra cứu, giỏ hàng, báo giá tự động, chốt đơn. */
export function PosPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<CheckoutValues>()
  const cash = Form.useWatch<string>('tienKhachDua', form) ?? ''

  const [searchText, setSearchText] = useState('')
  const [products, setProducts] = useState<SanPhamPosDto[]>([])
  const [productPage, setProductPage] = useState(1)
  const [productTotal, setProductTotal] = useState(0)
  const [searching, setSearching] = useState(false)

  const [cart, setCart] = useState<CartLine[]>([])
  const [sdt, setSdt] = useState('')
  const [maVoucher, setMaVoucher] = useState('')
  const [diemSuDung, setDiemSuDung] = useState(0)
  const [idemKey, setIdemKey] = useState('')
  const [quote, setQuote] = useState<BaoGiaResponse | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [invoice, setInvoice] = useState<HoaDonDto | null>(null)

  const cartKey = JSON.stringify(cart.map((line) => [line.sanPhamId, line.soLuong]))

  const loadProducts = useCallback(
    async (page: number, keyword: string) => {
      setSearching(true)
      try {
        const result = await posService.sanPham({ q: keyword.trim() || undefined, page, pageSize: 8 })
        setProducts(result.data)
        setProductPage(result.pagination.page)
        setProductTotal(result.pagination.total)
        setFieldErrors((current) => ({ ...current, search: undefined }))
      } catch (error: unknown) {
        const mapped = mapPosError(error)
        setFieldErrors((current) => ({ ...current, search: mapped.message }))
      } finally {
        setSearching(false)
      }
    },
    [],
  )

  // Tìm kiếm tự động (tên không dấu / có dấu, mã SP, ISBN do backend xử lý).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts(1, searchText)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchText, loadProducts])

  // Khóa idempotency: sinh khi giỏ bắt đầu, giữ nguyên khi bấm lại, đổi khi giỏ đổi.
  useEffect(() => {
    setIdemKey(cartKey ? newIdempotencyKey() : '')
  }, [cartKey])

  // Tự báo giá khi giỏ / voucher / điểm / khách thay đổi (debounce 300ms).
  useEffect(() => {
    if (!cart.length) {
      setQuote(null)
      return
    }
    setQuoting(true)
    const timer = window.setTimeout(() => {
      void posService
        .baoGia({
          chiTiet: cart.map(({ sanPhamId, soLuong }) => ({ sanPhamId, soLuong })),
          ...(sdt.trim() ? { sdt: sdt.trim() } : {}),
          ...(maVoucher.trim() ? { maVoucher: maVoucher.trim().toUpperCase() } : {}),
          diemSuDung,
        })
        .then((result) => {
          setQuote(result)
          setFieldErrors({})
        })
        .catch((error: unknown) => {
          setQuote(null)
          const mapped = mapPosError(error)
          setFieldErrors((current) => ({ ...current, ...mapped.fields }))
        })
        .finally(() => setQuoting(false))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [cartKey, sdt, maVoucher, diemSuDung])

  const addToCart = (product: SanPhamPosDto) => {
    if (product.soLuongTon <= 0) return
    setCart((current) => {
      const existing = current.find((line) => line.sanPhamId === product.id)
      if (!existing) {
        return [
          ...current,
          {
            sanPhamId: product.id,
            maSp: product.maSp,
            tenSp: product.tenSp,
            soLuong: 1,
            donGia: product.giaBan,
            soLuongTon: product.soLuongTon,
          },
        ]
      }
      if (existing.soLuong >= product.soLuongTon) {
        setFieldErrors((errors) => ({ ...errors, cart: `Số lượng ${product.tenSp} đã đạt tồn kho` }))
        return current
      }
      return current.map((line) =>
        line.sanPhamId === product.id ? { ...line, soLuong: line.soLuong + 1 } : line,
      )
    })
  }

  const updateQuantity = (id: string, quantity: number | null) => {
    const next = Number(quantity ?? 0)
    if (!Number.isInteger(next) || next < 1) return
    setCart((current) =>
      current.map((line) =>
        line.sanPhamId === id ? { ...line, soLuong: Math.min(next, line.soLuongTon) } : line,
      ),
    )
  }

  const onCheckout = async () => {
    if (!cart.length || !quote || !idemKey) return
    setCheckoutLoading(true)
    try {
      const result = await posService.chotDon({
        chiTiet: cart.map(({ sanPhamId, soLuong }) => ({ sanPhamId, soLuong })),
        ...(sdt.trim() ? { sdt: sdt.trim() } : {}),
        ...(maVoucher.trim() ? { maVoucher: maVoucher.trim().toUpperCase() } : {}),
        diemSuDung,
        tienKhachDua: cash.trim(),
        idempotencyKey: idemKey,
      })
      setInvoice(result)
      setCart([])
      setSdt('')
      setMaVoucher('')
      setDiemSuDung(0)
      setQuote(null)
      setIdemKey('')
      setFieldErrors({})
      form.setFieldsValue({ tienKhachDua: '' })
      message.success('Thanh toán thành công')
    } catch (error: unknown) {
      const mapped = mapPosError(error)
      setFieldErrors((current) => ({ ...current, ...mapped.fields }))
      message.error(mapped.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const resetOrder = () => {
    setInvoice(null)
    setCart([])
    setSdt('')
    setMaVoucher('')
    setDiemSuDung(0)
    setQuote(null)
    setIdemKey('')
    setFieldErrors({})
    form.setFieldsValue({ tienKhachDua: '' })
  }

  const cashNumber = toMoneyNumber(cash)
  const tongTienNumber = quote ? (toMoneyNumber(quote.tongTien) ?? 0) : 0
  const tienThua = cashNumber !== null && quote ? cashNumber - tongTienNumber : null
  const canCheckout =
    cart.length > 0 &&
    Boolean(quote) &&
    Boolean(idemKey) &&
    cashNumber !== null &&
    cashNumber >= tongTienNumber &&
    !quoting &&
    !checkoutLoading

  const cartColumns: TableProps<CartLine>['columns'] = [
    { title: 'Sản phẩm', dataIndex: 'tenSp', key: 'tenSp', ellipsis: true },
    {
      title: 'Số lượng',
      dataIndex: 'soLuong',
      key: 'soLuong',
      width: 110,
      render: (_value: number, record) => (
        <InputNumber
          size="small"
          min={1}
          max={record.soLuongTon}
          value={record.soLuong}
          onChange={(value) => updateQuantity(record.sanPhamId, value)}
        />
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'donGia',
      key: 'donGia',
      width: 120,
      align: 'right',
      render: (value: string) => formatMoney(value),
    },
    {
      title: '',
      key: 'xoa',
      width: 50,
      render: (_value: unknown, record) => (
        <Button
          type="text"
          danger
          size="small"
          onClick={() => setCart((current) => current.filter((line) => line.sanPhamId !== record.sanPhamId))}
        >
          Xóa
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface text-primary">
            <Icon name="cart" size={20} />
          </span>
          <div>
            <Title level={3} className="!mb-0 !text-primary">Bán hàng</Title>
            <Text type="secondary">Tra cứu sản phẩm · báo giá · thanh toán · in hóa đơn</Text>
          </div>
        </div>
        <RouterLink to="/pos/don-hang" className="text-sm font-medium text-primary hover:text-primary-hover hover:underline">
          Xem danh sách hóa đơn →
        </RouterLink>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card size="small" className="!border-line">
          <Statistic title="Sản phẩm tra cứu" value={productTotal} prefix={<Icon name="book" className="mr-2 !text-primary" size={18} />} />
        </Card>
        <Card size="small" className="!border-line">
          <Statistic title="Dòng trong giỏ" value={cart.length} prefix={<Icon name="cart" className="mr-2 !text-primary" size={18} />} />
        </Card>
        <Card size="small" className="!border-line">
          <div className="flex items-center gap-2">
            <Icon name="receipt" className="!text-primary" size={18} />
            <div>
              <div className="text-xs text-muted">Tổng báo giá</div>
              <div className="text-xl font-bold text-primary">{quote ? formatMoney(quote.tongTien) : '—'}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card
          size="small"
          title="1. Tra cứu sản phẩm"
          className="lg:col-span-7"
          extra={<Text type="secondary">Tổng {productTotal} sản phẩm</Text>}
        >
          <Input
            allowClear
            placeholder="Tên sách, mã SP hoặc ISBN"
            prefix={<Icon name="search" className="text-muted" />}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          {fieldErrors.search && <div className="mt-1 text-xs text-red-600">{fieldErrors.search}</div>}
          <Table<SanPhamPosDto>
            className="mt-3"
            rowKey="id"
            size="small"
            loading={searching}
            dataSource={products}
            columns={[
              ...productColumns,
              {
                title: '',
                key: 'them',
                width: 70,
                render: (_value: unknown, record) => (
                  <Button
                    type="link"
                    size="small"
                    disabled={record.soLuongTon <= 0}
                    onClick={() => addToCart(record)}
                  >
                    {record.soLuongTon <= 0 ? 'Hết tồn' : 'Thêm'}
                  </Button>
                ),
              },
            ]}
            pagination={{
              current: productPage,
              pageSize: 8,
              total: productTotal,
              size: 'small',
              onChange: (page) => void loadProducts(page, searchText),
            }}
            scroll={{ x: 560, y: 360 }}
          />
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card size="small" title="2. Giỏ hàng" extra={<Text type="secondary">{cart.length} dòng</Text>}>
            <Table<CartLine>
              rowKey="sanPhamId"
              size="small"
              dataSource={cart}
              columns={cartColumns}
              pagination={false}
              locale={{ emptyText: 'Chưa có sản phẩm. Chọn "Thêm" từ danh sách bên trái.' }}
              scroll={{ x: 360, y: 200 }}
            />
            {fieldErrors.cart && <div className="mt-2 text-xs text-red-600">{fieldErrors.cart}</div>}
          </Card>

          <Card size="small" title="3. Báo giá & thanh toán">
            <div className="space-y-2">
              <div>
                <Text type="secondary" className="text-xs">Mã voucher</Text>
                <Input
                  size="small"
                  placeholder="VD: SALE10"
                  value={maVoucher}
                  onChange={(event) => setMaVoucher(event.target.value.toUpperCase())}
                />
                {fieldErrors.voucher && <div className="mt-1 text-xs text-red-600">{fieldErrors.voucher}</div>}
              </div>

              <div>
                <Text type="secondary" className="text-xs">Số điện thoại khách (tùy chọn)</Text>
                <Input
                  size="small"
                  placeholder="09xxxxxxxx"
                  value={sdt}
                  onChange={(event) => setSdt(event.target.value)}
                />
                {fieldErrors.khach && <div className="mt-1 text-xs text-red-600">{fieldErrors.khach}</div>}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Text type="secondary" className="shrink-0 text-xs">Điểm dùng</Text>
                  <InputNumber
                    size="small"
                    className="w-28"
                    min={0}
                    max={quote?.diemToiDa ?? 0}
                    disabled={!quote?.khachHang}
                    value={diemSuDung}
                    onChange={(value) => setDiemSuDung(Number(value ?? 0))}
                  />
                  <Text type="secondary" className="text-xs">Tối đa {quote?.diemToiDa ?? 0}</Text>
                </div>
                {fieldErrors.diem && <div className="mt-1 text-xs text-red-600">{fieldErrors.diem}</div>}
              </div>
            </div>

            <div className="my-3 rounded-lg border border-line bg-surface p-3 text-sm">
              {quoting ? (
                <span className="inline-flex items-center gap-2">
                  <Spin size="small" /> <Text type="secondary">Đang báo giá…</Text>
                </span>
              ) : quote ? (
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Tiền hàng</span><span>{formatMoney(quote.tienHang)}</span></div>
                  <div className="flex justify-between"><span>Giảm voucher</span><span>-{formatMoney(quote.tienGiamVoucher)}</span></div>
                  <div className="flex justify-between"><span>Giảm điểm</span><span>-{formatMoney(quote.tienGiamDiem)}</span></div>
                  <div className="flex justify-between border-t border-line pt-1 text-base font-bold text-primary">
                    <span>Tổng thanh toán</span><span>{formatMoney(quote.tongTien)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>Khách: {quote.khachHang?.hoTen ?? 'Khách lẻ'}</span>
                    <span>Điểm cộng: {quote.diemCong}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>Tiền thừa</span>
                    <span>{tienThua !== null ? formatMoney(tienThua) : '—'}</span>
                  </div>
                </div>
              ) : (
                <Text type="secondary">Thêm sản phẩm để xem báo giá từ máy chủ.</Text>
              )}
              {fieldErrors.general && <div className="mt-2 text-xs text-red-600">{fieldErrors.general}</div>}
            </div>

            <Form<CheckoutValues>
              form={form}
              layout="vertical"
              requiredMark={false}
              initialValues={{ tienKhachDua: '' }}
              onFinish={() => void onCheckout()}
            >
              <Form.Item
                name="tienKhachDua"
                label="Tiền khách đưa"
                rules={[positiveMoneyRule('Tiền khách đưa')]}
                help={fieldErrors.cash}
                validateStatus={fieldErrors.cash ? 'error' : undefined}
              >
                <Input size="small" inputMode="decimal" placeholder="vd: 200000" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={checkoutLoading}
                disabled={!canCheckout}
              >
                Chốt đơn
              </Button>
              <Text type="secondary" className="!mt-2 !block !text-xs">
                Khóa giao dịch: {idemKey || '—'}
              </Text>
            </Form>
          </Card>
        </div>
      </div>

      {invoice && (
        <Modal
          open
          onCancel={resetOrder}
          footer={[
            <Button key="new" type="primary" onClick={resetOrder}>
              Đơn mới
            </Button>,
          ]}
          width={780}
          title={`Hóa đơn ${invoice.maDh}`}
        >
          <InvoicePanel hoaDon={invoice} />
        </Modal>
      )}
    </div>
  )
}
