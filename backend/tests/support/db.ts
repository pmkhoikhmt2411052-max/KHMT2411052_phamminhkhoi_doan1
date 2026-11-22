import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../../src/config/prisma'
import type { Role } from '../../src/constants/roles'

/** Kiểm tra lần nữa từ chính server DB: chỉ xóa dữ liệu trên CSDL *_test. */
export async function assertTestDatabase(): Promise<void> {
  const rows = await prisma.$queryRaw<{ current_database: string }[]>`
    SELECT current_database() AS current_database
  `
  const name = rows[0]?.current_database
  if (!name?.endsWith('_test')) {
    throw new Error(`Từ chối thao tác: CSDL "${name}" không phải CSDL test (_test).`)
  }
}

/** Dọn sạch dữ liệu nghiệp vụ, giữ lại 4 dòng VaiTro đã seed. */
export async function cleanDb(): Promise<void> {
  await assertTestDatabase()

  await prisma.lichSuDiem.deleteMany()
  await prisma.lichSuTonKho.deleteMany()
  await prisma.voucherLuotDung.deleteMany()
  await prisma.thanhToan.deleteMany()
  await prisma.chiTietDonHang.deleteMany()
  await prisma.donHang.deleteMany()
  await prisma.donDatTruoc.deleteMany()
  await prisma.chiTietGioHang.deleteMany()
  await prisma.gioHang.deleteMany()
  await prisma.chiTietPhieuKiemKe.deleteMany()
  await prisma.phieuKiemKe.deleteMany()
  await prisma.chiTietPhieuNhap.deleteMany()
  await prisma.phieuNhapKho.deleteMany()
  await prisma.khachHang.deleteMany()
  await prisma.nhanVien.deleteMany()
  await prisma.taiKhoan.deleteMany()
}

/** Tạo tài khoản nhân viên trực tiếp trong test (không đi qua API đăng ký khách). */
export async function createStaffAccount(options: {
  role: Exclude<Role, 'KHACH_HANG'>
  username: string
  password: string
  hoTen?: string
}) {
  const roleRow = await prisma.vaiTro.findUniqueOrThrow({
    where: { maVaiTro: options.role },
  })
  const passwordHash = await bcrypt.hash(options.password, 4)

  return prisma.taiKhoan.create({
    data: {
      username: options.username,
      passwordHash,
      vaiTroId: roleRow.vaiTroId,
      nhanVien: {
        create: {
          maNv: `NV_TEST_${randomUUID().slice(0, 8)}`,
          hoTen: options.hoTen ?? 'Nhân viên test',
          ngayVaoLam: new Date(),
        },
      },
    },
  })
}

export async function lockAccount(id: string): Promise<void> {
  await prisma.taiKhoan.update({
    where: { id },
    data: { trangThai: 'BI_KHOA' },
  })
}
