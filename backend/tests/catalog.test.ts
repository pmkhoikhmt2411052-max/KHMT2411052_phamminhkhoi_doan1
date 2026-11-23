import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { createApp } from '../src/app'
import { prisma } from '../src/config/prisma'
import { createStaffAccount, assertTestDatabase } from './support/db'

const app = createApp()
const PASSWORD = 'MatKhau@123'
type Role = 'ADMIN' | 'THU_NGAN' | 'NHAN_VIEN_KHO'
type LoaiSp = 'SACH' | 'TRUYEN_TRANH' | 'DO_DUNG_HOC_TAP' | 'BO_TRUYEN' | 'COMBO'

/** Mỗi test đăng ký cleanup riêng; không xóa dữ liệu của file test khác. */
const cleanups: Array<() => Promise<unknown>> = []
const track = (cleanup: () => Promise<unknown>) => cleanups.push(cleanup)
const suffix = () => randomUUID().slice(0, 8)

beforeAll(async () => {
  await assertTestDatabase()
})

afterEach(async () => {
  for (const cleanup of [...cleanups].reverse()) await cleanup()
  cleanups.length = 0
})

afterAll(async () => {
  await prisma.$disconnect()
})

async function makeCategory(options: { tenDanhMuc?: string; danhMucChaId?: number; trangThai?: 'HOAT_DONG' | 'TAM_AN' } = {}) {
  const row = await prisma.danhMuc.create({
    data: {
      slug: `cat-${suffix()}`,
      tenDanhMuc: options.tenDanhMuc ?? 'Danh mục test',
      danhMucChaId: options.danhMucChaId ?? null,
      trangThai: options.trangThai ?? 'HOAT_DONG',
    },
  })
  track(async () => prisma.danhMuc.deleteMany({ where: { danhMucId: row.danhMucId } }))
  return row
}

async function makeProduct(options: {
  danhMucId: number
  maSp?: string
  tenSp?: string
  loaiSp?: LoaiSp
  giaBan?: number | string
  isbn?: string | null
  tacGia?: string | null
  trangThai?: 'DANG_BAN' | 'NGUNG_BAN'
  ngayTao?: Date
  soLuongTon?: number
}) {
  const row = await prisma.sanPham.create({
    data: {
      danhMucId: options.danhMucId,
      maSp: options.maSp ?? `SP-${suffix()}`,
      tenSp: options.tenSp ?? 'Sản phẩm test',
      loaiSp: options.loaiSp ?? 'SACH',
      giaBan: options.giaBan ?? 100000,
      isbn: options.isbn ?? null,
      tacGia: options.tacGia ?? null,
      trangThai: options.trangThai ?? 'DANG_BAN',
      ngayTao: options.ngayTao ?? new Date(),
      soLuongTon: options.soLuongTon ?? 0,
    },
  })
  track(async () => prisma.sanPham.deleteMany({ where: { id: row.id } }))
  return row
}

async function makeToken(role: Role | 'KHACH_HANG'): Promise<string> {
  const id = suffix()
  if (role === 'KHACH_HANG') {
    const res = await request(app).post('/api/auth/dang-ky').send({
      username: `kh_${id}`,
      password: PASSWORD,
      hoTen: 'Khách test',
      email: `kh_${id}@example.com`,
    })
    expect(res.status).toBe(201)
    const accountId = res.body.taiKhoan.id as string
    track(async () => {
      const kh = await prisma.khachHang.findUnique({ where: { taiKhoanId: accountId } })
      if (kh) await prisma.khachHang.delete({ where: { id: kh.id } })
      await prisma.taiKhoan.deleteMany({ where: { id: accountId } })
    })
    return res.body.token
  }

  const account = await createStaffAccount({ role, username: `nv_${id}`, password: PASSWORD })
  track(async () => {
    await prisma.nhanVien.deleteMany({ where: { taiKhoanId: account.id } })
    await prisma.taiKhoan.deleteMany({ where: { id: account.id } })
  })
  const res = await request(app)
    .post('/api/auth/dang-nhap')
    .send({ dinhDanh: account.username, matKhau: PASSWORD })
  expect(res.status).toBe(200)
  return res.body.token
}

const adminHeaders = async () => ({ Authorization: `Bearer ${await makeToken('ADMIN')}` })

function assertNoInternalFields(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) assertNoInternalFields(item)
    return
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      expect(['soLuongTon', 'nhaCungCapId', 'nguongTonToiThieu']).not.toContain(key)
      assertNoInternalFields(child)
    }
  }
}

describe('API công khai — tìm kiếm / lọc (UC11)', () => {
  it('tìm không dấu theo tên, tác giả, mã và isbn', async () => {
    const category = await makeCategory()
    const id = suffix()
    const product = await makeProduct({
      danhMucId: category.danhMucId,
      tenSp: 'Bộ truyện Đắc Nhân Tâm',
      tacGia: 'Paulo Coelho',
      maSp: `TIM-${id}`,
      isbn: `978-${id}`,
    })

    for (const q of [
      'bo truyen dac nhan',
      'Bộ truyện',
      'paulo',
      `tim-${id}`,
      `978-${id}`,
    ]) {
      const res = await request(app).get('/api/san-pham').query({ q }).expect(200)
      expect(res.body.data.map((p: { id: string }) => p.id)).toContain(product.id)
    }
  })

  it('lọc danh mục cha bao gồm cả danh mục con', async () => {
    const parent = await makeCategory()
    const child = await makeCategory({ danhMucChaId: parent.danhMucId })
    const product = await makeProduct({ danhMucId: child.danhMucId, maSp: `CON-${suffix()}` })

    const byParent = await request(app)
      .get('/api/san-pham')
      .query({ danhMucId: parent.danhMucId, q: product.maSp })
      .expect(200)
    expect(byParent.body.data.map((p: { id: string }) => p.id)).toContain(product.id)
    expect(byParent.body.pagination.total).toBe(1)
  })

  it('lọc theo loại sản phẩm', async () => {
    const category = await makeCategory()
    const combo = await makeProduct({ danhMucId: category.danhMucId, loaiSp: 'COMBO', maSp: `CB-${suffix()}` })
    await makeProduct({ danhMucId: category.danhMucId, loaiSp: 'SACH', maSp: `SK-${suffix()}` })

    const res = await request(app).get('/api/san-pham').query({ loaiSp: 'COMBO', q: combo.maSp.slice(0, 2) }).expect(200)
    expect(res.body.data.every((p: { loaiSp: string }) => p.loaiSp === 'COMBO')).toBe(true)
    expect(res.body.data.map((p: { id: string }) => p.id)).toContain(combo.id)
  })

  it('sắp xếp gia / ten / ngayTao tăng và giảm', async () => {
    const category = await makeCategory()
    const key = `SRT-${suffix()}`
    const now = Date.now()
    await makeProduct({ danhMucId: category.danhMucId, maSp: `${key}-1`, tenSp: 'Zzz re', giaBan: 100, ngayTao: new Date(now) })
    await makeProduct({ danhMucId: category.danhMucId, maSp: `${key}-2`, tenSp: 'Aaa dat', giaBan: 300, ngayTao: new Date(now + 1000) })
    await makeProduct({ danhMucId: category.danhMucId, maSp: `${key}-3`, tenSp: 'Mmm giua', giaBan: 200, ngayTao: new Date(now + 2000) })

    const names = async (sort: string, order: string) => {
      const res = await request(app).get('/api/san-pham').query({ q: key, sort, order }).expect(200)
      return res.body.data.map((p: { tenSp: string }) => p.tenSp)
    }
    expect(await names('gia', 'asc')).toEqual(['Zzz re', 'Mmm giua', 'Aaa dat'])
    expect(await names('gia', 'desc')).toEqual(['Aaa dat', 'Mmm giua', 'Zzz re'])
    expect(await names('ten', 'asc')).toEqual(['Aaa dat', 'Mmm giua', 'Zzz re'])
    expect(await names('ten', 'desc')).toEqual(['Zzz re', 'Mmm giua', 'Aaa dat'])
    expect(await names('ngayTao', 'desc')).toEqual(['Mmm giua', 'Aaa dat', 'Zzz re'])
    expect(await names('ngayTao', 'asc')).toEqual(['Zzz re', 'Aaa dat', 'Mmm giua'])
  })

  it('phân trang và tổng số đúng', async () => {
    const category = await makeCategory()
    const key = `PG-${suffix()}`
    for (let i = 0; i < 3; i += 1) {
      await makeProduct({
        danhMucId: category.danhMucId,
        maSp: `${key}-${i}`,
        ngayTao: new Date(Date.now() + i * 1000),
      })
    }

    const first = await request(app).get('/api/san-pham').query({ q: key, page: 1, pageSize: 2 }).expect(200)
    const second = await request(app).get('/api/san-pham').query({ q: key, page: 2, pageSize: 2 }).expect(200)
    expect(first.body.data).toHaveLength(2)
    expect(second.body.data).toHaveLength(1)
    expect(first.body.pagination).toMatchObject({ page: 1, pageSize: 2, total: 3, totalPages: 2 })
    expect(second.body.pagination.total).toBe(3)
    const ids = [...first.body.data, ...second.body.data].map((p: { id: string }) => p.id)
    expect(new Set(ids).size).toBe(3)
  })

  it('tham số lạ và sort sai → 400', async () => {
    await request(app).get('/api/san-pham').query({ foo: 'bar' }).expect(400)
    await request(app).get('/api/san-pham').query({ sort: 'xxx' }).expect(400)
    await request(app).get('/api/san-pham').query({ order: 'sideways' }).expect(400)
  })

  it('sản phẩm NGUNG_BAN không xuất hiện ở danh sách và chi tiết trả 404', async () => {
    const category = await makeCategory()
    const product = await makeProduct({
      danhMucId: category.danhMucId,
      maSp: `AN-${suffix()}`,
      trangThai: 'NGUNG_BAN',
    })

    const list = await request(app).get('/api/san-pham').query({ q: product.maSp }).expect(200)
    expect(list.body.data).toHaveLength(0)
    await request(app).get(`/api/san-pham/${product.id}`).expect(404)
  })

  it('ẩn danh mục thì sản phẩm của nó cũng biến mất', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, maSp: `CATAN-${suffix()}` })
    const headers = await adminHeaders()
    await request(app)
      .patch(`/api/admin/danh-muc/${category.danhMucId}`)
      .set(headers)
      .send({ trangThai: 'TAM_AN' })
      .expect(200)

    const list = await request(app).get('/api/san-pham').query({ q: product.maSp }).expect(200)
    expect(list.body.data).toHaveLength(0)
    await request(app).get(`/api/san-pham/${product.id}`).expect(404)
    const tree = await request(app).get('/api/danh-muc').expect(200)
    expect(tree.body.map((dm: { id: number }) => dm.id)).not.toContain(category.danhMucId)
  })

  it('phản hồi công khai không chứa cột nội bộ', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, maSp: `DTO-${suffix()}`, soLuongTon: 7 })

    const list = await request(app).get('/api/san-pham').query({ q: product.maSp }).expect(200)
    const detail = await request(app).get(`/api/san-pham/${product.id}`).expect(200)
    assertNoInternalFields(list.body)
    assertNoInternalFields(detail.body)
    expect(detail.body.conHang).toBe(true)
  })
})

describe('API quản trị — quyền (UC15)', () => {
  it('thiếu token → 401 trên các route quản trị', async () => {
    await request(app).post('/api/admin/danh-muc').send({}).expect(401)
    await request(app).post('/api/admin/san-pham').send({}).expect(401)
    await request(app).put(`/api/admin/san-pham/${randomUUID()}/thanh-phan`).send({}).expect(401)
  })

  it.each(['KHACH_HANG', 'THU_NGAN', 'NHAN_VIEN_KHO'] as const)('%s → 403', async (role) => {
    const token = await makeToken(role)
    const res = await request(app)
      .post('/api/admin/san-pham')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
  })
})

describe('API quản trị — sản phẩm (UC15)', () => {
  const validBody = (danhMucId: number, maSp: string) => ({
    danhMucId,
    maSp,
    tenSp: 'Sản phẩm quản trị',
    loaiSp: 'SACH',
    giaBan: '15000.50',
  })

  it('tạo sản phẩm: tồn bằng 0, trả giá dạng chuỗi', async () => {
    const category = await makeCategory()
    const res = await request(app)
      .post('/api/admin/san-pham')
      .set(await adminHeaders())
      .send(validBody(category.danhMucId, `NEW-${suffix()}`))
      .expect(201)

    expect(res.body.soLuongTon).toBe(0)
    expect(res.body.giaBan).toBe('15000.50')
    track(async () => prisma.sanPham.deleteMany({ where: { id: res.body.id } }))
  })

  it('gửi soLuongTon hoặc giá âm → 400', async () => {
    const category = await makeCategory()
    const headers = await adminHeaders()
    await request(app)
      .post('/api/admin/san-pham')
      .set(headers)
      .send({ ...validBody(category.danhMucId, `ST-${suffix()}`), soLuongTon: 99 })
      .expect(400)
    await request(app)
      .post('/api/admin/san-pham')
      .set(headers)
      .send({ ...validBody(category.danhMucId, `NEG-${suffix()}`), giaBan: -1 })
      .expect(400)
  })

  it('trùng maSp hoặc isbn → 409', async () => {
    const category = await makeCategory()
    const headers = await adminHeaders()
    const maSp = `DUP-${suffix()}`
    const isbn = `978-${suffix()}`
    const first = await request(app)
      .post('/api/admin/san-pham')
      .set(headers)
      .send({ ...validBody(category.danhMucId, maSp), isbn })
      .expect(201)
    track(async () => prisma.sanPham.deleteMany({ where: { id: first.body.id } }))

    await request(app)
      .post('/api/admin/san-pham')
      .set(headers)
      .send(validBody(category.danhMucId, maSp))
      .expect(409)
    await request(app)
      .post('/api/admin/san-pham')
      .set(headers)
      .send({ ...validBody(category.danhMucId, `OTHER-${suffix()}`), isbn })
      .expect(409)
  })

  it('ẩn sản phẩm bằng trạng thái NGUNG_BAN', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, maSp: `HIDE-${suffix()}` })
    await request(app)
      .patch(`/api/admin/san-pham/${product.id}`)
      .set(await adminHeaders())
      .send({ trangThai: 'NGUNG_BAN' })
      .expect(200)

    await request(app).get(`/api/san-pham/${product.id}`).expect(404)
    const stored = await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })
    expect(stored.trangThai).toBe('NGUNG_BAN')
  })
})

describe('API quản trị — danh mục (UC15)', () => {
  it('danh mục cha là chính nó hoặc tạo chu trình → 400', async () => {
    const parent = await makeCategory()
    const child = await makeCategory({ danhMucChaId: parent.danhMucId })
    const headers = await adminHeaders()

    await request(app)
      .patch(`/api/admin/danh-muc/${parent.danhMucId}`)
      .set(headers)
      .send({ danhMucChaId: parent.danhMucId })
      .expect(400)
    await request(app)
      .patch(`/api/admin/danh-muc/${parent.danhMucId}`)
      .set(headers)
      .send({ danhMucChaId: child.danhMucId })
      .expect(400)
  })

  it('trùng slug danh mục → 409', async () => {
    const first = await makeCategory()
    await request(app)
      .post('/api/admin/danh-muc')
      .set(await adminHeaders())
      .send({ slug: first.slug, tenDanhMuc: 'Trùng slug' })
      .expect(409)
  })
})

describe('API quản trị — thành phần combo (UC15)', () => {
  it('từ chối tự chứa, combo khác, số lượng không dương, thành phần trùng', async () => {
    const category = await makeCategory()
    const combo = await makeProduct({ danhMucId: category.danhMucId, loaiSp: 'COMBO', maSp: `CMB-${suffix()}` })
    const otherCombo = await makeProduct({ danhMucId: category.danhMucId, loaiSp: 'BO_TRUYEN', maSp: `OTC-${suffix()}` })
    const component = await makeProduct({ danhMucId: category.danhMucId, loaiSp: 'SACH', maSp: `CMP-${suffix()}` })
    const headers = await adminHeaders()
    const url = `/api/admin/san-pham/${combo.id}/thanh-phan`

    await request(app).put(url).set(headers).send({ thanhPhan: [{ sanPhamId: combo.id, soLuong: 1 }] }).expect(400)
    await request(app).put(url).set(headers).send({ thanhPhan: [{ sanPhamId: otherCombo.id, soLuong: 1 }] }).expect(400)
    await request(app).put(url).set(headers).send({ thanhPhan: [{ sanPhamId: component.id, soLuong: 0 }] }).expect(400)
    await request(app)
      .put(url)
      .set(headers)
      .send({
        thanhPhan: [
          { sanPhamId: component.id, soLuong: 1 },
          { sanPhamId: component.id, soLuong: 2 },
        ],
      })
      .expect(400)
  })

  it('thay đổi thành phần là nguyên tử: lỗi giữa chừng không để lại dở', async () => {
    const category = await makeCategory()
    const combo = await makeProduct({ danhMucId: category.danhMucId, loaiSp: 'COMBO', maSp: `ATM-${suffix()}` })
    const otherCombo = await makeProduct({ danhMucId: category.danhMucId, loaiSp: 'COMBO', maSp: `ATM2-${suffix()}` })
    const component = await makeProduct({ danhMucId: category.danhMucId, loaiSp: 'SACH', maSp: `ATM3-${suffix()}` })
    const headers = await adminHeaders()
    const url = `/api/admin/san-pham/${combo.id}/thanh-phan`

    await request(app)
      .put(url)
      .set(headers)
      .send({ thanhPhan: [{ sanPhamId: component.id, soLuong: 3 }] })
      .expect(200)

    // Dòng đầu hợp lệ, dòng sau sai: validation chặn trước khi xóa/create.
    await request(app)
      .put(url)
      .set(headers)
      .send({
        thanhPhan: [
          { sanPhamId: component.id, soLuong: 9 },
          { sanPhamId: otherCombo.id, soLuong: 1 },
        ],
      })
      .expect(400)

    const rows = await prisma.thanhPhanCombo.findMany({ where: { comboId: combo.id } })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ sanPhamId: component.id, soLuong: 3 })
  })
})
