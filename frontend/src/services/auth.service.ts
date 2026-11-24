import { apiFetch, clearToken, getToken, saveToken } from './api'

export const ROLES = {
  ADMIN: 'ADMIN',
  THU_NGAN: 'THU_NGAN',
  NHAN_VIEN_KHO: 'NHAN_VIEN_KHO',
  KHACH_HANG: 'KHACH_HANG',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Quản trị viên',
  THU_NGAN: 'Thu ngân',
  NHAN_VIEN_KHO: 'Nhân viên kho',
  KHACH_HANG: 'Khách hàng',
}

/** Đường dẫn mặc định sau khi xác thực lại bằng /api/auth/toi. */
export const ROLE_HOME: Record<Role, string> = {
  KHACH_HANG: '/',
  THU_NGAN: '/pos',
  NHAN_VIEN_KHO: '/kho',
  ADMIN: '/quan-tri',
}

export interface TaiKhoanDto {
  id: string
  username: string
  vaiTro: Role
  trangThai: string
}

export interface MeResponse {
  taiKhoan: TaiKhoanDto
  khachHang?: { id: string; hoTen: string; sdt: string | null; diemTichLuy: number }
  nhanVien?: { id: string; maNv: string; hoTen: string; trangThai: string }
}

export interface LoginResponse extends MeResponse {
  token: string
}

export interface RegisterInput {
  username: string
  password: string
  xacNhatMatKhau: string
  hoTen: string
  email?: string
  sdt?: string
}

function persist(token: string): void {
  saveToken(token)
}

export const authService = {
  hasToken: (): boolean => Boolean(getToken()),

  async dangNhap(dinhDanh: string, matKhau: string): Promise<LoginResponse> {
    const result = await apiFetch<LoginResponse>('/api/auth/dang-nhap', {
      method: 'POST',
      body: JSON.stringify({ dinhDanh, matKhau }),
    })
    persist(result.token)
    return result
  },

  async dangKy(input: RegisterInput): Promise<LoginResponse> {
    const result = await apiFetch<LoginResponse>('/api/auth/dang-ky', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    persist(result.token)
    return result
  },

  /** Xác thực lại khi load ứng dụng và sau khi đăng nhập/đăng ký. */
  toi: (): Promise<MeResponse> => apiFetch<MeResponse>('/api/auth/toi'),

  dangXuat: (): void => clearToken(),
}
