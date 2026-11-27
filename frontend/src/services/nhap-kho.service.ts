import { apiFetch, toQuery } from './api'

export const TRANG_THAI_PHIEU = [
  { value: 'NHAP', label: 'Nháp' },
  { value: 'CHO_XAC_NHAN', label: 'Chờ xác nhận' },
  { value: 'DA_NHAP_KHO', label: 'Đã nhập kho' },
  { value: 'DA_HUY', label: 'Đã hủy' },
] as const

export type TrangThaiPhieu = (typeof TRANG_THAI_PHIEU)[number]['value']

export interface NhaCungCapSummary {
  id: number
  maNcc: string
  tenNhaCungCap: string
}

export interface NguoiLapSummary {
  id: string
  maNv: string
  hoTen: string
}

export interface ChiTietPhieuNhapDto {
  sanPhamId: string
  maSp: string
  tenSp: string
  soLuong: number
  giaNhap: string
  thanhTien: string
}

export interface PhieuNhapDto {
  id: string
  maPn: string
  nhaCungCap: NhaCungCapSummary
  nguoiLap: NguoiLapSummary | null
  nguoiXacNhan: NguoiLapSummary | null
  trangThai: TrangThaiPhieu
  tongTien: string
  ngayNhap: string
  ngayTao: string
  ngayXacNhan: string | null
  ghiChu: string | null
  chiTiet: ChiTietPhieuNhapDto[]
}

export interface PaginationDto {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PhieuNhapListResponse {
  data: PhieuNhapDto[]
  pagination: PaginationDto
}

export interface LichSuTonKhoDto {
  id: string
  loaiBienDong: string
  soLuongThayDoi: number
  soLuongTruoc: number
  soLuongSau: number
  ngayTao: string
  ghiChu: string | null
  nguoiThucHien: { id: string; hoTen: string } | null
  phieuNhapId: string | null
  donHangId: string | null
  phieuKiemKeId: string | null
}

export interface LichSuTonKhoResponse {
  data: LichSuTonKhoDto[]
  pagination: PaginationDto
}

/** Payload đúng schema strict của POST /api/nhap-kho — không gửi thành tiền/tổng tiền. */
export interface ChiTietNhapInput {
  sanPhamId: string
  soLuong: number
  giaNhap: string
}

export interface CreatePhieuNhapInput {
  nhaCungCapId: number
  ngayNhap: string
  ghiChu?: string | null
  trangThai: 'NHAP' | 'CHO_XAC_NHAN'
  chiTiet: ChiTietNhapInput[]
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })
}

export const nhapKhoService = {
  list: (params: { trangThai?: TrangThaiPhieu; page?: number; pageSize?: number }) =>
    apiFetch<PhieuNhapListResponse>(`/api/nhap-kho${toQuery({ ...params })}`),

  detail: (id: string) => apiFetch<PhieuNhapDto>(`/api/nhap-kho/${encodeURIComponent(id)}`),

  create: (input: CreatePhieuNhapInput) => post<PhieuNhapDto>('/api/nhap-kho', input),

  gui: (id: string) => post<PhieuNhapDto>(`/api/nhap-kho/${encodeURIComponent(id)}/gui`),

  huy: (id: string) => post<PhieuNhapDto>(`/api/nhap-kho/${encodeURIComponent(id)}/huy`),

  xacNhan: (id: string) => post<PhieuNhapDto>(`/api/nhap-kho/${encodeURIComponent(id)}/xac-nhan`),

  upsertChiTiet: (id: string, line: ChiTietNhapInput) =>
    post<PhieuNhapDto>(`/api/nhap-kho/${encodeURIComponent(id)}/chi-tiet`, line),

  xoaChiTiet: (id: string, sanPhamId: string) =>
    apiFetch<PhieuNhapDto>(`/api/nhap-kho/${encodeURIComponent(id)}/chi-tiet/${encodeURIComponent(sanPhamId)}`, {
      method: 'DELETE',
    }),

  lichSuTonKho: (sanPhamId: string, params: { page?: number; pageSize?: number }) =>
    apiFetch<LichSuTonKhoResponse>(
      `/api/nhap-kho/lich-su-ton-kho/${encodeURIComponent(sanPhamId)}${toQuery({ ...params })}`,
    ),
}
