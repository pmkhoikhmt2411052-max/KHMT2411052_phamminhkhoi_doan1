import type { Role } from '../constants/roles'

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string
        username: string
        vaiTro: Role
        trangThai: 'HOAT_DONG' | 'BI_KHOA'
      }
    }
  }
}

export {}
