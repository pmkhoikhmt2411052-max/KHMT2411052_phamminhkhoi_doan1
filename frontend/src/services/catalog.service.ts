import { apiFetch, toQuery } from './api'

/** GET /api/danh-muc — cây danh mục chỉ gồm danh mục HOAT_DONG. */
export interface DanhMucNode {
  id: number
  slug: string
  tenDanhMuc: string
  moTa: string | null
  thuTu: number
  danhMucChaId: number | null
  con: DanhMucNode[]
}

/** DTO công khai theo docs/api.md mục 3.2 — không có soLuongTon chính xác. */
export interface SanPhamPublicDto {
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
  giaBan: string
  conHang: boolean
  ngayTao: string
  danhMuc: { id: number; tenDanhMuc: string; slug: string }
}

/** GET /api/san-pham/:id — thêm thanhPhan cho combo/bộ truyện. */
export interface SanPhamChiTietDto extends SanPhamPublicDto {
  thanhPhan: Array<{
    id: string
    tenSp: string
    maSp: string
    soLuong: number
    giaBan: string
    hinhAnh: string | null
    conHang: boolean
  }>
}

export interface PaginationDto {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface SanPhamListResponse {
  data: SanPhamPublicDto[]
  pagination: PaginationDto
}

export type LoaiSanPham = 'SACH' | 'TRUYEN_TRANH' | 'DO_DUNG_HOC_TAP' | 'BO_TRUYEN' | 'COMBO'
export type SapXepTheo = 'gia' | 'ten' | 'ngayTao'
export type ThuTuSapXep = 'asc' | 'desc'

export interface ListSanPhamParams {
  page?: number
  pageSize?: number
  q?: string
  danhMucId?: number
  loaiSp?: LoaiSanPham
  sort?: SapXepTheo
  order?: ThuTuSapXep
}

export const LOAI_SAN_PHAM: Array<{ value: LoaiSanPham; label: string }> = [
  { value: 'SACH', label: 'Sách' },
  { value: 'TRUYEN_TRANH', label: 'Truyện tranh' },
  { value: 'DO_DUNG_HOC_TAP', label: 'Đồ dùng học tập' },
  { value: 'BO_TRUYEN', label: 'Bộ truyện' },
  { value: 'COMBO', label: 'Combo' },
]

export function tenLoaiSanPham(value: string): string {
  return LOAI_SAN_PHAM.find((item) => item.value === value)?.label ?? value
}

/**
 * Chỉ gửi các tham số có trong docs/api.md. Backend dùng schema strict:
 * gửi tham số lạ (ví dụ khoảng giá, nhà xuất bản) → 400 VALIDATION_ERROR.
 */
export const catalogService = {
  danhMuc: () => apiFetch<DanhMucNode[]>('/api/danh-muc'),

  danhSach: (params: ListSanPhamParams) =>
    apiFetch<SanPhamListResponse>(
      `/api/san-pham${toQuery({ ...params, sort: params.sort, order: params.order })}`,
    ),

  chiTiet: (id: string) =>
    apiFetch<SanPhamChiTietDto>(`/api/san-pham/${encodeURIComponent(id)}`),
}
