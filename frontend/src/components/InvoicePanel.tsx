import { Button, Tag } from 'antd'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import type { HoaDonDto } from '../services/pos.service'
import { formatMoney } from '../utils/money'
import { Invoice } from './Invoice'

interface InvoicePanelProps {
  hoaDon: HoaDonDto
}

/** Bọc hóa đơn bằng nút In (react-to-print); dùng lại ở trang POS và trang hóa đơn. */
export function InvoicePanel({ hoaDon }: InvoicePanelProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `BookMark-${hoaDon.maDh}`,
  })

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
        <div className="flex items-center gap-2">
          <Tag color="green">Đã thanh toán</Tag>
          <span className="text-sm text-slate-600">
            Tổng: <strong className="text-slate-900">{formatMoney(hoaDon.tongTien)}</strong>
          </span>
        </div>
        <Button type="primary" onClick={() => void handlePrint()}>
          In hóa đơn
        </Button>
      </div>
      <Invoice ref={printRef} hoaDon={hoaDon} />
    </div>
  )
}
