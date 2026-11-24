import { apiFetch, toQuery } from './api'

export interface SanPhamPosDto {
  id: string
  maSp: string
  isbn: string | null
  tenSp: string
  loaiSp: string
  giaBan: string
  soLuongTon: number
  danhMucId: number
}

export interface PaginationDto {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface SanPhamListResponse {
  data: SanPhamPosDto[]
  pagination: PaginationDto
}

/** Chỉ gửi id + số lượng: mọi khoản tiền do server tính lại từ CSDL. */
export interface ChiTietInput {
  sanPhamId: string
  soLuong: number
}

export interface BaoGiaInput {
  chiTiet: ChiTietInput[]
  maVoucher?: string
  diemSuDung?: number
  khachHangId?: string
  sdt?: string
}

/** Schema strict ở backend: KHÔNG gửi donGia / thanhTien / tongTien từ client. */
export interface ChotDonInput extends BaoGiaInput {
  tienKhachDua: string
  idempotencyKey: string
}

export interface BaoGiaResponse {
  chiTiet: Array<{
    sanPhamId: string
    maSp: string
    tenSp: string
    soLuong: number
    donGia: string
    thanhTien: string
    duTon: boolean
  }>
  khachHang: { id: string; hoTen: string; sdt: string | null; diemTichLuy: number } | null
  voucher: { id: string; maVoucher: string; tenVoucher: string } | null
  tienHang: string
  tienGiamVoucher: string
  tienGiamDiem: string
  tongTien: string
  diemSuDung: number
  diemToiDa: number
  diemCong: number
}

export interface HoaDonDto {
  id: string
  maDh: string
  kenhBan: string
  trangThai: string
  khachHang: { id: string; hoTen: string; sdt: string | null; diemTichLuy: number } | null
  nhanVien: { id: string; maNv: string; hoTen: string } | null
  voucher: { id: string; maVoucher: string; tenVoucher: string } | null
  chiTiet: Array<{
    sanPhamId: string
    maSp: string
    tenSp: string
    soLuong: number
    donGia: string
    thanhTien: string
  }>
  tienHang: string
  tienGiamVoucher: string
  tienGiamDiem: string
  phiVanChuyen: string
  tongTien: string
  diemSuDung: number
  diemCong: number
  /** null khi xem lại hóa đơn (backend không lưu tiền khách đưa). */
  tienKhachDua: string | null
  tienThua: string | null
  thanhToan: {
    id: string
    maGiaoDich: string
    phuongThuc: string
    soTien: string
    trangThai: string
    thoiGian: string
  } | null
  ngayTao: string
  ngayThanhToan: string | null
}

export interface DonHangRow {
  id: string
  maDh: string
  trangThai: string
  tongTien: string
  diemSuDung: number
  diemCong: number
  khachHang: { id: string; hoTen: string; sdt: string | null } | null
  nhanVien: { id: string; maNv: string; hoTen: string } | null
  soDong: number
  ngayTao: string
  ngayThanhToan: string | null
}

export interface DonHangListResponse {
  data: DonHangRow[]
  pagination: PaginationDto
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export const posService = {
  sanPham: (params: { q?: string; page?: number; pageSize?: number }): Promise<SanPhamListResponse> =>
    apiFetch<SanPhamListResponse>(`/api/pos/san-pham${toQuery(params)}`),

  baoGia: (body: BaoGiaInput): Promise<BaoGiaResponse> => postJson<BaoGiaResponse>('/api/pos/bao-gia', body),

  chotDon: (body: ChotDonInput): Promise<HoaDonDto> => postJson<HoaDonDto>('/api/pos/chot-don', body),

  danhSachDonHang: (params: {
    page?: number
    pageSize?: number
    maDh?: string
  }): Promise<DonHangListResponse> =>
    apiFetch<DonHangListResponse>(`/api/pos/don-hang${toQuery(params)}`),

  xemHoaDon: (id: string): Promise<HoaDonDto> =>
    apiFetch<HoaDonDto>(`/api/pos/don-hang/${encodeURIComponent(id)}`),
}
