import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Spin,
  Table,
  Tag,
  Typography,
  type TableProps,
} from 'antd'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { InvoicePanel } from '../components/InvoicePanel'
import { ApiError } from '../services/api'
import {
  posService,
  type BaoGiaResponse,
  type HoaDonDto,
  type SanPhamPosDto,
} from '../services/pos.service'
import { formatMoney } from '../utils/money'
import { idempotencyRule, positiveMoneyRule } from '../utils/formRules'

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
  idempotencyKey: string
}

function newIdempotencyKey(): string {
  return `POS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
    render: (value: number) => (
      <Tag color={value > 0 ? 'green' : 'red'}>{value}</Tag>
    ),
  },
]

export function PosPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<CheckoutValues>()

  const [searchText, setSearchText] = useState('')
  const [products, setProducts] = useState<SanPhamPosDto[]>([])
  const [productPage, setProductPage] = useState(1)
  const [productTotal, setProductTotal] = useState(0)
  const [searching, setSearching] = useState(false)

  const [cart, setCart] = useState<CartLine[]>([])
  const [sdt, setSdt] = useState('')
  const [maVoucher, setMaVoucher] = useState('')
  const [diemSuDung, setDiemSuDung] = useState(0)
  const [quote, setQuote] = useState<BaoGiaResponse | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [invoice, setInvoice] = useState<HoaDonDto | null>(null)

  const loadProducts = async (page: number, keyword = searchText) => {
    setSearching(true)
    try {
      const result = await posService.sanPham({ q: keyword.trim() || undefined, page, pageSize: 8 })
      setProducts(result.data)
      setProductPage(result.pagination.page)
      setProductTotal(result.pagination.total)
    } catch (error) {
      message.error(error instanceof ApiError ? error.message : 'Không tải được sản phẩm')
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    void loadProducts(1, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addToCart = (product: SanPhamPosDto) => {
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
        message.warning('Số lượng đã đạt tồn kho hiện có')
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
        line.sanPhamId === id
          ? { ...line, soLuong: Math.min(next, line.soLuongTon) }
          : line,
      ),
    )
  }

  const cartKey = JSON.stringify(cart.map((line) => [line.sanPhamId, line.soLuong]))

  // Báo giá: server là nguồn tính tiền duy nhất; client chỉ gửi id + số lượng.
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
        .then((result) => setQuote(result))
        .catch((error: unknown) => {
          setQuote(null)
          message.error(error instanceof ApiError ? error.message : 'Báo giá thất bại')
        })
        .finally(() => setQuoting(false))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [cartKey, sdt, maVoucher, diemSuDung, message])

  const onCheckout = async (values: CheckoutValues) => {
    if (!cart.length || !quote) {
      message.warning('Vui lòng thêm sản phẩm và đợi báo giá')
      return
    }
    const cash = values.tienKhachDua.trim()
    if (!/^\d+(\.\d{1,2})?$/.test(cash) || Number(cash) <= 0) {
      message.warning('Tiền khách đưa không hợp lệ')
      return
    }
    setCheckoutLoading(true)
    try {
      const result = await posService.chotDon({
        chiTiet: cart.map(({ sanPhamId, soLuong }) => ({ sanPhamId, soLuong })),
        ...(sdt.trim() ? { sdt: sdt.trim() } : {}),
        ...(maVoucher.trim() ? { maVoucher: maVoucher.trim().toUpperCase() } : {}),
        diemSuDung,
        tienKhachDua: cash,
        idempotencyKey: values.idempotencyKey.trim(),
      })
      setInvoice(result)
      message.success('Thanh toán thành công')
      setCart([])
      setSdt('')
      setMaVoucher('')
      setDiemSuDung(0)
      setQuote(null)
      form.setFieldsValue({ idempotencyKey: newIdempotencyKey(), tienKhachDua: '' })
    } catch (error) {
      message.error(error instanceof ApiError ? error.message : 'Chốt đơn thất bại')
    } finally {
      setCheckoutLoading(false)
    }
  }

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
        <div>
          <Title level={3} className="!mb-0">Bán hàng tại quầy</Title>
          <Text type="secondary">Tra cứu sản phẩm · báo giá · thanh toán · in hóa đơn</Text>
        </div>
        <RouterLink to="/pos/don-hang" className="text-sm text-brand-600 hover:underline">
          Xem danh sách hóa đơn →
        </RouterLink>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card
          size="small"
          title="1. Tra cứu sản phẩm"
          className="lg:col-span-7"
          extra={<Text type="secondary">Tổng {productTotal} sản phẩm</Text>}
        >
          <Input.Search
            allowClear
            placeholder="Tên sách, mã SP hoặc ISBN"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onSearch={(value) => void loadProducts(1, value)}
            enterButton="Tìm"
            className="mb-3"
          />
          <Table<SanPhamPosDto>
            rowKey="id"
            size="small"
            loading={searching}
            dataSource={products}
            columns={[
              ...productColumns,
              {
                title: '',
                key: 'them',
                width: 60,
                render: (_value: unknown, record) => (
                  <Button type="link" size="small" onClick={() => addToCart(record)}>
                    Thêm
                  </Button>
                ),
              },
            ]}
            pagination={{
              current: productPage,
              pageSize: 8,
              total: productTotal,
              size: 'small',
              onChange: (page) => void loadProducts(page),
            }}
            scroll={{ y: 360 }}
          />
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card size="small" title="2. Giỏ hàng POS" extra={<Text type="secondary">{cart.length} dòng</Text>}>
            <Table<CartLine>
              rowKey="sanPhamId"
              size="small"
              dataSource={cart}
              columns={cartColumns}
              pagination={false}
              locale={{ emptyText: 'Chưa có sản phẩm. Chọn "Thêm" từ danh sách bên trái.' }}
              scroll={{ y: 200 }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <Text type="secondary" className="text-xs">
                      Tổng tiền do máy chủ tính ở bước báo giá
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} />
                </Table.Summary.Row>
              )}
            />
          </Card>

          <Card size="small" title="3. Báo giá & thanh toán">
            <div className="grid grid-cols-2 gap-2">
              <Input
                size="small"
                placeholder="SĐT khách thành viên"
                value={sdt}
                onChange={(event) => setSdt(event.target.value)}
              />
              <Input
                size="small"
                placeholder="Mã voucher (vd: SALE10)"
                value={maVoucher}
                onChange={(event) => setMaVoucher(event.target.value)}
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Text type="secondary" className="shrink-0 text-xs">Điểm dùng</Text>
              <InputNumber
                size="small"
                className="w-28"
                min={0}
                max={quote?.diemToiDa ?? 0}
                value={diemSuDung}
                onChange={(value) => setDiemSuDung(Number(value ?? 0))}
              />
              <Text type="secondary" className="text-xs">Tối đa {quote?.diemToiDa ?? 0}</Text>
            </div>

            <div className="my-3 rounded-lg bg-slate-50 p-3 text-sm">
              {quoting ? (
                <span className="inline-flex items-center gap-2">
                  <Spin size="small" /> <Text type="secondary">Đang báo giá…</Text>
                </span>
              ) : quote ? (
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Tiền hàng</span><span>{formatMoney(quote.tienHang)}</span></div>
                  <div className="flex justify-between"><span>Giảm voucher</span><span>-{formatMoney(quote.tienGiamVoucher)}</span></div>
                  <div className="flex justify-between"><span>Giảm điểm</span><span>-{formatMoney(quote.tienGiamDiem)}</span></div>
                  <div className="flex justify-between border-t border-slate-300 pt-1 text-base font-bold">
                    <span>Tổng (server tính)</span><span>{formatMoney(quote.tongTien)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Khách: {quote.khachHang?.hoTen ?? 'Khách lẻ'}</span>
                    <span>Điểm cộng: {quote.diemCong}</span>
                  </div>
                </div>
              ) : (
                <Text type="secondary">Thêm sản phẩm để xem báo giá từ máy chủ.</Text>
              )}
            </div>

            <Form<CheckoutValues>
              form={form}
              layout="vertical"
              requiredMark={false}
              initialValues={{ tienKhachDua: '', idempotencyKey: newIdempotencyKey() }}
              onFinish={(values) => void onCheckout(values)}
            >
              <div className="grid grid-cols-2 gap-2">
                <Form.Item
                  name="tienKhachDua"
                  label="Tiền khách đưa"
                  rules={[positiveMoneyRule('Tiền khách đưa')]}
                >
                  <Input size="small" inputMode="decimal" placeholder="vd: 200000" />
                </Form.Item>
                <Form.Item
                  name="idempotencyKey"
                  label="Khóa giao dịch"
                  rules={[idempotencyRule()]}
                >
                  <Input size="small" placeholder="POS-ca1-0001" />
                </Form.Item>
              </div>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={checkoutLoading}
                disabled={!cart.length || !quote}
              >
                Chốt đơn & in hóa đơn
              </Button>
            </Form>
          </Card>
        </div>
      </div>

      {invoice && (
        <Modal open onCancel={() => setInvoice(null)} footer={null} width={780} title={`Hóa đơn ${invoice.maDh}`}>
          <InvoicePanel hoaDon={invoice} />
        </Modal>
      )}
    </div>
  )
}
