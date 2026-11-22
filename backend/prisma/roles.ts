import type { PrismaClient } from '../generated/prisma/client.ts'

/** Seed cố định 4 dòng — nguồn: docs/database-design.md mục 4.2. */
export const roles = [
  {
    maVaiTro: 'ADMIN',
    tenVaiTro: 'Quản trị viên',
    moTa: 'Toàn quyền quản trị hệ thống',
  },
  {
    maVaiTro: 'THU_NGAN',
    tenVaiTro: 'Thu ngân',
    moTa: 'Bán hàng tại quầy (POS)',
  },
  {
    maVaiTro: 'NHAN_VIEN_KHO',
    tenVaiTro: 'Nhân viên kho',
    moTa: 'Quản lý nhập kho, kiểm kê và tồn kho',
  },
  {
    maVaiTro: 'KHACH_HANG',
    tenVaiTro: 'Khách hàng',
    moTa: 'Tài khoản khách hàng mua sắm online',
  },
] as const

/** Dùng chung cho `prisma db seed` và bộ kiểm thử (CSDL *_test). */
export async function seedRoles(prisma: PrismaClient): Promise<void> {
  for (const role of roles) {
    await prisma.vaiTro.upsert({
      where: { maVaiTro: role.maVaiTro },
      update: {
        tenVaiTro: role.tenVaiTro,
        moTa: role.moTa,
      },
      create: {
        maVaiTro: role.maVaiTro,
        tenVaiTro: role.tenVaiTro,
        moTa: role.moTa,
      },
    })
  }
}
