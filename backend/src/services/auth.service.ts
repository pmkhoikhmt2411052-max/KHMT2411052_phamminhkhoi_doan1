import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma'
import { ROLE, type Role } from '../constants/roles'
import { AppError, ConflictError, UnauthorizedError } from '../errors/app-error'
import type { LoginInput, RegisterInput } from '../validators/auth.validator'
import { signAccessToken } from './token.service'

/** Dùng để so sánh băm ngay cả khi không tìm thấy tài khoản (giảm rò rỉ thời gian). */
const DUMMY_PASSWORD_HASH = '$2b$10$BZkfp2m4XXR8egEKyXeVwuTagbNfkgDagYqyrQG8BTC0jeYl/fOR.'
const BCRYPT_ROUNDS = 12

/** Một câu chung cho cả "sai tài khoản" và "sai mật khẩu". */
export const INVALID_CREDENTIALS_MESSAGE = 'Tên đăng nhập hoặc mật khẩu không đúng'

type IdentifierKind = 'EMAIL' | 'PHONE' | 'USERNAME'

function normalizeIdentifier(raw: string): { value: string; kind: IdentifierKind } {
  const trimmed = raw.trim()
  if (trimmed.includes('@')) {
    return { value: trimmed.toLowerCase(), kind: 'EMAIL' }
  }
  const digits = trimmed.replace(/[\s().-]/g, '')
  if (/^\+?\d{9,15}$/.test(digits)) {
    return { value: digits, kind: 'PHONE' }
  }
  return { value: trimmed.toLowerCase(), kind: 'USERNAME' }
}

// Các DTO được dựng thủ công: không bao giờ trả password_hash.
function toTaiKhoanDto(account: {
  id: string
  username: string
  trangThai: string
  lanDangNhapCuoi: Date | null
  ngayTao: Date
  vaiTro: { maVaiTro: string }
}) {
  return {
    id: account.id,
    username: account.username,
    vaiTro: account.vaiTro.maVaiTro,
    trangThai: account.trangThai,
    lanDangNhapCuoi: account.lanDangNhapCuoi,
    ngayTao: account.ngayTao,
  }
}

function toKhachHangDto(khachHang: {
  id: string
  hoTen: string
  email: string | null
  sdt: string | null
  diemTichLuy: number
  diaChiMacDinh: string | null
  trangThai: string
  ngayTao: Date
}) {
  return {
    id: khachHang.id,
    hoTen: khachHang.hoTen,
    email: khachHang.email,
    sdt: khachHang.sdt,
    diemTichLuy: khachHang.diemTichLuy,
    diaChiMacDinh: khachHang.diaChiMacDinh,
    trangThai: khachHang.trangThai,
    ngayTao: khachHang.ngayTao,
  }
}

function toNhanVienDto(nhanVien: {
  id: string
  maNv: string
  hoTen: string
  email: string | null
  sdt: string | null
  ngayVaoLam: Date
  trangThai: string
}) {
  return {
    id: nhanVien.id,
    maNv: nhanVien.maNv,
    hoTen: nhanVien.hoTen,
    email: nhanVien.email,
    sdt: nhanVien.sdt,
    ngayVaoLam: nhanVien.ngayVaoLam,
    trangThai: nhanVien.trangThai,
  }
}

async function register(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)

  const result = await prisma.$transaction(async (tx) => {
    // Vai trò được ấn định cứng bởi server; client không thể tự chọn.
    const role = await tx.vaiTro.findUnique({ where: { maVaiTro: ROLE.KHACH_HANG } })
    if (!role) {
      throw new AppError(500, 'Chưa seed vai trò KHACH_HANG', 'ROLE_NOT_FOUND')
    }

    const [byUsername, byEmail, bySdt, byNhanVienEmail, byNhanVienSdt] = await Promise.all([
      tx.taiKhoan.findUnique({ where: { username: input.username } }),
      input.email ? tx.khachHang.findFirst({ where: { email: input.email } }) : null,
      input.sdt ? tx.khachHang.findFirst({ where: { sdt: input.sdt } }) : null,
      input.email ? tx.nhanVien.findFirst({ where: { email: input.email } }) : null,
      input.sdt ? tx.nhanVien.findFirst({ where: { sdt: input.sdt } }) : null,
    ])

    if (byUsername) throw new ConflictError('Tên đăng nhập đã tồn tại')
    if (byEmail || byNhanVienEmail) throw new ConflictError('Email đã tồn tại')
    if (bySdt || byNhanVienSdt) throw new ConflictError('Số điện thoại đã tồn tại')

    const now = new Date()
    const taiKhoan = await tx.taiKhoan.create({
      data: {
        username: input.username,
        passwordHash,
        vaiTroId: role.vaiTroId,
        trangThai: 'HOAT_DONG',
        // Đăng ký tự động đăng nhập theo UC10.
        lanDangNhapCuoi: now,
      },
      include: { vaiTro: true },
    })

    const khachHang = await tx.khachHang.create({
      data: {
        taiKhoanId: taiKhoan.id,
        hoTen: input.hoTen,
        email: input.email ?? null,
        sdt: input.sdt ?? null,
      },
    })

    return { taiKhoan, khachHang }
  })

  return {
    token: signAccessToken({
      id: result.taiKhoan.id,
      username: result.taiKhoan.username,
      vaiTro: ROLE.KHACH_HANG,
    }),
    taiKhoan: toTaiKhoanDto(result.taiKhoan),
    khachHang: toKhachHangDto(result.khachHang),
  }
}

async function login(input: LoginInput) {
  const identifier = normalizeIdentifier(input.dinhDanh)

  // Khách: username / email / sdt. Nhân viên: chỉ username.
  const account = await prisma.taiKhoan.findFirst({
    where:
      identifier.kind === 'USERNAME'
        ? { username: identifier.value }
        : { khachHang: { OR: [{ email: identifier.value }, { sdt: identifier.value }] } },
    include: { vaiTro: true, khachHang: true, nhanVien: true },
  })

  const passwordMatches = await bcrypt.compare(
    input.matKhau,
    account?.passwordHash ?? DUMMY_PASSWORD_HASH,
  )
  if (!account || !passwordMatches) {
    throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE)
  }

  // Chỉ tiết lộ trạng thái khóa SAU khi mật khẩu đã đúng:
  // sai tài khoản/sai mật khẩu (kể cả tài khoản bị khóa) vẫn trả 401 chung.
  if (account.trangThai === 'BI_KHOA') {
    throw new AppError(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ cửa hàng.', 'ACCOUNT_LOCKED')
  }
  if (account.khachHang?.trangThai === 'BI_KHOA') {
    throw new AppError(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ cửa hàng.', 'ACCOUNT_LOCKED')
  }

  await prisma.taiKhoan.update({
    where: { id: account.id },
    data: { lanDangNhapCuoi: new Date() },
  })

  const vaiTro = account.vaiTro.maVaiTro as Role
  const response: {
    token: string
    taiKhoan: ReturnType<typeof toTaiKhoanDto>
    khachHang?: ReturnType<typeof toKhachHangDto>
    nhanVien?: ReturnType<typeof toNhanVienDto>
  } = {
    token: signAccessToken({ id: account.id, username: account.username, vaiTro }),
    taiKhoan: toTaiKhoanDto(account),
  }
  if (account.khachHang) response.khachHang = toKhachHangDto(account.khachHang)
  if (account.nhanVien) response.nhanVien = toNhanVienDto(account.nhanVien)
  return response
}

async function getMe(authUserId: string) {
  const account = await prisma.taiKhoan.findUnique({
    where: { id: authUserId },
    include: { vaiTro: true, khachHang: true, nhanVien: true },
  })
  if (!account || account.trangThai === 'BI_KHOA') {
    throw new UnauthorizedError()
  }

  const response: {
    taiKhoan: ReturnType<typeof toTaiKhoanDto>
    khachHang?: ReturnType<typeof toKhachHangDto>
    nhanVien?: ReturnType<typeof toNhanVienDto>
  } = { taiKhoan: toTaiKhoanDto(account) }
  if (account.khachHang) response.khachHang = toKhachHangDto(account.khachHang)
  if (account.nhanVien) response.nhanVien = toNhanVienDto(account.nhanVien)
  return response
}

export const authService = { register, login, getMe }
