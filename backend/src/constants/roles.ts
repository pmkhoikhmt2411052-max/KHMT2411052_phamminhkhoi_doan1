/** 4 vai trò seed từ docs/database-design.md mục 4.2. */
export const ROLE_VALUES = ['ADMIN', 'THU_NGAN', 'NHAN_VIEN_KHO', 'KHACH_HANG'] as const

export type Role = (typeof ROLE_VALUES)[number]

export const ROLE = {
  ADMIN: 'ADMIN',
  THU_NGAN: 'THU_NGAN',
  NHAN_VIEN_KHO: 'NHAN_VIEN_KHO',
  KHACH_HANG: 'KHACH_HANG',
} as const satisfies Record<string, Role>
