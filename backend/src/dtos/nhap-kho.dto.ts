import { formatMoney } from './catalog.dto'

type NhanVienSummary = { id: string; maNv: string; hoTen: string } | null

export function toChiTietDto(row: {
  sanPhamId: string
  soLuong: number
  giaNhap: unknown
  thanhTien: unknown
  sanPham: { maSp: string; tenSp: string }
}) {
  return {
    sanPhamId: row.sanPhamId,
    maSp: row.sanPham.maSp,
    tenSp: row.sanPham.tenSp,
    soLuong: row.soLuong,
    giaNhap: formatMoney(row.giaNhap),
    thanhTien: formatMoney(row.thanhTien),
  }
}

export function toPhieuNhapDto(phieu: {
  id: string
  maPn: string
  nhaCungCapId: number
  nguoiLapId: string
  nguoiXacNhanId: string | null
  trangThai: string
  tongTien: unknown
  ngayNhap: Date
  ngayTao: Date
  ngayXacNhan: Date | null
  ghiChu: string | null
  nhaCungCap: { maNcc: string; tenNhaCungCap: string }
  nguoiLap: NhanVienSummary
  nguoiXacNhan: NhanVienSummary
  chiTietPhieuNhaps: Parameters<typeof toChiTietDto>[0][]
}) {
  return {
    id: phieu.id,
    maPn: phieu.maPn,
    nhaCungCap: {
      id: phieu.nhaCungCapId,
      maNcc: phieu.nhaCungCap.maNcc,
      tenNhaCungCap: phieu.nhaCungCap.tenNhaCungCap,
    },
    nguoiLap: phieu.nguoiLap,
    nguoiXacNhan: phieu.nguoiXacNhan,
    trangThai: phieu.trangThai,
    tongTien: formatMoney(phieu.tongTien),
    ngayNhap: phieu.ngayNhap,
    ngayTao: phieu.ngayTao,
    ngayXacNhan: phieu.ngayXacNhan,
    ghiChu: phieu.ghiChu,
    chiTiet: phieu.chiTietPhieuNhaps.map(toChiTietDto),
  }
}
