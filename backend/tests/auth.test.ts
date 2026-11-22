import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'
import { ROLE, type Role } from '../src/constants/roles'
import { INVALID_CREDENTIALS_MESSAGE } from '../src/services/auth.service'
import { prisma } from '../src/config/prisma'
import { cleanDb, createStaffAccount, lockAccount } from './support/db'

const app = createApp()
const PASSWORD = 'MatKhau@123'

function expectNoPasswordHash(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) expectNoPasswordHash(item)
    return
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      expect(key.toLowerCase()).not.toMatch(/password|matkhau|mat_khau/)
      expectNoPasswordHash(child)
    }
  }
}

function registerBody(overrides: Record<string, unknown> = {}) {
  return {
    username: 'khach01',
    password: PASSWORD,
    xacNhatMatKhau: PASSWORD,
    hoTen: 'Nguyễn Văn A',
    email: 'khach01@example.com',
    sdt: '0912345678',
    ...overrides,
  }
}

beforeEach(async () => {
  await cleanDb()
})

afterEach(async () => {
  await cleanDb()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Đăng ký — POST /api/auth/dang-ky', () => {
  it('đăng ký thành công: 201, đúng vai trò, không trả passwordHash', async () => {
    const res = await request(app).post('/api/auth/dang-ky').send(registerBody()).expect(201)

    expect(res.body.token).toBeTypeOf('string')
    expect(res.body.taiKhoan.vaiTro).toBe('KHACH_HANG')
    expect(res.body.taiKhoan.username).toBe('khach01')
    expect(res.body.khachHang.email).toBe('khach01@example.com')
    expect(res.body.khachHang.sdt).toBe('0912345678')
    expectNoPasswordHash(res.body)

    const stored = await prisma.taiKhoan.findUniqueOrThrow({
      where: { username: 'khach01' },
      include: { khachHang: true },
    })
    expect(stored.passwordHash).not.toBe(PASSWORD)
    expect(stored.khachHang).not.toBeNull()
  })

  it('trùng username → 409', async () => {
    await request(app).post('/api/auth/dang-ky').send(registerBody()).expect(201)
    const res = await request(app)
      .post('/api/auth/dang-ky')
      .send(registerBody({ email: 'khach02@example.com', sdt: '0912345679' }))
      .expect(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })

  it('trùng email → 409', async () => {
    await request(app).post('/api/auth/dang-ky').send(registerBody()).expect(201)
    const res = await request(app)
      .post('/api/auth/dang-ky')
      .send(registerBody({ username: 'khach02', sdt: '0912345679' }))
      .expect(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })

  it('trùng sdt → 409', async () => {
    await request(app).post('/api/auth/dang-ky').send(registerBody()).expect(201)
    const res = await request(app)
      .post('/api/auth/dang-ky')
      .send(registerBody({ username: 'khach02', email: 'khach02@example.com' }))
      .expect(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })

  it('thiếu cả email và sdt → 400', async () => {
    const res = await request(app)
      .post('/api/auth/dang-ky')
      .send(registerBody({ email: undefined, sdt: undefined }))
      .expect(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('mật khẩu ngắn → 400', async () => {
    const res = await request(app)
      .post('/api/auth/dang-ky')
      .send(registerBody({ password: 'short', xacNhatMatKhau: 'short' }))
      .expect(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('Đăng nhập — POST /api/auth/dang-nhap', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/dang-ky').send(registerBody()).expect(201)
  })

  it.each([
    ['username', 'khach01'],
    ['email', 'khach01@example.com'],
    ['sdt', '0912345678'],
  ])('đúng bằng %s → 200', async (_label, dinhDanh) => {
    const res = await request(app)
      .post('/api/auth/dang-nhap')
      .send({ dinhDanh, matKhau: PASSWORD })
      .expect(200)
    expect(res.body.token).toBeTypeOf('string')
    expect(res.body.taiKhoan.vaiTro).toBe('KHACH_HANG')
    expectNoPasswordHash(res.body)
  })

  it('sai mật khẩu và tài khoản không tồn tại → cùng 401, cùng câu', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/dang-nhap')
      .send({ dinhDanh: 'khach01', matKhau: 'SaiMatKhau@1' })
      .expect(401)
    const unknownAccount = await request(app)
      .post('/api/auth/dang-nhap')
      .send({ dinhDanh: 'khong_ton_tai', matKhau: 'SaiMatKhau@1' })
      .expect(401)

    expect(wrongPassword.body.error.message).toBe(INVALID_CREDENTIALS_MESSAGE)
    expect(unknownAccount.body.error.message).toBe(INVALID_CREDENTIALS_MESSAGE)
    expect(wrongPassword.body.error.code).toBe(unknownAccount.body.error.code)
  })

  it('tài khoản bị khóa + mật khẩu đúng → 403', async () => {
    const account = await prisma.taiKhoan.findUniqueOrThrow({ where: { username: 'khach01' } })
    await lockAccount(account.id)

    const res = await request(app)
      .post('/api/auth/dang-nhap')
      .send({ dinhDanh: 'khach01', matKhau: PASSWORD })
      .expect(403)
    expect(res.body.error.code).toBe('ACCOUNT_LOCKED')
  })

  it('tài khoản bị khóa + mật khẩu sai → vẫn 401 chung', async () => {
    const account = await prisma.taiKhoan.findUniqueOrThrow({ where: { username: 'khach01' } })
    await lockAccount(account.id)

    const res = await request(app)
      .post('/api/auth/dang-nhap')
      .send({ dinhDanh: 'khach01', matKhau: 'SaiMatKhau@1' })
      .expect(401)
    expect(res.body.error.message).toBe(INVALID_CREDENTIALS_MESSAGE)
  })
})

describe('GET /api/auth/toi', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/dang-ky').send(registerBody()).expect(201)
  })

  it('không token → 401', async () => {
    await request(app).get('/api/auth/toi').expect(401)
  })

  it('token sai → 401', async () => {
    await request(app)
      .get('/api/auth/toi')
      .set('Authorization', 'Bearer token-khong-hop-le')
      .expect(401)
  })

  it('token đúng → 200 và không trả passwordHash', async () => {
    const login = await request(app)
      .post('/api/auth/dang-nhap')
      .send({ dinhDanh: 'khach01', matKhau: PASSWORD })
      .expect(200)

    const res = await request(app)
      .get('/api/auth/toi')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200)
    expect(res.body.taiKhoan.username).toBe('khach01')
    expectNoPasswordHash(res.body)
  })
})

describe('RBAC — /api/thu-nghiem/*', () => {
  const cases: Array<{ role: Role; route: string; wrongRoute: string }> = [
    { role: ROLE.ADMIN, route: 'admin', wrongRoute: 'thu-ngan' },
    { role: ROLE.THU_NGAN, route: 'thu-ngan', wrongRoute: 'nhan-vien-kho' },
    { role: ROLE.NHAN_VIEN_KHO, route: 'nhan-vien-kho', wrongRoute: 'khach-hang' },
    { role: ROLE.KHACH_HANG, route: 'khach-hang', wrongRoute: 'admin' },
  ]

  async function tokenFor(role: Role): Promise<string> {
    if (role === ROLE.KHACH_HANG) {
      const res = await request(app).post('/api/auth/dang-ky').send(registerBody()).expect(201)
      return res.body.token
    }
    const username = `nv_${role.toLowerCase()}`
    await createStaffAccount({ role: role as Exclude<Role, 'KHACH_HANG'>, username, password: PASSWORD })
    const res = await request(app)
      .post('/api/auth/dang-nhap')
      .send({ dinhDanh: username, matKhau: PASSWORD })
      .expect(200)
    return res.body.token
  }

  it('không token → 401', async () => {
    await request(app).get('/api/thu-nghiem/admin').expect(401)
  })

  it.each(cases)('$role: đúng route → 200, sai route → 403', async ({ role, route, wrongRoute }) => {
    const token = await tokenFor(role)

    const allowed = await request(app)
      .get(`/api/thu-nghiem/${route}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(allowed.body.vaiTro).toBe(role)

    const denied = await request(app)
      .get(`/api/thu-nghiem/${wrongRoute}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
    expect(denied.body.error.code).toBe('FORBIDDEN')
  })

  it('route nhiều vai trò: NV được 200, khách hàng bị 403', async () => {
    for (const role of [ROLE.ADMIN, ROLE.THU_NGAN, ROLE.NHAN_VIEN_KHO] as const) {
      const token = await tokenFor(role)
      await request(app)
        .get('/api/thu-nghiem/nhieu-vai-tro')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      await cleanDb()
    }

    const customerToken = await tokenFor(ROLE.KHACH_HANG)
    await request(app)
      .get('/api/thu-nghiem/nhieu-vai-tro')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403)
  })
})
