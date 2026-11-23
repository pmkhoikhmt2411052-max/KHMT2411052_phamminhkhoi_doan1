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
    // NUMERIC luôn trả về dạng chuỗi, nhất quán giữa các endpoint.
    giaBan: String(sp.giaBan),
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
      giaBan: String(tp.sanPham.giaBan),
      hinhAnh: tp.sanPham.hinhAnh,
      conHang: tp.sanPham.soLuongTon > 0,
    })),
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
