import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
  type TableProps,
} from 'antd'
import { useEffect, useState } from 'react'
import { ApiError } from '../services/api'
import { catalogService, type SanPhamPublicDto } from '../services/catalog.service'
import {
  nhapKhoService,
  TRANG_THAI_PHIEU,
  type ChiTietPhieuNhapDto,
  type LichSuTonKhoDto,
  type NhaCungCapSummary,
  type PhieuNhapDto,
} from '../services/nhap-kho.service'
import { bienDongTonKhoLabel, phieuNhapStatusLabel } from '../utils/labels'
import { formatDateTime, formatMoney } from '../utils/money'

const { Title, Text } = Typography

interface DraftLine {
  sanPhamId: string
  maSp: string
  tenSp: string
  soLuong: number
  giaNhap: string
}

interface PaginationState {
  page: number
  pageSize: number
  total: number
}

const statusColor: Record<string, string> = {
  NHAP: 'default',
  CHO_XAC_NHAN: 'processing',
  DA_NHAP_KHO: 'success',
  DA_HUY: 'error',
}

function apiMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

function lineAmount(line: { soLuong: number; giaNhap: string }): string {
  return (line.soLuong * Number(line.giaNhap || 0)).toFixed(2)
}

/** UC06/UC07 — màn quản lý kho: phiếu nhập, xác nhận/hủy và sổ tồn kho. */
export function KhoPage() {
  const { message } = App.useApp()

  const [tab, setTab] = useState('danh-sach')

  // Danh sách phiếu
  const [rows, setRows] = useState<PhieuNhapDto[]>([])
  const [listPagination, setListPagination] = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 })
  const [trangThai, setTrangThai] = useState<string | undefined>()
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState('')
  const [suppliers, setSuppliers] = useState<NhaCungCapSummary[]>([])

  // Chi tiết phiếu
  const [detail, setDetail] = useState<PhieuNhapDto | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [newStock, setNewStock] = useState<Record<string, number>>({})
  const [editLines, setEditLines] = useState<DraftLine[] | null>(null)

  // Tạo phiếu
  const [nhaCungCapId, setNhaCungCapId] = useState<number | undefined>()
  const [ghiChu, setGhiChu] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([])
  const [productQuery, setProductQuery] = useState('')
  const [products, setProducts] = useState<SanPhamPublicDto[]>([])
  const [searching, setSearching] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  // Lịch sử tồn kho
  const [historyProduct, setHistoryProduct] = useState<SanPhamPublicDto | null>(null)
  const [historyQuery, setHistoryQuery] = useState('')
  const [historyProducts, setHistoryProducts] = useState<SanPhamPublicDto[]>([])
  const [historyRows, setHistoryRows] = useState<LichSuTonKhoDto[]>([])
  const [historyPagination, setHistoryPagination] = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 })
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const loadList = async (page = listPagination.page, pageSize = listPagination.pageSize) => {
    setListLoading(true)
    setListError('')
    try {
      const result = await nhapKhoService.list({ trangThai: trangThai as never, page, pageSize })
      setRows(result.data)
      setListPagination({ page, pageSize, total: result.pagination.total })

      // Không có API danh sách nhà cung cấp → gom từ các phiếu đã có (có thêm ô nhập ID).
      const map = new Map<number, NhaCungCapSummary>()
      for (const item of result.data) map.set(item.nhaCungCap.id, item.nhaCungCap)
      setSuppliers((current) => {
        const merged = new Map(map)
        for (const item of current) merged.set(item.id, item)
        return [...merged.values()]
      })
    } catch (error) {
      setListError(apiMessage(error, 'Không tải được danh sách phiếu nhập'))
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    void loadList(1, listPagination.pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trangThai])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!productQuery.trim()) {
        setProducts([])
        return
      }
      setSearching(true)
      catalogService
        .danhSach({ q: productQuery.trim(), page: 1, pageSize: 12 })
        .then((result) => setProducts(result.data))
        .catch(() => setProducts([]))
        .finally(() => setSearching(false))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [productQuery])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!historyQuery.trim()) {
        setHistoryProducts([])
        return
      }
      catalogService
        .danhSach({ q: historyQuery.trim(), page: 1, pageSize: 12 })
        .then((result) => setHistoryProducts(result.data))
        .catch(() => setHistoryProducts([]))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [historyQuery])

  const loadNewStock = async (phieu: PhieuNhapDto) => {
    if (phieu.trangThai !== 'DA_NHAP_KHO') {
      setNewStock({})
      return
    }
    const entries = await Promise.all(
      phieu.chiTiet.map(async (line) => {
        try {
          const result = await nhapKhoService.lichSuTonKho(line.sanPhamId, { page: 1, pageSize: 1 })
          return [line.sanPhamId, result.data[0]?.soLuongSau] as const
        } catch {
          return [line.sanPhamId, undefined] as const
        }
      }),
    )
    const next: Record<string, number> = {}
    for (const [id, value] of entries) if (value !== undefined) next[id] = value
    setNewStock(next)
  }

  const openDetail = async (id: string) => {
    setDetailLoading(true)
    setDetailError('')
    setDetail(null)
    setEditLines(null)
    try {
      const result = await nhapKhoService.detail(id)
      setDetail(result)
      await loadNewStock(result)
    } catch (error) {
      setDetailError(apiMessage(error, 'Không tải được chi tiết phiếu'))
    } finally {
      setDetailLoading(false)
    }
  }

  const refreshDetail = async (id: string) => {
    await openDetail(id)
    await loadList()
  }

  const runAction = async (action: 'gui' | 'huy' | 'xacNhan', id: string) => {
    setDetailLoading(true)
    try {
      await nhapKhoService[action](id)
      message.success(
        action === 'xacNhan' ? 'Đã xác nhận nhập kho' : action === 'gui' ? 'Đã gửi chờ xác nhận' : 'Đã hủy phiếu',
      )
      await refreshDetail(id)
    } catch (error) {
      setDetailError(apiMessage(error, 'Thao tác không thành công'))
    } finally {
      setDetailLoading(false)
    }
  }

  const addLine = (product: SanPhamPublicDto) => {
    setFormError('')
    setLines((current) => {
      const existing = current.find((line) => line.sanPhamId === product.id)
      if (existing) {
        return current.map((line) =>
          line.sanPhamId === product.id ? { ...line, soLuong: line.soLuong + 1 } : line,
        )
      }
      return [
        ...current,
        {
          sanPhamId: product.id,
          maSp: product.maSp,
          tenSp: product.tenSp,
          soLuong: 1,
          giaNhap: Number(product.giaBan).toFixed(2),
        },
      ]
    })
  }

  const updateLine = (sanPhamId: string, patch: Partial<DraftLine>) => {
    setLines((current) => current.map((line) => (line.sanPhamId === sanPhamId ? { ...line, ...patch } : line)))
  }

  const validateDraft = (): string => {
    if (!nhaCungCapId || nhaCungCapId <= 0) return 'Vui lòng chọn hoặc nhập nhà cung cấp'
    if (lines.length === 0) return 'Phiếu phải có ít nhất một dòng sản phẩm'
    if (lines.some((line) => !Number.isInteger(line.soLuong) || line.soLuong <= 0)) {
      return 'Số lượng phải là số nguyên lớn hơn 0'
    }
    if (lines.some((line) => Number(line.giaNhap) < 0)) return 'Giá nhập không được âm'
    return ''
  }

  const saveDraft = async (trangThaiPhieu: 'NHAP' | 'CHO_XAC_NHAN') => {
    const invalid = validateDraft()
    if (invalid) {
      setFormError(invalid)
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await nhapKhoService.create({
        nhaCungCapId: Number(nhaCungCapId),
        ngayNhap: new Date().toISOString(),
        ...(ghiChu.trim() ? { ghiChu: ghiChu.trim() } : {}),
        trangThai: trangThaiPhieu,
        chiTiet: lines.map((line) => ({
          sanPhamId: line.sanPhamId,
          soLuong: line.soLuong,
          giaNhap: Number(line.giaNhap).toFixed(2),
        })),
      })
      message.success(trangThaiPhieu === 'NHAP' ? 'Đã lưu nháp' : 'Đã gửi chờ xác nhận')
      setLines([])
      setGhiChu('')
      setNhaCungCapId(undefined)
      setProductQuery('')
      setProducts([])
      setTab('danh-sach')
      await loadList()
    } catch (error) {
      // Giữ nguyên dữ liệu đang nhập khi API trả 400/409.
      setFormError(apiMessage(error, 'Không lưu được phiếu nhập'))
    } finally {
      setSaving(false)
    }
  }

  const lineColumns: TableProps<DraftLine>['columns'] = [
    { title: 'Sản phẩm', dataIndex: 'tenSp', key: 'tenSp', ellipsis: true },
    { title: 'Mã SP', dataIndex: 'maSp', key: 'maSp', width: 110 },
    {
      title: 'Số lượng',
      dataIndex: 'soLuong',
      key: 'soLuong',
      width: 110,
      render: (value: number, record) => (
        <InputNumber
          size="small"
          min={1}
          value={value}
          onChange={(next) => updateLine(record.sanPhamId, { soLuong: Number(next ?? 0) })}
        />
      ),
    },
    {
      title: 'Giá nhập',
      dataIndex: 'giaNhap',
      key: 'giaNhap',
      width: 130,
      render: (value: string, record) => (
        <InputNumber
          size="small"
          min={0}
          step={0.01}
          value={Number(value)}
          onChange={(next) => updateLine(record.sanPhamId, { giaNhap: Number(next ?? 0).toFixed(2) })}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'thanhTien',
      width: 120,
      align: 'right',
      render: (_value: unknown, record) => formatMoney(lineAmount(record)),
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
          onClick={() => setLines((current) => current.filter((line) => line.sanPhamId !== record.sanPhamId))}
        >
          Xóa
        </Button>
      ),
    },
  ]

  const detailColumns: TableProps<ChiTietPhieuNhapDto>['columns'] = [
    { title: 'Sản phẩm', dataIndex: 'tenSp', key: 'tenSp', ellipsis: true },
    { title: 'SL', dataIndex: 'soLuong', key: 'soLuong', width: 60 },
    { title: 'Đơn giá', dataIndex: 'giaNhap', key: 'giaNhap', width: 110, align: 'right', render: (v: string) => formatMoney(v) },
    { title: 'Thành tiền', dataIndex: 'thanhTien', key: 'thanhTien', width: 120, align: 'right', render: (v: string) => formatMoney(v) },
    {
      title: 'Tồn mới',
      key: 'tonMoi',
      width: 90,
      align: 'right',
      render: (_v: unknown, record) =>
        newStock[record.sanPhamId] !== undefined ? <Text strong>{newStock[record.sanPhamId]}</Text> : '—',
    },
  ]

  const historyColumns: TableProps<LichSuTonKhoDto>['columns'] = [
    { title: 'Thời gian', dataIndex: 'ngayTao', key: 'ngayTao', width: 170, render: (v: string) => formatDateTime(v) },
    {
      title: 'Loại',
      dataIndex: 'loaiBienDong',
      key: 'loaiBienDong',
      width: 120,
      render: (v: string) => bienDongTonKhoLabel(v),
    },
    {
      title: 'Thay đổi',
      dataIndex: 'soLuongThayDoi',
      key: 'soLuongThayDoi',
      width: 100,
      align: 'right',
      render: (v: number) => <Text type={v >= 0 ? 'success' : 'danger'}>{v > 0 ? `+${v}` : v}</Text>,
    },
    { title: 'Trước', dataIndex: 'soLuongTruoc', key: 'soLuongTruoc', width: 80, align: 'right' },
    {
      title: 'Sau',
      dataIndex: 'soLuongSau',
      key: 'soLuongSau',
      width: 80,
      align: 'right',
      render: (v: number) => <Text strong>{v}</Text>,
    },
    { title: 'Ghi chú', dataIndex: 'ghiChu', key: 'ghiChu', ellipsis: true, render: (v: string | null) => v ?? '—' },
  ]

  const loadHistory = async (productId: string, page = 1, pageSize = 10) => {
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const result = await nhapKhoService.lichSuTonKho(productId, { page, pageSize })
      setHistoryRows(result.data)
      setHistoryPagination({ page, pageSize, total: result.pagination.total })
    } catch (error) {
      setHistoryError(apiMessage(error, 'Không tải được lịch sử tồn kho'))
    } finally {
      setHistoryLoading(false)
    }
  }

  const listColumns: TableProps<PhieuNhapDto>['columns'] = [
    { title: 'Mã phiếu', dataIndex: 'maPn', key: 'maPn', width: 180 },
    { title: 'Nhà cung cấp', key: 'ncc', ellipsis: true, render: (_v, r) => r.nhaCungCap.tenNhaCungCap },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (v: string) => <Tag color={statusColor[v] ?? 'default'}>{phieuNhapStatusLabel(v)}</Tag>,
    },
    { title: 'Tổng tiền', dataIndex: 'tongTien', key: 'tongTien', width: 130, align: 'right', render: (v: string) => formatMoney(v) },
    { title: 'Ngày nhập', dataIndex: 'ngayNhap', key: 'ngayNhap', width: 170, render: (v: string) => formatDateTime(v) },
    {
      title: '',
      key: 'xem',
      width: 100,
      render: (_v, record) => (
        <Button type="link" size="small" onClick={() => void openDetail(record.id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ]

  const totalDraft = lines.reduce((sum, line) => sum + Number(lineAmount(line)), 0)
  const editable = detail?.trangThai === 'NHAP' || detail?.trangThai === 'CHO_XAC_NHAN'

  const saveEdits = async () => {
    if (!detail || !editLines) return
    setDetailLoading(true)
    setDetailError('')
    try {
      for (const line of editLines) {
        await nhapKhoService.upsertChiTiet(detail.id, {
          sanPhamId: line.sanPhamId,
          soLuong: line.soLuong,
          giaNhap: Number(line.giaNhap).toFixed(2),
        })
      }
      message.success('Đã cập nhật dòng phiếu')
      await refreshDetail(detail.id)
    } catch (error) {
      setDetailError(apiMessage(error, 'Không cập nhật được dòng phiếu'))
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card className="!border-line">
        <Title level={2} className="!mb-1 !text-primary">Quản lý kho</Title>
        <Text type="secondary">Lập phiếu nhập, xác nhận tồn kho và xem lịch sử biến động.</Text>
      </Card>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: 'danh-sach',
            label: 'Danh sách phiếu',
            children: (
              <Card className="!border-line">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Select
                    allowClear
                    placeholder="Tất cả trạng thái"
                    value={trangThai}
                    onChange={(value) => setTrangThai(value)}
                    options={TRANG_THAI_PHIEU.map((item) => ({ value: item.value, label: item.label }))}
                    className="!w-52"
                  />
                  <Button onClick={() => void loadList()}>Tải lại</Button>
                </div>
                {listError && <Alert type="error" showIcon message={listError} className="!mb-3" />}
                <Table<PhieuNhapDto>
                  rowKey="id"
                  size="small"
                  loading={listLoading}
                  dataSource={rows}
                  columns={listColumns}
                  scroll={{ x: 900 }}
                  pagination={{
                    current: listPagination.page,
                    pageSize: listPagination.pageSize,
                    total: listPagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 60],
                    onChange: (page, pageSize) => void loadList(page, pageSize),
                  }}
                  locale={{ emptyText: 'Chưa có phiếu nhập nào.' }}
                />
              </Card>
            ),
          },
          {
            key: 'tao-phieu',
            label: 'Tạo phiếu nhập',
            children: (
              <Card className="!border-line">
                {formError && (
                  <Alert type="error" showIcon closable message={formError} className="!mb-4" onClose={() => setFormError('')} />
                )}
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Select
                    allowClear
                    placeholder="Chọn nhà cung cấp"
                    value={nhaCungCapId}
                    onChange={setNhaCungCapId}
                    options={suppliers.map((item) => ({ value: item.id, label: `${item.maNcc} — ${item.tenNhaCungCap}` }))}
                    className="!w-72"
                  />
                  <InputNumber
                    placeholder="Hoặc nhập ID NCC"
                    min={1}
                    value={nhaCungCapId}
                    onChange={(value) => setNhaCungCapId(Number(value ?? 0) || undefined)}
                    className="!w-40"
                  />
                  <Input
                    value={ghiChu}
                    onChange={(event) => setGhiChu(event.target.value)}
                    placeholder="Ghi chú (tùy chọn)"
                    className="!w-64"
                  />
                </div>
                <Text type="secondary" className="!mb-2 !block !text-xs">
                  Chưa có API danh sách nhà cung cấp: danh sách trên được gom từ các phiếu đã có, bạn có thể nhập ID thủ công.
                </Text>

                <Input
                  allowClear
                  placeholder="Tìm sản phẩm theo tên, mã hoặc ISBN"
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  prefix={<Text type="secondary">🔍</Text>}
                  className="!mb-2"
                />
                {searching && <Spin size="small" />}
                {products.length > 0 && (
                  <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {products.map((product) => (
                      <Button key={product.id} size="small" onClick={() => addLine(product)} className="!text-left">
                        {product.tenSp} · {product.maSp} · {formatMoney(product.giaBan)}
                      </Button>
                    ))}
                  </div>
                )}

                <Table<DraftLine>
                  rowKey="sanPhamId"
                  size="small"
                  dataSource={lines}
                  columns={lineColumns}
                  pagination={false}
                  scroll={{ x: 700 }}
                  locale={{ emptyText: 'Chưa có dòng. Tìm sản phẩm ở trên để thêm.' }}
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <Text>
                    Tổng tiền: <strong className="text-primary">{formatMoney(totalDraft.toFixed(2))}</strong>
                  </Text>
                  <div className="flex gap-2">
                    <Button disabled={saving || lines.length === 0} onClick={() => void saveDraft('NHAP')}>
                      Lưu nháp
                    </Button>
                    <Button
                      type="primary"
                      loading={saving}
                      disabled={lines.length === 0}
                      onClick={() => void saveDraft('CHO_XAC_NHAN')}
                    >
                      Gửi chờ xác nhận
                    </Button>
                  </div>
                </div>
              </Card>
            ),
          },
          {
            key: 'lich-su',
            label: 'Lịch sử tồn kho',
            children: (
              <Card className="!border-line">
                <Input
                  allowClear
                  placeholder="Tìm sản phẩm để xem lịch sử tồn kho"
                  value={historyQuery}
                  onChange={(event) => setHistoryQuery(event.target.value)}
                  className="!mb-3"
                />
                {historyProducts.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {historyProducts.map((product) => (
                      <Button
                        key={product.id}
                        size="small"
                        type={historyProduct?.id === product.id ? 'primary' : 'default'}
                        onClick={() => {
                          setHistoryProduct(product)
                          void loadHistory(product.id)
                        }}
                      >
                        {product.tenSp}
                      </Button>
                    ))}
                  </div>
                )}
                {historyProduct && (
                  <div className="mb-2">
                    <Text strong>{historyProduct.tenSp}</Text> <Text type="secondary">({historyProduct.maSp})</Text>
                  </div>
                )}
                {historyError && <Alert type="error" showIcon message={historyError} className="!mb-3" />}
                <Table<LichSuTonKhoDto>
                  rowKey="id"
                  size="small"
                  loading={historyLoading}
                  dataSource={historyRows}
                  columns={historyColumns}
                  scroll={{ x: 800 }}
                  pagination={{
                    current: historyPagination.page,
                    pageSize: historyPagination.pageSize,
                    total: historyPagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 60],
                    onChange: (page, pageSize) => {
                      if (historyProduct) void loadHistory(historyProduct.id, page, pageSize)
                    },
                  }}
                  locale={{ emptyText: 'Chọn một sản phẩm để xem lịch sử.' }}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        open={Boolean(detail || detailLoading || detailError)}
        onCancel={() => setDetail(null)}
        footer={null}
        width={860}
        title={detail ? `Chi tiết phiếu ${detail.maPn}` : 'Chi tiết phiếu'}
      >
        {detailLoading && <div className="grid place-items-center py-10"><Spin size="large" /></div>}
        {detailError && <Alert type="error" showIcon message={detailError} />}
        {detail && (
          <div className="space-y-4">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Mã phiếu">{detail.maPn}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{phieuNhapStatusLabel(detail.trangThai)}</Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp">{detail.nhaCungCap.tenNhaCungCap}</Descriptions.Item>
              <Descriptions.Item label="Ngày nhập">{formatDateTime(detail.ngayNhap)}</Descriptions.Item>
              <Descriptions.Item label="Người lập">{detail.nguoiLap?.hoTen ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">{formatMoney(detail.tongTien)}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>{detail.ghiChu ?? '—'}</Descriptions.Item>
            </Descriptions>

            <Table<ChiTietPhieuNhapDto>
              rowKey="sanPhamId"
              size="small"
              dataSource={detail.chiTiet}
              columns={detailColumns}
              pagination={false}
              scroll={{ x: 600 }}
            />

            {editable && (
              <div className="flex flex-wrap gap-2">
                {detail.trangThai === 'NHAP' && (
                  <Button onClick={() => void runAction('gui', detail.id)} disabled={detailLoading}>
                    Gửi chờ xác nhận
                  </Button>
                )}
                {detail.trangThai === 'CHO_XAC_NHAN' && (
                  <Button type="primary" onClick={() => void runAction('xacNhan', detail.id)} disabled={detailLoading}>
                    Xác nhận nhập kho
                  </Button>
                )}
                <Button onClick={() => setEditLines(editLines ? null : detail.chiTiet.map((line) => ({
                  sanPhamId: line.sanPhamId,
                  maSp: line.maSp,
                  tenSp: line.tenSp,
                  soLuong: line.soLuong,
                  giaNhap: line.giaNhap,
                })))}>
                  {editLines ? 'Đóng sửa' : 'Sửa dòng'}
                </Button>
                <Button danger onClick={() => void runAction('huy', detail.id)} disabled={detailLoading}>
                  Hủy phiếu
                </Button>
              </div>
            )}

            {editLines && editable && (
              <div className="space-y-2 rounded-lg border border-line p-3">
                {editLines.map((line) => (
                  <div key={line.sanPhamId} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="min-w-40 flex-1">{line.tenSp}</span>
                    <InputNumber
                      size="small"
                      min={1}
                      value={line.soLuong}
                      onChange={(value) => setEditLines((current) => current?.map((item) =>
                        item.sanPhamId === line.sanPhamId ? { ...item, soLuong: Number(value ?? 0) } : item,
                      ) ?? null)}
                    />
                    <InputNumber
                      size="small"
                      min={0}
                      step={0.01}
                      value={Number(line.giaNhap)}
                      onChange={(value) => setEditLines((current) => current?.map((item) =>
                        item.sanPhamId === line.sanPhamId ? { ...item, giaNhap: Number(value ?? 0).toFixed(2) } : item,
                      ) ?? null)}
                    />
                    <Text>{formatMoney(lineAmount(line))}</Text>
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={async () => {
                        if (!detail) return
                        try {
                          await nhapKhoService.xoaChiTiet(detail.id, line.sanPhamId)
                          await refreshDetail(detail.id)
                        } catch (error) {
                          setDetailError(apiMessage(error, 'Không xóa được dòng'))
                        }
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
                <Button type="primary" size="small" onClick={() => void saveEdits()} disabled={detailLoading}>
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
