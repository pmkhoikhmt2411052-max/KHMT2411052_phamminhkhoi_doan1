import { App, Button, Card, Input, Modal, Table, Tag, Typography, type TableProps } from 'antd'
import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { InvoicePanel } from '../components/InvoicePanel'
import { ApiError } from '../services/api'
import {
  posService,
  type DonHangRow,
  type HoaDonDto,
} from '../services/pos.service'
import { formatDateTime, formatMoney } from '../utils/money'

const { Title, Text } = Typography

export function OrdersPage() {
  const { message } = App.useApp()
  const [keyword, setKeyword] = useState('')
  const [maDh, setMaDh] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<DonHangRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [invoice, setInvoice] = useState<HoaDonDto | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    void posService
      .danhSachDonHang({ page, pageSize: 10, maDh: maDh.trim() || undefined })
      .then((result) => {
        setRows(result.data)
        setTotal(result.pagination.total)
      })
      .catch((error: unknown) => {
        message.error(error instanceof ApiError ? error.message : 'Không tải được danh sách hóa đơn')
      })
      .finally(() => setLoading(false))
  }, [page, maDh, message])

  const openDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      setInvoice(await posService.xemHoaDon(id))
    } catch (error) {
      message.error(error instanceof ApiError ? error.message : 'Không tải được hóa đơn')
    } finally {
      setDetailLoading(false)
    }
  }

  const columns: TableProps<DonHangRow>['columns'] = [
    { title: 'Mã đơn', dataIndex: 'maDh', key: 'maDh', width: 190 },
    {
      title: 'Ngày tạo',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Khách hàng',
      key: 'khachHang',
      ellipsis: true,
      render: (_value: unknown, record) => record.khachHang?.hoTen ?? 'Khách lẻ',
    },
    { title: 'Số dòng', dataIndex: 'soDong', key: 'soDong', width: 90, align: 'center' },
    {
      title: 'Tổng tiền',
      dataIndex: 'tongTien',
      key: 'tongTien',
      width: 140,
      align: 'right',
      render: (value: string) => formatMoney(value),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (value: string) => (
        <Tag style={{ background: '#EAF0FF', color: '#183BFF', borderColor: '#D9E4FF' }}>{value}</Tag>
      ),
    },
    {
      title: '',
      key: 'xem',
      width: 80,
      render: (_value: unknown, record) => (
        <Button type="link" size="small" onClick={() => void openDetail(record.id)}>
          Xem
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <Title level={3} className="!mb-0 !text-primary">Danh sách hóa đơn POS</Title>
        <Text type="secondary">Xem lại và in hóa đơn đã thanh toán</Text>
      </div>

      <Card size="small">
        <Input.Search
          allowClear
          className="mb-3 max-w-sm"
          placeholder="Tìm theo mã đơn (DH-...)"
          prefix={<Icon name="search" className="text-muted" />}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onSearch={(value) => {
            setMaDh(value.trim())
            setPage(1)
          }}
          enterButton="Tìm"
        />
        <Table<DonHangRow>
          rowKey="id"
          size="small"
          loading={loading || detailLoading}
          dataSource={rows}
          columns={columns}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            size: 'small',
            onChange: (next) => setPage(next),
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {invoice && (
        <Modal open onCancel={() => setInvoice(null)} footer={null} width={780} title={`Hóa đơn ${invoice.maDh}`}>
          <InvoicePanel hoaDon={invoice} />
        </Modal>
      )}
    </div>
  )
}
