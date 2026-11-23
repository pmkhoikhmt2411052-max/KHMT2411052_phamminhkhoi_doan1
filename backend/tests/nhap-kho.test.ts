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
})

afterEach(async () => {
  // Bất biến: tồn hiện tại phải bằng tổng biến động trong sổ kho.
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

function trackPhieu(id: string) {
  track(async () => {
    await prisma.$transaction(async (tx) => {
      await tx.phieuNhapKho.updateMany({ where: { id }, data: { tongTien: 0 } })
      await tx.chiTietPhieuNhap.deleteMany({ where: { phieuNhapId: id } })
      await tx.lichSuTonKho.deleteMany({ where: { phieuNhapId: id } })
      await tx.phieuNhapKho.deleteMany({ where: { id } })
    })
  })
}

async function makeCategory() {
  const row = await prisma.danhMuc.create({
    data: { slug: `nk-${suffix()}`, tenDanhMuc: 'Danh mục nhập kho test' },
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

async function makeProduct(options: { danhMucId: number; soLuongTon?: number; maSp?: string }) {
  const soLuongTon = options.soLuongTon ?? 0
  const row = await prisma.sanPham.create({
    data: {
      danhMucId: options.danhMucId,
      maSp: options.maSp ?? `SP-${suffix()}`,
      tenSp: 'Sản phẩm nhập kho test',
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

  const account = await createStaffAccount({ role, username: `nk_${id}`, password: PASSWORD })
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

async function makePhieu(
  headers: Record<string, string>,
  lines: Array<{ sanPhamId: string; soLuong: number; giaNhap: number }>,
  options: { nhaCungCapId: number; ngayNhap?: string; trangThai?: 'NHAP' | 'CHO_XAC_NHAN' } = { nhaCungCapId: 0 },
) {
  const res = await request(app)
    .post('/api/nhap-kho')
    .set(headers)
    .send({
      nhaCungCapId: options.nhaCungCapId,
      ngayNhap: options.ngayNhap ?? new Date().toISOString(),
      trangThai: options.trangThai ?? 'CHO_XAC_NHAN',
      chiTiet: lines,
    })
  expect(res.status).toBe(201)
  trackPhieu(res.body.id)
  return res.body
}

describe('Phiếu nhập kho — quyền (UC06/UC07)', () => {
  it('thiếu token → 401', async () => {
    await request(app).post('/api/nhap-kho').send({}).expect(401)
    await request(app).post(`/api/nhap-kho/${randomUUID()}/xac-nhan`).send({}).expect(401)
    await request(app).get(`/api/nhap-kho/lich-su-ton-kho/${randomUUID()}`).expect(401)
  })

  it.each(['KHACH_HANG', 'THU_NGAN'] as const)('%s → 403', async (role) => {
    const headers = await headersFor(role)
    await request(app).post('/api/nhap-kho').set(headers).send({}).expect(403)
    await request(app).get(`/api/nhap-kho/lich-su-ton-kho/${randomUUID()}`).set(headers).expect(403)
  })
})

describe('Lập phiếu, tiền và trạng thái (UC06)', () => {
  it('tính thanhTien/tongTien và tự sinh maPn', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const p1 = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 5 })
    const p2 = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 7 })

    const phieu = await makePhieu(await headersFor(), [
      { sanPhamId: p1.id, soLuong: 2, giaNhap: 10.5 },
      { sanPhamId: p2.id, soLuong: 3, giaNhap: 20 },
    ], { nhaCungCapId: supplier.nhaCungCapId })

    expect(phieu.maPn).toMatch(/^PN-\d{8}-[0-9A-F]{6}$/)
    expect(phieu.trangThai).toBe('CHO_XAC_NHAN')
    expect(phieu.tongTien).toBe('81.00')
    expect(phieu.chiTiet.map((line: { thanhTien: string }) => line.thanhTien)).toEqual(['21.00', '60.00'])
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: p1.id } })).soLuongTon).toBe(5)
  })

  it('gửi chờ xác nhận: NHAP → CHO_XAC_NHAN, chặn khi chưa có dòng', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const headers = await headersFor()

    const empty = await request(app).post('/api/nhap-kho').set(headers).send({
      nhaCungCapId: supplier.nhaCungCapId,
      ngayNhap: new Date().toISOString(),
      trangThai: 'NHAP',
    })
    expect(empty.status).toBe(400)

    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 1 })
    const draft = await makePhieu(headers, [{ sanPhamId: product.id, soLuong: 1, giaNhap: 5 }], {
      nhaCungCapId: supplier.nhaCungCapId,
      trangThai: 'NHAP',
    })
    const submitted = await request(app).post(`/api/nhap-kho/${draft.id}/gui`).set(headers).send().expect(200)
    expect(submitted.body.trangThai).toBe('CHO_XAC_NHAN')
    await request(app).post(`/api/nhap-kho/${draft.id}/gui`).set(headers).send().expect(409)
  })

  it('xóa dòng thì tongTien được tính lại trong cùng transaction', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const p1 = await makeProduct({ danhMucId: category.danhMucId })
    const p2 = await makeProduct({ danhMucId: category.danhMucId })
    const headers = await headersFor()
    const phieu = await makePhieu(headers, [
      { sanPhamId: p1.id, soLuong: 2, giaNhap: 10 },
      { sanPhamId: p2.id, soLuong: 3, giaNhap: 20 },
    ], { nhaCungCapId: supplier.nhaCungCapId })

    const res = await request(app)
      .delete(`/api/nhap-kho/${phieu.id}/chi-tiet/${p2.id}`)
      .set(headers)
      .expect(200)
    expect(res.body.chiTiet).toHaveLength(1)
    expect(res.body.tongTien).toBe('20.00')
  })

  it('hủy phiếu chưa nhập → DA_HUY, không đổi tồn', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 4 })
    const headers = await headersFor()
    const phieu = await makePhieu(headers, [{ sanPhamId: product.id, soLuong: 5, giaNhap: 10 }], {
      nhaCungCapId: supplier.nhaCungCapId,
    })

    const res = await request(app).post(`/api/nhap-kho/${phieu.id}/huy`).set(headers).send().expect(200)
    expect(res.body.trangThai).toBe('DA_HUY')
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(4)
    await request(app).post(`/api/nhap-kho/${phieu.id}/huy`).set(headers).send().expect(409)
  })
})

describe('Xác nhận nhập kho (UC07)', () => {
  it('cộng đúng tồn và ghi đúng LichSuTonKho', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const p1 = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 5 })
    const p2 = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 7 })
    const headers = await headersFor()
    const phieu = await makePhieu(headers, [
      { sanPhamId: p1.id, soLuong: 2, giaNhap: 10 },
      { sanPhamId: p2.id, soLuong: 3, giaNhap: 20 },
    ], { nhaCungCapId: supplier.nhaCungCapId })

    const res = await request(app).post(`/api/nhap-kho/${phieu.id}/xac-nhan`).set(headers).send().expect(200)
    expect(res.body.trangThai).toBe('DA_NHAP_KHO')
    expect(res.body.nguoiXacNhan).not.toBeNull()
    expect(res.body.ngayXacNhan).not.toBeNull()
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: p1.id } })).soLuongTon).toBe(7)
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: p2.id } })).soLuongTon).toBe(10)

    const logs = await prisma.lichSuTonKho.findMany({ where: { phieuNhapId: phieu.id } })
    expect(logs).toHaveLength(2)
    const log1 = logs.find((log) => log.sanPhamId === p1.id)!
    expect(log1).toMatchObject({
      loaiBienDong: 'NHAP_KHO',
      soLuongThayDoi: 2,
      soLuongTruoc: 5,
      soLuongSau: 7,
      phieuNhapId: phieu.id,
    })
    expect(log1.nguoiThucHienId).not.toBeNull()
  })

  it('xác nhận lặp → 409, tồn không đổi', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 1 })
    const headers = await headersFor()
    const phieu = await makePhieu(headers, [{ sanPhamId: product.id, soLuong: 4, giaNhap: 1 }], {
      nhaCungCapId: supplier.nhaCungCapId,
    })

    await request(app).post(`/api/nhap-kho/${phieu.id}/xac-nhan`).set(headers).send().expect(200)
    const second = await request(app).post(`/api/nhap-kho/${phieu.id}/xac-nhan`).set(headers).send().expect(409)
    expect(second.body.error.code).toBe('CONFLICT')
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(5)
    expect(await prisma.lichSuTonKho.count({ where: { phieuNhapId: phieu.id } })).toBe(1)
  })

  it('hai yêu cầu đồng thời (Promise.all) chỉ cộng tồn một lần', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 10 })
    const headers = await headersFor()
    const phieu = await makePhieu(headers, [{ sanPhamId: product.id, soLuong: 3, giaNhap: 1 }], {
      nhaCungCapId: supplier.nhaCungCapId,
    })

    const results = await Promise.all([
      request(app).post(`/api/nhap-kho/${phieu.id}/xac-nhan`).set(headers).send(),
      request(app).post(`/api/nhap-kho/${phieu.id}/xac-nhan`).set(headers).send(),
    ])
    expect(results.map((res) => res.status).sort()).toEqual([200, 409])
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(13)
    expect(await prisma.lichSuTonKho.count({ where: { phieuNhapId: phieu.id } })).toBe(1)
  })

  it('sửa dòng chạy đua với xác nhận: không có trạng thái dở', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 2 })
    const headers = await headersFor()
    const phieu = await makePhieu(headers, [{ sanPhamId: product.id, soLuong: 4, giaNhap: 1 }], {
      nhaCungCapId: supplier.nhaCungCapId,
    })

    const [edit, confirm] = await Promise.all([
      request(app)
        .patch(`/api/nhap-kho/${phieu.id}/chi-tiet/${product.id}`)
        .set(headers)
        .send({ sanPhamId: product.id, soLuong: 9, giaNhap: 1 }),
      request(app).post(`/api/nhap-kho/${phieu.id}/xac-nhan`).set(headers).send(),
    ])
    expect(confirm.status).toBe(200)
    expect([200, 409]).toContain(edit.status)
    const expectedAdded = edit.status === 200 ? 9 : 4
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(2 + expectedAdded)
    const logs = await prisma.lichSuTonKho.findMany({ where: { phieuNhapId: phieu.id } })
    expect(logs).toHaveLength(1)
    expect(logs[0].soLuongThayDoi).toBe(expectedAdded)
  })

  it('không hủy được phiếu đã nhập (409 có thông báo rõ)', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 1 })
    const headers = await headersFor()
    const phieu = await makePhieu(headers, [{ sanPhamId: product.id, soLuong: 1, giaNhap: 1 }], {
      nhaCungCapId: supplier.nhaCungCapId,
    })
    await request(app).post(`/api/nhap-kho/${phieu.id}/xac-nhan`).set(headers).send().expect(200)

    const res = await request(app).post(`/api/nhap-kho/${phieu.id}/huy`).set(headers).send().expect(409)
    expect(res.body.error.message).toContain('không thể hủy')
    expect(res.body.error.message).not.toMatch(/trigger|23514|P2010/i)
  })

  it('lỗi giữa chừng thì tồn và lịch sử không đổi (rollback)', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const p1 = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 5 })
    const p2 = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 2147483647 })
    const headers = await headersFor()
    const phieu = await makePhieu(headers, [
      { sanPhamId: p1.id, soLuong: 2, giaNhap: 10 },
      { sanPhamId: p2.id, soLuong: 1, giaNhap: 10 },
    ], { nhaCungCapId: supplier.nhaCungCapId })

    const res = await request(app).post(`/api/nhap-kho/${phieu.id}/xac-nhan`).set(headers).send()
    expect(res.status).toBeGreaterThanOrEqual(500)

    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: p1.id } })).soLuongTon).toBe(5)
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: p2.id } })).soLuongTon).toBe(2147483647)
    expect(await prisma.lichSuTonKho.count({ where: { phieuNhapId: phieu.id } })).toBe(0)
    expect((await prisma.phieuNhapKho.findUniqueOrThrow({ where: { id: phieu.id } })).trangThai).toBe('CHO_XAC_NHAN')
  })

  it('xem lịch sử tồn kho: mới nhất trước, phân trang', async () => {
    const category = await makeCategory()
    const supplier = await makeSupplier()
    const product = await makeProduct({ danhMucId: category.danhMucId, soLuongTon: 0 })
    const headers = await headersFor()
    const p1 = await makePhieu(headers, [{ sanPhamId: product.id, soLuong: 2, giaNhap: 1 }], {
      nhaCungCapId: supplier.nhaCungCapId,
    })
    await request(app).post(`/api/nhap-kho/${p1.id}/xac-nhan`).set(headers).send().expect(200)
    const p2 = await makePhieu(headers, [{ sanPhamId: product.id, soLuong: 3, giaNhap: 1 }], {
      nhaCungCapId: supplier.nhaCungCapId,
    })
    await request(app).post(`/api/nhap-kho/${p2.id}/xac-nhan`).set(headers).send().expect(200)

    const first = await request(app)
      .get(`/api/nhap-kho/lich-su-ton-kho/${product.id}`)
      .set(headers)
      .query({ page: 1, pageSize: 1 })
      .expect(200)
    const all = await request(app)
      .get(`/api/nhap-kho/lich-su-ton-kho/${product.id}`)
      .set(headers)
      .query({ page: 1, pageSize: 10 })
      .expect(200)

    expect(first.body.pagination).toMatchObject({ total: 2, totalPages: 2 })
    expect(first.body.data).toHaveLength(1)
    expect(all.body.data.map((log: { soLuongThayDoi: number }) => log.soLuongThayDoi)).toEqual([3, 2])
    expect(all.body.data.every((log: { loaiBienDong: string }) => log.loaiBienDong === 'NHAP_KHO')).toBe(true)
  })
})
