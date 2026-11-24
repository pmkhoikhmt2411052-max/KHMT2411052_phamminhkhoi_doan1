import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { createApp } from '../src/app'
import { POS_CONFIG } from '../src/config/pos'
import { prisma } from '../src/config/prisma'
import { Decimal, formatMoney, toDecimal } from '../src/utils/money'
import { assertTestDatabase, cleanDb, createStaffAccount } from './support/db'

const app = createApp()
const PASSWORD = 'MatKhau@123'
const CASH = '1000000'
type StaffRole = 'ADMIN' | 'THU_NGAN' | 'NHAN_VIEN_KHO'

const tracks: Array<() => Promise<unknown>> = []
const productIds: string[] = []
const track = (fn: () => Promise<unknown>) => tracks.push(fn)
const suffix = () => randomUUID().slice(0, 8)

beforeAll(async () => {
  await assertTestDatabase()
})

beforeEach(async () => {
  await cleanDb()
})

afterEach(async () => {
  // Bất biến: tồn hiện tại phải bằng tổng biến động trong sổ kho (mọi test có tồn).
  for (const productId of productIds) {
    const product = await prisma.sanPham.findUniqueOrThrow({ where: { id: productId } })
    const sum = await prisma.lichSuTonKho.aggregate({
      where: { sanPhamId: productId },
      _sum: { soLuongThayDoi: true },
    })
    expect(product.soLuongTon).toBe(sum._sum.soLuongThayDoi ?? 0)
  }
  productIds.length = 0

  await cleanDb()
  for (const fn of [...tracks].reverse()) await fn()
  tracks.length = 0
})

afterAll(async () => {
  await prisma.$disconnect()
})

// ---------------------------------------------------------------- helpers

async function makeCategory(trangThai: 'HOAT_DONG' | 'TAM_AN' = 'HOAT_DONG') {
  const row = await prisma.danhMuc.create({
    data: { slug: `pos-${suffix()}`, tenDanhMuc: 'Danh mục POS test', trangThai },
  })
  track(() => prisma.danhMuc.deleteMany({ where: { danhMucId: row.danhMucId } }))
  return row
}

async function makeProduct(options: {
  danhMucId: number
  soLuongTon?: number
  giaBan?: number | string
  maSp?: string
  trangThai?: 'DANG_BAN' | 'NGUNG_BAN'
}) {
  const soLuongTon = options.soLuongTon ?? 0
  const row = await prisma.sanPham.create({
    data: {
      danhMucId: options.danhMucId,
      maSp: options.maSp ?? `SP-${suffix()}`,
      tenSp: 'Sản phẩm POS test',
      loaiSp: 'SACH',
      giaBan: options.giaBan ?? 1000,
      soLuongTon,
      trangThai: options.trangThai ?? 'DANG_BAN',
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
  productIds.push(row.id)
  track(() => prisma.sanPham.deleteMany({ where: { id: row.id } }))
  return row
}

type VoucherOptions = Partial<{
  loaiGiam: 'PHAN_TRAM' | 'SO_TIEN'
  giaTri: number | string
  giaTriDonToiThieu: number | string
  giamToiDa: number | string | null
  soLuong: number | null
  daSuDung: number
  gioiHanMoiKhach: number | null
  apDungKenh: 'TAT_CA' | 'POS' | 'ONLINE'
  ngayBatDau: Date
  ngayKetThuc: Date
  trangThai: 'HOAT_DONG' | 'TAM_DUNG' | 'HET_HAN'
}>

async function makeVoucher(options: VoucherOptions = {}) {
  const row = await prisma.voucher.create({
    data: {
      maVoucher: `VC-${suffix().toUpperCase()}`,
      tenVoucher: 'Voucher POS test',
      loaiGiam: options.loaiGiam ?? 'SO_TIEN',
      giaTri: options.giaTri ?? 10000,
      giaTriDonToiThieu: options.giaTriDonToiThieu ?? 0,
      giamToiDa: options.giamToiDa ?? null,
      soLuong: options.soLuong === undefined ? 10 : options.soLuong,
      daSuDung: options.daSuDung ?? 0,
      gioiHanMoiKhach: options.gioiHanMoiKhach ?? null,
      apDungKenh: options.apDungKenh ?? 'TAT_CA',
      ngayBatDau: options.ngayBatDau ?? new Date(Date.now() - 86_400_000),
      ngayKetThuc: options.ngayKetThuc ?? new Date(Date.now() + 86_400_000),
      trangThai: options.trangThai ?? 'HOAT_DONG',
    },
  })
  track(() => prisma.voucher.deleteMany({ where: { id: row.id } }))
  return row
}

async function makeCustomer(options: {
  diemTichLuy?: number
  trangThai?: 'HOAT_DONG' | 'BI_KHOA'
  sdt?: string
} = {}) {
  return prisma.khachHang.create({
    data: {
      hoTen: 'Khách POS test',
      sdt: options.sdt ?? `09${String(Date.now()).slice(-9)}`,
      email: `pos_${suffix()}@example.com`,
      diemTichLuy: options.diemTichLuy ?? 0,
      trangThai: options.trangThai ?? 'HOAT_DONG',
    },
  })
}

async function makeStaff(role: StaffRole, options: { trangThaiNhanVien?: 'DANG_LAM' | 'DA_NGHI' } = {}) {
  const id = suffix()
  const account = await createStaffAccount({ role, username: `pos_${id}`, password: PASSWORD })
  if (options.trangThaiNhanVien) {
    await prisma.nhanVien.update({
      where: { taiKhoanId: account.id },
      data: { trangThai: options.trangThaiNhanVien },
    })
  }
  const res = await request(app)
    .post('/api/auth/dang-nhap')
    .send({ dinhDanh: account.username, matKhau: PASSWORD })
  expect(res.status).toBe(200)
  const nhanVien = await prisma.nhanVien.findUniqueOrThrow({ where: { taiKhoanId: account.id } })
  return { token: res.body.token as string, nhanVienId: nhanVien.id, accountId: account.id }
}

async function headersFor(role: StaffRole = 'THU_NGAN', options?: { trangThaiNhanVien?: 'DANG_LAM' | 'DA_NGHI' }) {
  const staff = await makeStaff(role, options)
  return { Authorization: `Bearer ${staff.token}` }
}

async function customerToken() {
  const id = suffix()
  const res = await request(app)
    .post('/api/auth/dang-ky')
    .send({
      username: `kh_${id}`,
      password: PASSWORD,
      hoTen: 'Khách test',
      email: `kh_${id}@example.com`,
    })
  expect(res.status).toBe(201)
  return res.body.token as string
}

type BodyOptions = {
  tienKhachDua?: string
  maVoucher?: string
  diemSuDung?: number
  khachHangId?: string
  sdt?: string
  idempotencyKey?: string
}

function bodyFor(
  lines: Array<[string, number]>,
  options: BodyOptions = {},
): Record<string, unknown> {
  return {
    chiTiet: lines.map(([sanPhamId, soLuong]) => ({ sanPhamId, soLuong })),
    tienKhachDua: options.tienKhachDua ?? CASH,
    ...(options.maVoucher ? { maVoucher: options.maVoucher } : {}),
    ...(options.diemSuDung !== undefined ? { diemSuDung: options.diemSuDung } : {}),
    ...(options.khachHangId ? { khachHangId: options.khachHangId } : {}),
    ...(options.sdt ? { sdt: options.sdt } : {}),
    ...(options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
  }
}

const chot = (body: object, headers: Record<string, string>) =>
  request(app).post('/api/pos/chot-don').set(headers).send(body)

const baoGia = (body: object, headers: Record<string, string>) =>
  request(app).post('/api/pos/bao-gia').set(headers).send(body)

async function donHangCount(where: Record<string, unknown> = {}) {
  return prisma.donHang.count({ where: { kenhBan: 'POS', ...where } })
}

// ================================================================ quyền

describe('POS — phân quyền (UC02/UC04/UC05)', () => {
  const endpoints = [
    { method: 'get' as const, path: '/api/pos/san-pham' },
    { method: 'post' as const, path: '/api/pos/bao-gia' },
    { method: 'post' as const, path: '/api/pos/chot-don' },
    { method: 'get' as const, path: '/api/pos/don-hang' },
    { method: 'get' as const, path: `/api/pos/don-hang/${randomUUID()}` },
  ]

  it('thiếu token → 401 mọi endpoint POS', async () => {
    for (const endpoint of endpoints) {
      await request(app)[endpoint.method](endpoint.path).send({}).expect(401)
    }
  })

  it.each(['KHACH_HANG', 'NHAN_VIEN_KHO'] as const)('%s → 403 mọi endpoint POS', async (role) => {
    const headers =
      role === 'KHACH_HANG'
        ? { Authorization: `Bearer ${await customerToken()}` }
        : await headersFor(role)
    for (const endpoint of endpoints) {
      await request(app)[endpoint.method](endpoint.path).set(headers).send({}).expect(403)
    }
  })

  it('nhân viên DA_NGHI bị chặn (403)', async () => {
    const headers = await headersFor('THU_NGAN', { trangThaiNhanVien: 'DA_NGHI' })
    await request(app).post('/api/pos/chot-don').set(headers).send(bodyFor([])).expect(403)
    await request(app).get('/api/pos/don-hang').set(headers).expect(403)
  })
})

// ====================================================== báo giá / chốt đơn

describe('POS — báo giá khớp chốt đơn (UC04/UC05)', () => {
  it('báo giá và chốt đơn ra cùng tiền, chốt đúng đơn giá từ CSDL', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 5000, soLuongTon: 10 })
    const voucher = await makeVoucher({ giaTri: 1000, soLuong: 5 })
    const headers = await headersFor()
    const lines: Array<[string, number]> = [[product.id, 2]]
    const quoteBody = {
      chiTiet: lines.map(([sanPhamId, soLuong]) => ({ sanPhamId, soLuong })),
      maVoucher: voucher.maVoucher,
    }

    const quote = await baoGia(quoteBody, headers).expect(200)
    const expectedCong = Math.floor(Number(quote.body.tongTien) / POS_CONFIG.diemMoiTien)
    expect(quote.body.tienHang).toBe('10000.00')
    expect(quote.body.tienGiamVoucher).toBe('1000.00')
    expect(quote.body.tongTien).toBe('9000.00')
    expect(quote.body.diemCong).toBe(expectedCong)

    const res = await chot(bodyFor(lines, { maVoucher: voucher.maVoucher, tienKhachDua: '10000' }), headers).expect(201)
    expect(res.body).toMatchObject({
      maDh: expect.stringMatching(/^DH-\d{8}-[0-9A-F]{6}$/),
      tienHang: quote.body.tienHang,
      tienGiamVoucher: quote.body.tienGiamVoucher,
      tienGiamDiem: quote.body.tienGiamDiem,
      tongTien: quote.body.tongTien,
      diemCong: quote.body.diemCong,
      tienKhachDua: '10000.00',
      tienThua: '1000.00',
      kenhBan: 'POS',
      trangThai: 'DA_THANH_TOAN',
    })
    expect(res.body.chiTiet).toHaveLength(1)
    expect(res.body.chiTiet[0]).toMatchObject({ donGia: '5000.00', thanhTien: '10000.00', soLuong: 2 })
    expect(res.body.thanhToan).toMatchObject({
      phuongThuc: 'TIEN_MAT',
      trangThai: 'THANH_CONG',
      soTien: '9000.00',
    })

    const order = await prisma.donHang.findUniqueOrThrow({ where: { id: res.body.id } })
    expect(order.ngayThanhToan).not.toBeNull()
    expect(formatMoney(order.phiVanChuyen)).toBe('0.00')
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(8)
    const log = await prisma.lichSuTonKho.findFirstOrThrow({ where: { donHangId: order.id } })
    expect(log).toMatchObject({
      loaiBienDong: 'BAN_HANG',
      soLuongThayDoi: -2,
      soLuongTruoc: 10,
      soLuongSau: 8,
    })
  })

  it('giá/tiền từ client bị bỏ qua, mọi khoản được tính lại từ CSDL', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 1234.56, soLuongTon: 5 })
    const headers = await headersFor()
    const body = {
      chiTiet: [
        {
          sanPhamId: product.id,
          soLuong: 2,
          donGia: 1,
          thanhTien: 2,
          tenSp: 'Hàng giả',
          duTon: true,
        },
      ],
      tienKhachDua: CASH,
      tienHang: '1.00',
      tienGiamVoucher: '999.00',
      tienGiamDiem: '999.00',
      tongTien: '1.00',
      diemCong: 999,
      diemSuDung: 0,
    }
    const res = await chot(body, headers).expect(201)
    expect(res.body.tienHang).toBe('2469.12')
    expect(res.body.tongTien).toBe('2469.12')
    expect(res.body.chiTiet[0]).toMatchObject({ donGia: '1234.56', thanhTien: '2469.12' })
    expect(res.body.diemCong).toBe(Math.floor(2469 / POS_CONFIG.diemMoiTien))
    expect(res.body.tienThua).toBe(formatMoney(toDecimal(CASH).sub(toDecimal('2469.12'))))
  })
})

// ================================================================ voucher

describe('POS — từng quy tắc voucher (UC04)', () => {
  let headers: Record<string, string>
  let category: { danhMucId: number }
  let product: { id: string }

  beforeEach(async () => {
    headers = await headersFor()
    category = await makeCategory()
    product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 1000, soLuongTon: 20 })
  })

  const bodyWithVoucher = (maVoucher: string) => bodyFor([[product.id, 1]], { maVoucher })

  it('voucher hết hạn → 400', async () => {
    const voucher = await makeVoucher({ ngayKetThuc: new Date(Date.now() - 1000) })
    const res = await chot(bodyWithVoucher(voucher.maVoucher), headers).expect(400)
    expect(res.body.error.code).toBe('VOUCHER_EXPIRED')
  })

  it('voucher chưa bắt đầu → 400', async () => {
    const voucher = await makeVoucher({
      ngayBatDau: new Date(Date.now() + 86_400_000),
      ngayKetThuc: new Date(Date.now() + 172_800_000),
    })
    const res = await chot(bodyWithVoucher(voucher.maVoucher), headers).expect(400)
    expect(res.body.error.code).toBe('VOUCHER_NOT_STARTED')
  })

  it('voucher hết lượt → 400', async () => {
    const voucher = await makeVoucher({ soLuong: 1, daSuDung: 1 })
    const res = await chot(bodyWithVoucher(voucher.maVoucher), headers).expect(400)
    expect(res.body.error.code).toBe('VOUCHER_OUT_OF_STOCK')
  })

  it('voucher sai kênh → 400', async () => {
    const voucher = await makeVoucher({ apDungKenh: 'ONLINE' })
    const res = await chot(bodyWithVoucher(voucher.maVoucher), headers).expect(400)
    expect(res.body.error.code).toBe('VOUCHER_WRONG_CHANNEL')
  })

  it('đơn dưới giá trị tối thiểu → 400', async () => {
    const voucher = await makeVoucher({ giaTriDonToiThieu: 100000 })
    const res = await chot(bodyWithVoucher(voucher.maVoucher), headers).expect(400)
    expect(res.body.error.code).toBe('VOUCHER_MIN_ORDER')
  })

  it('vượt giới hạn mỗi khách → 400', async () => {
    const customer = await makeCustomer()
    const staff = await makeStaff('THU_NGAN')
    const voucher = await makeVoucher({ gioiHanMoiKhach: 1 })
    const oldOrder = await prisma.donHang.create({
      data: {
        maDh: `DH-CU-${suffix()}`,
        kenhBan: 'POS',
        nhanVienId: staff.nhanVienId,
        trangThai: 'DA_THANH_TOAN',
        ngayThanhToan: new Date(),
      },
    })
    await prisma.voucherLuotDung.create({
      data: { voucherId: voucher.id, donHangId: oldOrder.id, khachHangId: customer.id, soTienGiam: 100 },
    })
    const res = await chot(bodyFor([[product.id, 1]], {
      maVoucher: voucher.maVoucher,
      khachHangId: customer.id,
    }), headers).expect(400)
    expect(res.body.error.code).toBe('VOUCHER_PER_CUSTOMER_LIMIT')
  })

  it('giảm tối đa được áp dụng (PHAN_TRAM, có giamToiDa)', async () => {
    const expensive = await makeProduct({ danhMucId: category.danhMucId, giaBan: 10000, soLuongTon: 2 })
    const voucher = await makeVoucher({ loaiGiam: 'PHAN_TRAM', giaTri: 50, giamToiDa: 1000 })
    const res = await chot(bodyFor([[expensive.id, 1]], { maVoucher: voucher.maVoucher }), headers).expect(201)
    expect(res.body.tienGiamVoucher).toBe('1000.00')
    expect(res.body.tongTien).toBe('9000.00')
  })

  it('phần trăm làm tròn đến đồng, half-up', async () => {
    const voucher = await makeVoucher({ loaiGiam: 'PHAN_TRAM', giaTri: 1.25 })
    const res = await chot(bodyWithVoucher(voucher.maVoucher), headers).expect(201)
    // 1,25% của 1.000 = 12,5 → 13 (half-up).
    expect(res.body.tienGiamVoucher).toBe('13.00')
    expect(res.body.tongTien).toBe('987.00')
  })
})

// ================================================================== điểm

describe('POS — dùng điểm (UC04/UC05)', () => {
  let headers: Record<string, string>
  let category: { danhMucId: number }
  let product: { id: string }

  beforeEach(async () => {
    headers = await headersFor()
    category = await makeCategory()
    product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 1000, soLuongTon: 20 })
  })

  it('khách lẻ không được dùng điểm → 400', async () => {
    const res = await chot(bodyFor([[product.id, 1]], { diemSuDung: 1 }), headers).expect(400)
    expect(res.body.error.code).toBe('POINTS_REQUIRE_CUSTOMER')
  })

  it('không đủ điểm → 400', async () => {
    const customer = await makeCustomer({ diemTichLuy: 1 })
    const res = await chot(bodyFor([[product.id, 1]], {
      khachHangId: customer.id,
      diemSuDung: 2,
    }), headers).expect(400)
    expect(res.body.error.code).toBe('INSUFFICIENT_POINTS')
  })

  it('điểm dùng vượt tiền còn lại → 400', async () => {
    const diemSuDung = Math.ceil(1001 / POS_CONFIG.giaTriDiem) + 10
    const customer = await makeCustomer({ diemTichLuy: diemSuDung + 10 })
    const res = await chot(bodyFor([[product.id, 1]], {
      khachHangId: customer.id,
      diemSuDung,
    }), headers).expect(400)
    expect(res.body.error.code).toBe('POINTS_EXCEED_REMAINING')
  })

  it('khách BI_KHOA: mua được nhưng không dùng/không cộng điểm', async () => {
    const customer = await makeCustomer({ diemTichLuy: 1000, trangThai: 'BI_KHOA' })
    const res = await chot(bodyFor([[product.id, 1]], { khachHangId: customer.id }), headers).expect(201)
    expect(res.body).toMatchObject({ diemSuDung: 0, diemCong: 0 })
    expect((await prisma.khachHang.findUniqueOrThrow({ where: { id: customer.id } })).diemTichLuy).toBe(1000)
    expect(await prisma.lichSuDiem.count({ where: { khachHangId: customer.id } })).toBe(0)

    const locked = await chot(bodyFor([[product.id, 1]], {
      khachHangId: customer.id,
      diemSuDung: 1,
    }), headers).expect(400)
    expect(locked.body.error.code).toBe('CUSTOMER_LOCKED')
  })

  it('khách thường: trừ điểm dùng + cộng điểm thưởng, soDuSau đúng', async () => {
    const pricey = await makeProduct({ danhMucId: category.danhMucId, giaBan: 25000, soLuongTon: 20 })
    const customer = await makeCustomer({ diemTichLuy: 1000 })
    const res = await chot(bodyFor([[pricey.id, 1]], {
      khachHangId: customer.id,
      diemSuDung: 5,
    }), headers).expect(201)
    const tienGiamDiem = toDecimal(5).mul(POS_CONFIG.giaTriDiem)
    const tongTien = toDecimal(25000).sub(tienGiamDiem)
    const diemCong = tongTien.div(POS_CONFIG.diemMoiTien).floor().toNumber()
    expect(res.body.tienGiamDiem).toBe(formatMoney(tienGiamDiem))
    expect(res.body.tongTien).toBe(formatMoney(tongTien))
    expect(res.body).toMatchObject({ diemSuDung: 5, diemCong })

    expect((await prisma.khachHang.findUniqueOrThrow({ where: { id: customer.id } })).diemTichLuy).toBe(
      1000 - 5 + diemCong,
    )
    const logs = await prisma.lichSuDiem.findMany({
      where: { khachHangId: customer.id, donHangId: res.body.id },
      orderBy: { ngayTao: 'asc' },
    })
    expect(logs).toHaveLength(diemCong > 0 ? 2 : 1)
    expect(logs[0]).toMatchObject({ loai: 'TRU', soDiem: 5, soDuSau: 995 })
    if (diemCong > 0) {
      expect(logs[1]).toMatchObject({ loai: 'CONG', soDiem: diemCong, soDuSau: 995 + diemCong })
    }
  })

  it('đơn khách lẻ: không có khách, không ghi lịch sử điểm', async () => {
    const res = await chot(bodyFor([[product.id, 1]]), headers).expect(201)
    expect(res.body.khachHang).toBeNull()
    expect(res.body).toMatchObject({ diemSuDung: 0, diemCong: 0 })
    const order = await prisma.donHang.findUniqueOrThrow({ where: { id: res.body.id } })
    expect(order.khachHangId).toBeNull()
    expect(await prisma.lichSuDiem.count({ where: { donHangId: order.id } })).toBe(0)
  })
})

// ============================================== tồn kho, rollback, tranh chấp

describe('POS — tồn kho, rollback và tranh chấp (UC05)', () => {
  it('thiếu tồn → 409 INSUFFICIENT_STOCK, rollback toàn bộ (voucher, điểm, sổ kho)', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 1000, soLuongTon: 1 })
    const voucher = await makeVoucher({ giaTri: 100, soLuong: 3 })
    const customer = await makeCustomer({ diemTichLuy: 100 })
    const headers = await headersFor()

    const res = await chot(bodyFor([[product.id, 2]], {
      maVoucher: voucher.maVoucher,
      khachHangId: customer.id,
      diemSuDung: 1,
    }), headers).expect(409)
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK')
    expect(res.body.error.message).toContain(product.maSp)
    expect(res.body.error.message).not.toMatch(/23514|P2010|check constraint/i)

    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(1)
    expect(await donHangCount()).toBe(0)
    expect(await prisma.thanhToan.count()).toBe(0)
    expect(await prisma.voucherLuotDung.count()).toBe(0)
    expect((await prisma.voucher.findUniqueOrThrow({ where: { id: voucher.id } })).daSuDung).toBe(0)
    expect((await prisma.khachHang.findUniqueOrThrow({ where: { id: customer.id } })).diemTichLuy).toBe(100)
    expect(await prisma.lichSuDiem.count()).toBe(0)
    expect(await prisma.lichSuTonKho.count({ where: { sanPhamId: product.id, loaiBienDong: 'BAN_HANG' } })).toBe(0)
  })

  it('sản phẩm NGUNG_BAN / danh mục ẩn → 400', async () => {
    const active = await makeCategory()
    const hidden = await makeCategory('TAM_AN')
    const stopped = await makeProduct({ danhMucId: active.danhMucId, soLuongTon: 5, trangThai: 'NGUNG_BAN' })
    const hiddenProduct = await makeProduct({ danhMucId: hidden.danhMucId, soLuongTon: 5 })
    const headers = await headersFor()

    const res1 = await chot(bodyFor([[stopped.id, 1]]), headers).expect(400)
    expect(res1.body.error.code).toBe('PRODUCT_NOT_SELLABLE')
    const res2 = await chot(bodyFor([[hiddenProduct.id, 1]]), headers).expect(400)
    expect(res2.body.error.code).toBe('CATEGORY_HIDDEN')
    expect(await donHangCount()).toBe(0)
  })

  it('hai đơn tranh tồn cuối (Promise.all) chỉ một thành công', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 1000, soLuongTon: 1 })
    const headers = await headersFor()

    const results = await Promise.all([
      chot(bodyFor([[product.id, 1]], { idempotencyKey: `tranh-${suffix()}-a` }), headers),
      chot(bodyFor([[product.id, 1]], { idempotencyKey: `tranh-${suffix()}-b` }), headers),
    ])
    expect(results.map((res) => res.status).sort()).toEqual([201, 409])
    expect(results.find((res) => res.status === 409)!.body.error.code).toBe('INSUFFICIENT_STOCK')
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(0)
    expect(await donHangCount()).toBe(1)
    expect(await prisma.lichSuTonKho.count({ where: { sanPhamId: product.id, loaiBienDong: 'BAN_HANG' } })).toBe(1)
  })

  it('hạn mức voucher bị tranh (Promise.all) chỉ một lượt được dùng', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 1000, soLuongTon: 20 })
    const voucher = await makeVoucher({ soLuong: 1, giaTri: 100 })
    const headers = await headersFor()

    const results = await Promise.all([
      chot(bodyFor([[product.id, 1]], { maVoucher: voucher.maVoucher, idempotencyKey: `vc-${suffix()}-a` }), headers),
      chot(bodyFor([[product.id, 1]], { maVoucher: voucher.maVoucher, idempotencyKey: `vc-${suffix()}-b` }), headers),
    ])
    expect(results.map((res) => res.status).sort()).toEqual([201, 400])
    expect(results.find((res) => res.status === 400)!.body.error.code).toBe('VOUCHER_OUT_OF_STOCK')
    expect((await prisma.voucher.findUniqueOrThrow({ where: { id: voucher.id } })).daSuDung).toBe(1)
    expect(await prisma.voucherLuotDung.count({ where: { voucherId: voucher.id } })).toBe(1)
    expect(await donHangCount()).toBe(1)
  })
})

// ============================================================ idempotency

describe('POS — idempotency (UC05)', () => {
  it('cùng khóa + cùng nội dung → 200, trả lại đơn cũ, không tạo mới', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 1000, soLuongTon: 10 })
    const headers = await headersFor()
    const body = bodyFor([[product.id, 2]], { idempotencyKey: `idem-${suffix()}` })

    const first = await chot(body, headers).expect(201)
    const second = await chot(body, headers).expect(200)
    expect(second.body.maDh).toBe(first.body.maDh)
    expect(second.body.id).toBe(first.body.id)
    expect(await donHangCount()).toBe(1)
    expect(await prisma.thanhToan.count()).toBe(1)
    expect((await prisma.sanPham.findUniqueOrThrow({ where: { id: product.id } })).soLuongTon).toBe(8)
  })

  it('cùng khóa + khác nội dung → 409 IDEMPOTENCY_CONFLICT', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 1000, soLuongTon: 10 })
    const headers = await headersFor()
    const key = `idem-${suffix()}`
    await chot(bodyFor([[product.id, 1]], { idempotencyKey: key }), headers).expect(201)

    const res = await chot(bodyFor([[product.id, 2]], { idempotencyKey: key }), headers).expect(409)
    expect(res.body.error.code).toBe('IDEMPOTENCY_CONFLICT')
    expect(await donHangCount()).toBe(1)
  })

  it('hai yêu cầu đồng thời cùng khóa → chỉ một đơn (Promise.all)', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 1000, soLuongTon: 20 })
    const headers = await headersFor()
    const body = bodyFor([[product.id, 1]], { idempotencyKey: `idem-${suffix()}` })

    const results = await Promise.all([chot(body, headers), chot(body, headers)])
    expect(results.map((res) => res.status).sort()).toEqual([200, 201])
    expect(new Set(results.map((res) => res.body.id)).size).toBe(1)
    expect(await donHangCount()).toBe(1)
    expect(await prisma.thanhToan.count()).toBe(1)
    expect(await prisma.lichSuTonKho.count({ where: { sanPhamId: product.id, loaiBienDong: 'BAN_HANG' } })).toBe(1)
  })
})

// ============================================ hóa đơn & danh sách đơn POS

describe('POS — xem hóa đơn và danh sách đơn (UC05)', () => {
  it('xem lại hóa đơn / danh sách đơn của thu ngân; ADMIN xem được mọi đơn', async () => {
    const category = await makeCategory()
    const product = await makeProduct({ danhMucId: category.danhMucId, giaBan: 1000, soLuongTon: 10 })
    const staff = await makeStaff('THU_NGAN')
    const headers = { Authorization: `Bearer ${staff.token}` }
    const created = await chot(bodyFor([[product.id, 2]]), headers).expect(201)

    const invoice = await request(app).get(`/api/pos/don-hang/${created.body.id}`).set(headers).expect(200)
    expect(invoice.body).toMatchObject({ id: created.body.id, maDh: created.body.maDh })
    expect(invoice.body.tongTien).toBe(created.body.tongTien)
    // Tiền khách đưa không được lưu trong CSDL khi xem lại.
    expect(invoice.body.tienKhachDua).toBeNull()
    expect(invoice.body.tienThua).toBeNull()

    const list = await request(app).get('/api/pos/don-hang').set(headers).query({ page: 1, pageSize: 10 }).expect(200)
    expect(list.body.pagination).toMatchObject({ total: 1, totalPages: 1 })
    expect(list.body.data[0]).toMatchObject({ maDh: created.body.maDh, tongTien: created.body.tongTien })

    const other = await headersFor('THU_NGAN')
    await request(app).get(`/api/pos/don-hang/${created.body.id}`).set(other).expect(404)
    const otherList = await request(app).get('/api/pos/don-hang').set(other).expect(200)
    expect(otherList.body.pagination.total).toBe(0)

    const admin = await headersFor('ADMIN')
    await request(app).get(`/api/pos/don-hang/${created.body.id}`).set(admin).expect(200)
    const adminList = await request(app).get('/api/pos/don-hang').set(admin).expect(200)
    expect(adminList.body.pagination.total).toBe(1)
  })

  it('xem hóa đơn không tồn tại → 404', async () => {
    const headers = await headersFor()
    await request(app).get(`/api/pos/don-hang/${randomUUID()}`).set(headers).expect(404)
  })

  it('không có endpoint sửa hoặc xóa đơn (404)', async () => {
    const headers = await headersFor()
    const id = randomUUID()
    await request(app).patch(`/api/pos/don-hang/${id}`).set(headers).send({}).expect(404)
    await request(app).delete(`/api/pos/don-hang/${id}`).set(headers).expect(404)
    await request(app).patch(`/api/pos/chot-don/${id}`).set(headers).send({}).expect(404)
    await request(app).delete(`/api/pos/chot-don/${id}`).set(headers).expect(404)
  })
})
