import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { createApp } from '../src/app'
import { prisma } from '../src/config/prisma'
import { assertTestDatabase, createStaffAccount } from './support/db'

const app = createApp()
const PASSWORD = 'MatKhau@123'
type Role = 'ADMIN' | 'THU_NGAN' | 'NHAN_VIEN_KHO' | 'KHACH_HANG'

const cleanups: Array<() => Promise<unknown>> = []
const stockProductIds: string[] = []
const track = (cleanup: () => Promise<unknown>) => cleanups.push(cleanup)
const suffix = () => randomUUID().slice(0, 8)

beforeAll(async () => {
  await assertTestDatabase()

  // Yêu cầu: kiểm tra dữ liệu sót từ test trước và dọn nếu có.
  const counts = {
    sanPham: await prisma.sanPham.count(),
    danhMuc: await prisma.danhMuc.count(),
    phieuKiemKe: await prisma.phieuKiemKe.count(),
    phieuNhapKho: await prisma.phieuNhapKho.count(),
    lichSuTonKho: await prisma.lichSuTonKho.count(),
  }
  if (Object.values(counts).some((count) => count > 0)) {
    console.warn('[kiem-ke.test] Dọn dữ liệu sót trong CSDL test:', counts)
    await prisma.lichSuTonKho.deleteMany()
    await prisma.chiTietPhieuKiemKe.deleteMany()
    await prisma.phieuKiemKe.deleteMany()
    const phieuNhaps = await prisma.phieuNhapKho.findMany({ select: { id: true } })
    for (const phieu of phieuNhaps) {
      await prisma.$transaction(async (tx) => {
        await tx.phieuNhapKho.updateMany({ where: { id: phieu.id }, data: { tongTien: 0 } })
        await tx.chiTietPhieuNhap.deleteMany({ where: { phieuNhapId: phieu.id } })
        await tx.phieuNhapKho.deleteMany({ where: { id: phieu.id } })
      })
    }
    await prisma.sanPham.deleteMany()
    await prisma.danhMuc.deleteMany()
  }
})

afterEach(async () => {
  for (const productId of stockProductIds) {
    const product = await prisma.sanPham.findUniqueOrThrow({ where: { id: productId } })
    const sum = await prisma.lichSuTonKho.aggregate({
      where: { sanPhamId: productId },
      _sum: { soLuongThayDoi: true },
    })
    expect(product.soLuongTon).toBe(sum._sum.soLuongThayDoi ?? 0)
  }
  stockProductIds.length = 0

  for (const cleanup of [...cleanups].reverse()) await cleanup()
  cleanups.length = 0
})

afterAll(async () => {
  await prisma.$disconnect()
})

function trackKiemKe(id: string) {
  track(async () => {
    await prisma.chiTietPhieuKiemKe.deleteMany({ where: { phieuKiemKeId: id } })
    await prisma.lichSuTonKho.deleteMany({ where: { phieuKiemKeId: id } })
    await prisma.phieuKiemKe.deleteMany({ where: { id } })
  })
}

function trackNhapKho(id: string) {
  track(async () => {
    await prisma.$transaction(async (tx) => {
      await tx.phieuNhapKho.updateMany({ where: { id }, data: { tongTien: 0 } })
      await tx.chiTietPhieuNhap.deleteMany({ where: { phieuNhapId: id } })
      await tx.lichSuTonKho.deleteMany({ where: { phieuNhapId: id } })
      await tx.phieuNhapKho.deleteMany({ where: { id } })
    })
  })
}

async function makeCategory(options: { danhMucChaId?: number } = {}) {
  const row = await prisma.danhMuc.create({
    data: {
      slug: `kk-${suffix()}`,
      tenDanhMuc: 'Danh mục kiểm kê test',
      danhMucChaId: options.danhMucChaId ?? null,
    },
  })
  track(async () => prisma.danhMuc.deleteMany({ where: { danhMucId: row.danhMucId } }))
  return row
}

async function makeSupplier() {
  const row = await prisma.nhaCungCap.create({
    data: { maNcc: `NCC-${suffix()}`, tenNhaCungCap: 'NCC test' },
  })
  track(async () => prisma.nhaCungCap.deleteMany({ where: { nhaCungCapId: row.nhaCungCapId } }))
  return row
}

async function makeProduct(options: { danhMucId: number; soLuongTon?: number }) {
  const soLuongTon = options.soLuongTon ?? 0
  const row = await prisma.sanPham.create({
    data: {
      danhMucId: options.danhMucId,
      maSp: `SP-${suffix()}`,
      tenSp: 'Sản phẩm kiểm kê test',
      loaiSp: 'SACH',
      giaBan: 1000,
      soLuongTon,
    },
  })
  if (soLuongTon > 0) {
    await prisma.lichSuTonKho.create({
      data: {
        sanPhamId: row.id,
        loaiBienDong: 'DIEU_CHINH',
        soLuongThayDoi: soLuongTon,
        soLuongTruoc: 0,
        soLuongSau: soLuongTon,
      },
    })
  }
  stockProductIds.push(row.id)
  track(async () => {
    await prisma.lichSuTonKho.deleteMany({ where: { sanPhamId: row.id } })
    await prisma.sanPham.deleteMany({ where: { id: row.id } })
  })
  return row
}

async function makeToken(role: Role): Promise<string> {
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

  const account = await createStaffAccount({ role, username: `kk_${id}`, password: PASSWORD })
  track(async () => {
    await prisma.lichSuTonKho.deleteMany({ where: { nguoiThucHienId: account.id } })
    await prisma.nhanVien.deleteMany({ where: { taiKhoanId: account.id } })
    await prisma.taiKhoan.deleteMany({ where: { id: account.id } })
  })
  const res = await request(app)
    .post('/api/auth/dang-nhap')
    .send({ dinhDanh: account.username, matKhau: PASSWORD })
  expect(res.status).toBe(200)
  return res.body.token
}

const headersFor = async (role: Role = 'NHAN_VIEN_KHO') => ({
  Authorization: `Bearer ${await makeToken(role)}`,
})

async function makeKiemKe(headers: Record<string, string>, danhMucId: number | null) {
  const res = await request(app).post('/api/kiem-ke').set(headers).send({ danhMucId })
  expect(res.status).toBe(201)
  trackKiemKe(res.body.id)
  return res.body
}

const setThucTe = (headers: Record<string, string>, phieuId: string, sanPhamId: string, soLuongThucTe: number) =>
  request(app)
    .patch(`/api/kiem-ke/${phieuId}/chi-tiet/${sanPhamId}`)
    .set(headers)
    .send({ soLuongThucTe })

const gui = (headers: Record<string, string>, phieuId: string) =>
  request(app).post(`/api/kiem-ke/${phieuId}/gui`).set(headers).send()

describe('Kiểm kê — quyền (UC08/UC09)', () => {
  it('thiếu token → 401', async () => {
    await request(app).post('/api/kiem-ke').send({}).expect(401)
    await request(app).post(`/api/kiem-ke/${randomUUID()}/duyet`).send({}).expect(401)
    await request(app).post(`/api/kiem-ke/${randomUUID()}/tu-choi`).send({}).expect(401)
  })

  it.each(['KHACH_HANG', 'THU_NGAN'] as const)('%s không lập được phiếu → 403', async (role) => {
    await request(app).post('/api/kiem-ke').set(await headersFor(role)).send({}).expect(403)
  })

  it('nhân viên kho không tự duyệt được → 403', async () => {
    const category = await makeCategory()
    await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 1 })
    const khoHeaders = await headersFor('NHAN_VIEN_KHO')
    const phieu = await makeKiemKe(khoHeaders, category.danhMucId)
    await gui(khoHeaders, phieu.id).expect(200)
    await request(app).post(`/api/kiem-ke/${phieu.id}/duyet`).set(khoHeaders).send().expect(403)
  })
})

describe('Kiểm kê — phạm vi và chênh lệch (UC08)', () => {
  it('toàn cửa hàng gồm mọi sản phẩm; theo danh mục chỉ đúng danh mục đó', async () => {
    const parent = await makeCategory()
    const child = await makeCategory({ danhMucChaId: parent.danhMucId })
    const pParent = await makeProduct({ danhMucId: parent.danhMucId, soLuongTon: 5 })
    const pChild = await makeProduct({ danhMucId: child.danhMucId, soLuongTon: 7 })
    const headers = await headersFor()

    const whole = await makeKiemKe(headers, null)
    expect(whole.chiTiet.map((line: { sanPhamId: string }) => line.sanPhamId).sort())
      .toEqual([pParent.id, pChild.id].sort())

    await request(app).post(`/api/kiem-ke/${whole.id}/huy`).set(headers).send().expect(200)

    const byParent = await makeKiemKe(headers, parent.danhMucId)
    expect(byParent.chiTiet.map((line: { sanPhamId: string }) => line.sanPhamId)).toEqual([pParent.id])
  })

  it('chênh lệch = thực tế - hệ thống', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 10 })
    const headers = await headersFor()
    const phieu = await makeKiemKe(headers, category.danhMucId)

    const res = await setThucTe(headers, phieu.id, product.id, 7).expect(200)
    const line = res.body.chiTiet.find((item: { sanPhamId: string }) => item.sanPhamId === product.id)
    expect(line).toMatchObject({ soLuongHeThong: 10, soLuongThucTe: 7, chenhLech: -3 })
  })

  it('chồng phạm vi → 409 rõ ràng', async () => {
    const catA = await makeCategory()
    const catB = await makeCategory()
    await makeProduct({ danhMucId: catA.danhMucId })
    await makeProduct({ danhMucId: catB.danhMucId })
    const headers = await headersFor()

    const whole = await makeKiemKe(headers, null)
    const overlap1 = await request(app).post('/api/kiem-ke').set(headers).send({ danhMucId: catA.danhMucId })
    expect(overlap1.status).toBe(409)
    expect(overlap1.body.error.message).toContain('trùng phạm vi')
    await request(app).post(`/api/kiem-ke/${whole.id}/huy`).set(headers).send().expect(200)

    const a = await makeKiemKe(headers, catA.danhMucId)
    const sameScope = await request(app).post('/api/kiem-ke').set(headers).send({ danhMucId: catA.danhMucId })
    expect(sameScope.status).toBe(409)
    const wholeAgain = await request(app).post('/api/kiem-ke').set(headers).send({ danhMucId: null })
    expect(wholeAgain.status).toBe(409)

    // Danh mục khác không chồng nhau.
    const b = await request(app).post('/api/kiem-ke').set(headers).send({ danhMucId: catB.danhMucId })
    expect(b.status).toBe(201)
    trackKiemKe(b.body.id)
    void a
  })
})

describe('Kiểm kê — duyệt / từ chối (UC09)', () => {
  it('duyệt cộng đúng tồn và ghi sổ KIEM_KE; dòng chênh 0 không ghi sổ', async () => {
    const category = await makeCategory()
    const p1 = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 5 })
    const p2 = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 4 })
    const khoHeaders = await headersFor('NHAN_VIEN_KHO')
    const adminHeaders = await headersFor('ADMIN')
    const phieu = await makeKiemKe(khoHeaders, category.danhMucId)

    await setThucTe(khoHeaders, phieu.id, p1.id, 8).expect(200)
    await setThucTe(khoHeaders, phieu.id, p2.id, 4).expect(200)
    await gui(khoHeaders, phieu.id).expect(200)

    const res = await request(app).post(`/api/kiem-ke/${phieu.id}/duyet`).set(adminHeaders).send().expect(200)
    expect(res.body.trangThai).toBe('DA_DUYET')
    expect(res.body.nguoiDuyet).not.toBeNull()
    expect(res.body.ngayDuyet).not.toBeNull()
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: p1.id } })).soLuongTon).toBe(8)
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: p2.id } })).soLuongTon).toBe(4)

    const logs = await prisma.lichSuTonKho.findMany({ where: { phieuKiemKeId: phieu.id } })
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({
      sanPhamId: p1.id,
      loaiBienDong: 'KIEM_KE',
      soLuongThayDoi: 3,
      soLuongTruoc: 5,
      soLuongSau: 8,
    })
    expect(logs[0].nguoiThucHienId).not.toBeNull()
  })

  it('duyệt khi có nhập kho xen giữa: tồn = tồn hiện tại + chênh lệch', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 5 })
    const khoHeaders = await headersFor('NHAN_VIEN_KHO')
    const adminHeaders = await headersFor('ADMIN')

    const phieu = await makeKiemKe(khoHeaders, category.danhMucId)
    await setThucTe(khoHeaders, phieu.id, product.id, 3).expect(200)
    await gui(khoHeaders, phieu.id).expect(200)

    // Nhập kho xen giữa: +3 → tồn hiện tại 8.
    const nhap = await request(app).post('/api/nhap-kho').set(khoHeaders).send({
      nhaCungCapId: supplier.nhaCungCapId,
      ngayNhap: new Date().toISOString(),
      chiTiet: [{ sanPhamId: product.id, soLuong: 3, giaNhap: 1 }],
    })
    expect(nhap.status).toBe(201)
    trackNhapKho(nhap.body.id)
    await request(app).post(`/api/nhap-kho/${nhap.body.id}/xac-nhan`).set(khoHeaders).send().expect(200)

    await request(app).post(`/api/kiem-ke/${phieu.id}/duyet`).set(adminHeaders).send().expect(200)
    // 8 + (3 - 5) = 6, không gán đè về 3.
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(6)
  })

  it('kết quả âm → rollback toàn bộ, báo rõ mã sản phẩm', async () => {
    const category = await makeCategory()
    const p1 = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 5 })
    const p2 = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 2 })
    const khoHeaders = await headersFor('NHAN_VIEN_KHO')
    const adminHeaders = await headersFor('ADMIN')
    const phieu = await makeKiemKe(khoHeaders, category.danhMucId)

    await setThucTe(khoHeaders, phieu.id, p1.id, 9).expect(200)
    await setThucTe(khoHeaders, phieu.id, p2.id, 0).expect(200)
    await gui(khoHeaders, phieu.id).expect(200)

    // Bán hàng xen giữa làm tồn p2 giảm còn 1 (ghi sổ để giữ bất biến).
    await prisma.sanPham.update({ where: { id: p2.id }, data: { soLuongTon: { decrement: 1 } } })
    await prisma.lichSuTonKho.create({
      data: {
        sanPhamId: p2.id,
        loaiBienDong: 'BAN_HANG',
        soLuongThayDoi: -1,
        soLuongTruoc: 2,
        soLuongSau: 1,
      },
    })

    const res = await request(app).post(`/api/kiem-ke/${phieu.id}/duyet`).set(adminHeaders).send()
    expect(res.status).toBe(409)
    expect(res.body.error.message).toContain(p2.maSp)
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: p1.id } })).soLuongTon).toBe(5)
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: p2.id } })).soLuongTon).toBe(1)
    expect(await prisma.lichSuTonKho.count({ where: { phieuKiemKeId: phieu.id } })).toBe(0)
    expect((await prisma.phieuKiemKe.findUniqueOrThrow({ where: { id: phieu.id } })).trangThai).toBe('CHO_DUYET')
  })

  it('từ chối bắt buộc lý do và không đổi tồn', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 6 })
    const khoHeaders = await headersFor('NHAN_VIEN_KHO')
    const adminHeaders = await headersFor('ADMIN')
    const phieu = await makeKiemKe(khoHeaders, category.danhMucId)
    await setThucTe(khoHeaders, phieu.id, product.id, 1).expect(200)
    await gui(khoHeaders, phieu.id).expect(200)

    await request(app).post(`/api/kiem-ke/${phieu.id}/tu-choi`).set(adminHeaders).send({}).expect(400)
    await request(app).post(`/api/kiem-ke/${phieu.id}/tu-choi`).set(adminHeaders).send({ lyDoTuChoi: '   ' }).expect(400)

    const res = await request(app)
      .post(`/api/kiem-ke/${phieu.id}/tu-choi`)
      .set(adminHeaders)
      .send({ lyDoTuChoi: 'Số liệu chưa khớp' })
      .expect(200)
    expect(res.body.trangThai).toBe('TU_CHOI')
    expect(res.body.lyDoTuChoi).toBe('Số liệu chưa khớp')
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(6)
  })

  it('TU_CHOI → sửa lại → gửi lại → duyệt được', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 6 })
    const khoHeaders = await headersFor('NHAN_VIEN_KHO')
    const adminHeaders = await headersFor('ADMIN')
    const phieu = await makeKiemKe(khoHeaders, category.danhMucId)
    await setThucTe(khoHeaders, phieu.id, product.id, 1).expect(200)
    await gui(khoHeaders, phieu.id).expect(200)
    await request(app).post(`/api/kiem-ke/${phieu.id}/tu-choi`).set(adminHeaders).send({ lyDoTuChoi: 'Sai số' }).expect(200)

    const back = await request(app).post(`/api/kiem-ke/${phieu.id}/sua-lai`).set(khoHeaders).send().expect(200)
    expect(back.body.trangThai).toBe('NHAP')
    await setThucTe(khoHeaders, phieu.id, product.id, 8).expect(200)
    await gui(khoHeaders, phieu.id).expect(200)
    await request(app).post(`/api/kiem-ke/${phieu.id}/duyet`).set(adminHeaders).send().expect(200)
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(8)
  })

  it('duyệt đồng thời (Promise.all) chỉ áp dụng một lần', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 10 })
    const khoHeaders = await headersFor('NHAN_VIEN_KHO')
    const adminHeaders = await headersFor('ADMIN')
    const phieu = await makeKiemKe(khoHeaders, category.danhMucId)
    await setThucTe(khoHeaders, phieu.id, product.id, 12).expect(200)
    await gui(khoHeaders, phieu.id).expect(200)

    const results = await Promise.all([
      request(app).post(`/api/kiem-ke/${phieu.id}/duyet`).set(adminHeaders).send(),
      request(app).post(`/api/kiem-ke/${phieu.id}/duyet`).set(adminHeaders).send(),
    ])
    expect(results.map((res) => res.status).sort()).toEqual([200, 409])
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(12)
    expect(await prisma.lichSuTonKho.count({ where: { phieuKiemKeId: phieu.id } })).toBe(1)
  })

  it('phiếu DA_DUYET không đổi trạng thái được nữa (409 rõ, không lộ trigger)', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 1 })
    const khoHeaders = await headersFor('NHAN_VIEN_KHO')
    const adminHeaders = await headersFor('ADMIN')
    const phieu = await makeKiemKe(khoHeaders, category.danhMucId)
    await gui(khoHeaders, phieu.id).expect(200)
    await request(app).post(`/api/kiem-ke/${phieu.id}/duyet`).set(adminHeaders).send().expect(200)

    const attempts = [
      request(app).post(`/api/kiem-ke/${phieu.id}/duyet`).set(adminHeaders).send(),
      request(app).post(`/api/kiem-ke/${phieu.id}/tu-choi`).set(adminHeaders).send({ lyDoTuChoi: 'x' }),
      request(app).post(`/api/kiem-ke/${phieu.id}/huy`).set(khoHeaders).send(),
      request(app).post(`/api/kiem-ke/${phieu.id}/gui`).set(khoHeaders).send(),
      request(app).post(`/api/kiem-ke/${phieu.id}/sua-lai`).set(khoHeaders).send(),
    ]
    const results = await Promise.all(attempts)
    for (const res of results) {
      expect(res.status).toBe(409)
      expect(res.body.error.message).not.toMatch(/trigger|23514|P2010|chan_doi_trang_thai/i)
    }
    expect((await prisma.phieuKiemKe.findUniqueOrThrow({ where: { id: phieu.id } })).trangThai).toBe('DA_DUYET')
  })
})
