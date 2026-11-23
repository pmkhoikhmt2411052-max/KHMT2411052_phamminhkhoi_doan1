/** NUMERIC luôn trả về chuỗi có đúng 2 chữ số thập phân. */
export function formatMoney(value: unknown): string {
  if (typeof value === 'number') return value.toFixed(2)
  if (typeof value === 'string') {
    const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim())
    return match ? `${match[1]}.${(match[2] ?? '').padEnd(2, '0')}` : value
  }
  if (value && typeof (value as { toFixed?: unknown }).toFixed === 'function') {
    return (value as { toFixed: (digits: number) => string }).toFixed(2)
  }
  return String(value)
}

/** DTO công khai: không trả nha_cung_cap_id, nguong_ton_toi_thieu, so_luong_ton, ngay_cap_nhat. */

type SanPhamBase = {
  id: string
  maSp: string
  isbn: string | null
  tenSp: string
  loaiSp: string
  tacGia: string | null
  nhaXuatBan: string | null
  namXuatBan: number | null
  moTa: string | null
  hinhAnh: string | null
  giaBan: unknown
  soLuongTon: number
  danhMucId: number
  ngayTao: Date
  danhMuc: { tenDanhMuc: string; slug: string }
}

export function toSanPhamPublicDto(sp: SanPhamBase) {
  return {
    id: sp.id,
    maSp: sp.maSp,
    isbn: sp.isbn,
    tenSp: sp.tenSp,
    loaiSp: sp.loaiSp,
    tacGia: sp.tacGia,
    nhaXuatBan: sp.nhaXuatBan,
    namXuatBan: sp.namXuatBan,
    moTa: sp.moTa,
    hinhAnh: sp.hinhAnh,
    giaBan: formatMoney(sp.giaBan),
    // Khách chỉ cần biết còn hàng hay không, không cần số tồn chính xác.
    conHang: sp.soLuongTon > 0,
    ngayTao: sp.ngayTao,
    danhMuc: {
      id: sp.danhMucId,
      tenDanhMuc: sp.danhMuc.tenDanhMuc,
      slug: sp.danhMuc.slug,
    },
  }
}

type ThanhPhan = {
  soLuong: number
  sanPham: {
    id: string
    tenSp: string
    maSp: string
    giaBan: unknown
    soLuongTon: number
    hinhAnh: string | null
  }
}

export function toSanPhamChiTietDto(sp: SanPhamBase & { thanhPhanComboCombo: ThanhPhan[] }) {
  return {
    ...toSanPhamPublicDto(sp),
    thanhPhan: sp.thanhPhanComboCombo.map((tp) => ({
      id: tp.sanPham.id,
      maSp: tp.sanPham.maSp,
      tenSp: tp.sanPham.tenSp,
      soLuong: tp.soLuong,
      giaBan: formatMoney(tp.sanPham.giaBan),
      hinhAnh: tp.sanPham.hinhAnh,
      conHang: tp.sanPham.soLuongTon > 0,
    })),
  }
}

/** DTO quản trị: có cả tồn kho, ngưỡng tồn, nhà cung cấp và trạng thái. */
type SanPhamAdmin = {
  id: string
  danhMucId: number
  nhaCungCapId: number | null
  maSp: string
  isbn: string | null
  tenSp: string
  loaiSp: string
  tacGia: string | null
  nhaXuatBan: string | null
  namXuatBan: number | null
  moTa: string | null
  hinhAnh: string | null
  giaBan: unknown
  soLuongTon: number
  nguongTonToiThieu: number
  trangThai: string
  ngayTao: Date
  ngayCapNhat: Date
}

export function toSanPhamAdminDto(sp: SanPhamAdmin) {
  return {
    id: sp.id,
    danhMucId: sp.danhMucId,
    nhaCungCapId: sp.nhaCungCapId,
    maSp: sp.maSp,
    isbn: sp.isbn,
    tenSp: sp.tenSp,
    loaiSp: sp.loaiSp,
    tacGia: sp.tacGia,
    nhaXuatBan: sp.nhaXuatBan,
    namXuatBan: sp.namXuatBan,
    moTa: sp.moTa,
    hinhAnh: sp.hinhAnh,
    giaBan: formatMoney(sp.giaBan),
    soLuongTon: sp.soLuongTon,
    nguongTonToiThieu: sp.nguongTonToiThieu,
    trangThai: sp.trangThai,
    ngayTao: sp.ngayTao,
    ngayCapNhat: sp.ngayCapNhat,
  }
}

export function toDanhMucAdminDto(dm: {
  danhMucId: number
  danhMucChaId: number | null
  slug: string
  tenDanhMuc: string
  moTa: string | null
  thuTu: number
  trangThai: string
}) {
  return {
    id: dm.danhMucId,
    danhMucChaId: dm.danhMucChaId,
    slug: dm.slug,
    tenDanhMuc: dm.tenDanhMuc,
    moTa: dm.moTa,
    thuTu: dm.thuTu,
    trangThai: dm.trangThai,
  }
}

export type DanhMucNode = {
  id: number
  slug: string
  tenDanhMuc: string
  moTa: string | null
  thuTu: number
  danhMucChaId: number | null
  con: DanhMucNode[]
}
