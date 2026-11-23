type NhanVienSummary = { id: string; maNv: string; hoTen: string } | null

export function toChiTietKiemKeDto(row: {
  sanPhamId: string
  soLuongHeThong: number
  soLuongThucTe: number
  chenhLech: number
  ghiChu: string | null
  sanPham: { maSp: string; tenSp: string }
}) {
  return {
    sanPhamId: row.sanPhamId,
    maSp: row.sanPham.maSp,
    tenSp: row.sanPham.tenSp,
    soLuongHeThong: row.soLuongHeThong,
    soLuongThucTe: row.soLuongThucTe,
    chenhLech: row.chenhLech,
    ghiChu: row.ghiChu,
  }
}

export function toPhieuKiemKeDto(phieu: {
  id: string
  maPkk: string
  danhMucId: number | null
  nguoiLapId: string
  nguoiDuyetId: string | null
  trangThai: string
  ngayTao: Date
  ngayGui: Date | null
  ngayDuyet: Date | null
  lyDoTuChoi: string | null
  ghiChu: string | null
  danhMuc: { tenDanhMuc: string } | null
  nguoiLap: NhanVienSummary
  nguoiDuyet: NhanVienSummary
  chiTietPhieuKiemKes: Parameters<typeof toChiTietKiemKeDto>[0][]
}) {
  return {
    id: phieu.id,
    maPkk: phieu.maPkk,
    danhMucId: phieu.danhMucId,
    danhMuc: phieu.danhMuc ? { id: phieu.danhMucId, tenDanhMuc: phieu.danhMuc.tenDanhMuc } : null,
    nguoiLap: phieu.nguoiLap,
    nguoiDuyet: phieu.nguoiDuyet,
    trangThai: phieu.trangThai,
    ngayTao: phieu.ngayTao,
    ngayGui: phieu.ngayGui,
    ngayDuyet: phieu.ngayDuyet,
    lyDoTuChoi: phieu.lyDoTuChoi,
    ghiChu: phieu.ghiChu,
    chiTiet: phieu.chiTietPhieuKiemKes.map(toChiTietKiemKeDto),
  }
}
