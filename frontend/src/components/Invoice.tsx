import { forwardRef } from 'react'
import { Logo } from './Logo'
import type { HoaDonDto } from '../services/pos.service'
import { formatDateTime, formatMoney } from '../utils/money'

interface InvoiceProps {
  hoaDon: HoaDonDto
}

/** Khuôn mẫu hóa đơn UC05 — component thuần, nhận ref để react-to-print in. */
export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(function Invoice({ hoaDon }, ref) {
  return (
    <div ref={ref} className="print-area mx-auto max-w-2xl bg-white p-6 text-ink sm:p-8">
      <div className="mb-6 flex items-start justify-between border-b-2 border-primary pb-4">
        <div className="flex items-center gap-3">
          <Logo className="h-16" />
          <div>
            <p className="text-lg font-bold tracking-wide text-primary">HÓA ĐƠN BÁN HÀNG</p>
            <p className="text-xs text-muted">Hóa đơn bán lẻ · kênh {hoaDon.kenhBan}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">Số: {hoaDon.maDh}</p>
          <p className="text-xs text-muted">Ngày: {formatDateTime(hoaDon.ngayTao)}</p>
          <p className="text-xs text-muted">Trạng thái: {hoaDon.trangThai}</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="font-semibold">Khách hàng</p>
          <p>{hoaDon.khachHang?.hoTen ?? 'Khách lẻ'}</p>
          <p className="text-muted">SĐT: {hoaDon.khachHang?.sdt ?? '—'}</p>
        </div>
        <div className="sm:text-right">
          <p className="font-semibold">Nhân viên thu ngân</p>
          <p>{hoaDon.nhanVien?.hoTen ?? '—'}</p>
          <p className="text-muted">Mã NV: {hoaDon.nhanVien?.maNv ?? '—'}</p>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-y border-line">
            <th className="py-2 text-left">Sản phẩm</th>
            <th className="py-2 text-center">SL</th>
            <th className="py-2 text-right">Đơn giá</th>
            <th className="py-2 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {hoaDon.chiTiet.map((line) => (
            <tr key={line.sanPhamId} className="border-b border-line">
              <td className="py-2">
                <span className="font-medium">{line.tenSp}</span>
                <span className="ml-2 text-xs text-muted">{line.maSp}</span>
              </td>
              <td className="py-2 text-center">{line.soLuong}</td>
              <td className="py-2 text-right">{formatMoney(line.donGia)}</td>
              <td className="py-2 text-right">{formatMoney(line.thanhTien)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-5 w-full max-w-xs space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Tiền hàng</span>
          <span>{formatMoney(hoaDon.tienHang)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Giảm voucher{hoaDon.voucher ? ` (${hoaDon.voucher.maVoucher})` : ''}</span>
          <span>-{formatMoney(hoaDon.tienGiamVoucher)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Giảm điểm ({hoaDon.diemSuDung} điểm)</span>
          <span>-{formatMoney(hoaDon.tienGiamDiem)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Phí vận chuyển</span>
          <span>{formatMoney(hoaDon.phiVanChuyen)}</span>
        </div>
        <div className="flex justify-between border-t-2 border-primary pt-2 text-base font-bold">
          <span>Tổng thanh toán</span>
          <span>{formatMoney(hoaDon.tongTien)}</span>
        </div>
        {hoaDon.tienKhachDua !== null && (
          <>
            <div className="flex justify-between">
              <span className="text-muted">Tiền khách đưa</span>
              <span>{formatMoney(hoaDon.tienKhachDua)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tiền thối</span>
              <span>{formatMoney(hoaDon.tienThua)}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
        <span>Điểm tích lũy cộng thêm: {hoaDon.diemCong}</span>
        <span>
          Thanh toán: {hoaDon.thanhToan?.phuongThuc ?? '—'} · {formatDateTime(hoaDon.thanhToan?.thoiGian ?? hoaDon.ngayThanhToan)}
        </span>
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Cảm ơn quý khách đã mua sắm tại BookMark! Hóa đơn không được chỉnh sửa sau khi tạo.
      </p>
    </div>
  )
})
