import 'dotenv/config'
import { createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.ts'
import type {
  ApDungKenhVoucher,
  LoaiGiamVoucher,
  LoaiSanPham,
  TrangThaiVoucher,
} from '../generated/prisma/enums'
import { roles, seedRoles } from './roles'
const ADMIN_USERNAME = 'admin'
const ADMIN_MA_NV = 'NV_ADMIN'
const INITIAL_STOCK_NOTE = 'Tồn kho ban đầu (seed)'

/**
 * Sinh UUID xác định từ khóa seed.
 * Nhờ đó các bản ghi không có khóa nghiệp vụ unique (LichSuTonKho) vẫn upsert được.
 */
function seedUuid(key: string): string {
  const bytes = createHash('sha1').update(`bookmark-seed:${key}`).digest()
  bytes[6] = (bytes[6] & 0x0f) | 0x50
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytes.subarray(0, 16).toString('hex')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-')
}

const categories = [
  {
    slug: 'sach',
    tenDanhMuc: 'Sách',
    moTa: 'Sách các loại',
    thuTu: 1,
    parentSlug: null as string | null,
  },
  {
    slug: 'truyen-tranh',
    tenDanhMuc: 'Truyện tranh',
    moTa: 'Truyện tranh thiếu nhi và thanh thiếu niên',
    thuTu: 2,
    parentSlug: null as string | null,
  },
  {
    slug: 'do-dung-hoc-tap',
    tenDanhMuc: 'Đồ dùng học tập',
    moTa: 'Văn phòng phẩm và dụng cụ học tập',
    thuTu: 3,
    parentSlug: null as string | null,
  },
  {
    slug: 'bo-truyen',
    tenDanhMuc: 'Bộ truyện',
    moTa: 'Các bộ truyện nhiều tập',
    thuTu: 4,
    parentSlug: null as string | null,
  },
  {
    slug: 'combo',
    tenDanhMuc: 'Combo ưu đãi',
    moTa: 'Các gói sản phẩm bán kèm',
    thuTu: 5,
    parentSlug: null as string | null,
  },
  {
    slug: 'sach-van-hoc',
    tenDanhMuc: 'Văn học',
    moTa: 'Tiểu thuyết và tác phẩm văn học',
    thuTu: 1,
    parentSlug: 'sach',
  },
  {
    slug: 'sach-ky-nang',
    tenDanhMuc: 'Kỹ năng sống',
    moTa: 'Sách phát triển bản thân và kỹ năng',
    thuTu: 2,
    parentSlug: 'sach',
  },
  {
    slug: 'truyen-tranh-thieu-nhi',
    tenDanhMuc: 'Truyện tranh thiếu nhi',
    moTa: 'Truyện tranh dành cho thiếu nhi',
    thuTu: 1,
    parentSlug: 'truyen-tranh',
  },
]

const products = [
  {
    maSp: 'SP001',
    categorySlug: 'sach-van-hoc',
    isbn: '9786041181123',
    tenSp: 'Nhà giả kim',
    loaiSp: 'SACH',
    tacGia: 'Paulo Coelho',
    nhaXuatBan: 'NXB Văn học',
    namXuatBan: 2020,
    moTa: 'Tiểu thuyết nổi tiếng về hành trình theo đuổi ước mơ.',
    giaBan: 120000,
    soLuongTon: 20,
    nguongTonToiThieu: 5,
  },
  {
    maSp: 'SP002',
    categorySlug: 'sach-ky-nang',
    isbn: '9786041181130',
    tenSp: 'Đắc nhân tâm',
    loaiSp: 'SACH',
    tacGia: 'Dale Carnegie',
    nhaXuatBan: 'NXB Tổng hợp TP.HCM',
    namXuatBan: 2021,
    moTa: 'Sách kinh điển về nghệ thuật giao tiếp và ứng xử.',
    giaBan: 150000,
    soLuongTon: 15,
    nguongTonToiThieu: 5,
  },
  {
    maSp: 'SP003',
    categorySlug: 'sach-ky-nang',
    isbn: '9786041181147',
    tenSp: 'Tuổi trẻ đáng giá bao nhiêu',
    loaiSp: 'SACH',
    tacGia: 'Rosie Nguyễn',
    nhaXuatBan: 'NXB Hội Nhà văn',
    namXuatBan: 2019,
    moTa: 'Sách truyền cảm hứng dành cho người trẻ.',
    giaBan: 110000,
    soLuongTon: 18,
    nguongTonToiThieu: 5,
  },
  {
    maSp: 'SP004',
    categorySlug: 'truyen-tranh-thieu-nhi',
    isbn: '9786041181154',
    tenSp: 'Doraemon tập 1',
    loaiSp: 'TRUYEN_TRANH',
    tacGia: 'Fujiko F. Fujio',
    nhaXuatBan: 'NXB Kim Đồng',
    namXuatBan: 2022,
    moTa: 'Tập đầu tiên của bộ truyện tranh Doraemon.',
    giaBan: 30000,
    soLuongTon: 30,
    nguongTonToiThieu: 10,
  },
  {
    maSp: 'SP005',
    categorySlug: 'truyen-tranh-thieu-nhi',
    isbn: '9786041181161',
    tenSp: 'One Piece tập 1',
    loaiSp: 'TRUYEN_TRANH',
    tacGia: 'Eiichiro Oda',
    nhaXuatBan: 'NXB Kim Đồng',
    namXuatBan: 2023,
    moTa: 'Tập đầu tiên của bộ truyện tranh One Piece.',
    giaBan: 35000,
    soLuongTon: 25,
    nguongTonToiThieu: 10,
  },
  {
    maSp: 'SP006',
    categorySlug: 'do-dung-hoc-tap',
    isbn: null,
    tenSp: 'Bút bi Thiên Long TL-027',
    loaiSp: 'DO_DUNG_HOC_TAP',
    tacGia: null,
    nhaXuatBan: null,
    namXuatBan: null,
    moTa: 'Bút bi mực xanh, đầu bi 0.5 mm.',
    giaBan: 5000,
    soLuongTon: 100,
    nguongTonToiThieu: 20,
  },
  {
    maSp: 'SP007',
    categorySlug: 'do-dung-hoc-tap',
    isbn: null,
    tenSp: 'Vở ô ly 96 trang',
    loaiSp: 'DO_DUNG_HOC_TAP',
    tacGia: null,
    nhaXuatBan: null,
    namXuatBan: null,
    moTa: 'Vở học sinh 96 trang, giấy trắng, kẻ ô ly.',
    giaBan: 12000,
    soLuongTon: 80,
    nguongTonToiThieu: 20,
  },
  {
    maSp: 'SP008',
    categorySlug: 'do-dung-hoc-tap',
    isbn: null,
    tenSp: 'Bộ thước kẻ 4 món',
    loaiSp: 'DO_DUNG_HOC_TAP',
    tacGia: null,
    nhaXuatBan: null,
    namXuatBan: null,
    moTa: 'Bộ thước kẻ, ê-ke, thước đo độ và compa.',
    giaBan: 25000,
    soLuongTon: 40,
    nguongTonToiThieu: 10,
  },
  {
    maSp: 'SP009',
    categorySlug: 'bo-truyen',
    isbn: '9786041181178',
    tenSp: 'Harry Potter trọn bộ 7 tập',
    loaiSp: 'BO_TRUYEN',
    tacGia: 'J.K. Rowling',
    nhaXuatBan: 'NXB Trẻ',
    namXuatBan: 2020,
    moTa: 'Trọn bộ 7 tập Harry Potter bản đẹp.',
    giaBan: 950000,
    soLuongTon: 5,
    nguongTonToiThieu: 2,
  },
  {
    maSp: 'SP010',
    categorySlug: 'combo',
    isbn: null,
    tenSp: 'Combo học tập cơ bản',
    loaiSp: 'COMBO',
    tacGia: null,
    nhaXuatBan: null,
    namXuatBan: null,
    moTa: 'Combo gồm bút bi, vở ô ly và bộ thước kẻ.',
    giaBan: 35000,
    soLuongTon: 15,
    nguongTonToiThieu: 5,
  },
]

const comboComponents = [
  { maSp: 'SP006', soLuong: 1 },
  { maSp: 'SP007', soLuong: 1 },
  { maSp: 'SP008', soLuong: 1 },
]

// 2 voucher mẫu để thử POS khi demo — mã CHỮ HOA (bắt buộc bởi CHECK mới).
const vouchers: Array<{
  maVoucher: string
  tenVoucher: string
  loaiGiam: LoaiGiamVoucher
  giaTri: number
  giaTriDonToiThieu: number
  giamToiDa: number | null
  soLuong: number
  gioiHanMoiKhach: number | null
  apDungKenh: ApDungKenhVoucher
  ngayBatDau: Date
  ngayKetThuc: Date
  trangThai: TrangThaiVoucher
}> = [
  {
    maVoucher: 'SALE10',
    tenVoucher: 'Giảm 10% (tối đa 50.000đ)',
    loaiGiam: 'PHAN_TRAM',
    giaTri: 10,
    giaTriDonToiThieu: 0,
    giamToiDa: 50000,
    soLuong: 100,
    gioiHanMoiKhach: 2,
    apDungKenh: 'TAT_CA',
    ngayBatDau: new Date(Date.now() - 86_400_000),
    ngayKetThuc: new Date(Date.now() + 365 * 86_400_000),
    trangThai: 'HOAT_DONG',
  },
  {
    maVoucher: 'GIAM50K',
    tenVoucher: 'Giảm 50.000đ cho đơn từ 300.000đ (POS)',
    loaiGiam: 'SO_TIEN',
    giaTri: 50000,
    giaTriDonToiThieu: 300000,
    giamToiDa: null,
    soLuong: 50,
    gioiHanMoiKhach: null,
    apDungKenh: 'POS',
    ngayBatDau: new Date(Date.now() - 86_400_000),
    ngayKetThuc: new Date(Date.now() + 365 * 86_400_000),
    trangThai: 'HOAT_DONG',
  },
]

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!adminPassword) {
    throw new Error(
      'Thiếu biến môi trường SEED_ADMIN_PASSWORD. Hãy đặt biến này trước khi chạy seed.'
    )
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('Thiếu biến môi trường DATABASE_URL.')
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12)
  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })

  try {
    // 1. Vai trò (seed dùng chung với bộ kiểm thử)
    await seedRoles(prisma)

    const adminRole = await prisma.vaiTro.findUniqueOrThrow({
      where: { maVaiTro: 'ADMIN' },
    })

    // 2. Tài khoản admin + hồ sơ nhân viên
    const adminAccount = await prisma.taiKhoan.upsert({
      where: { username: ADMIN_USERNAME },
      update: {
        vaiTroId: adminRole.vaiTroId,
        passwordHash,
        trangThai: 'HOAT_DONG',
      },
      create: {
        username: ADMIN_USERNAME,
        vaiTroId: adminRole.vaiTroId,
        passwordHash,
        trangThai: 'HOAT_DONG',
      },
    })

    const adminEmployee = await prisma.nhanVien.upsert({
      where: { taiKhoanId: adminAccount.id },
      update: {
        hoTen: 'Quản trị viên',
        email: 'admin@bookmark.local',
        ngayVaoLam: new Date('2024-01-01T00:00:00.000Z'),
        trangThai: 'DANG_LAM',
      },
      create: {
        taiKhoanId: adminAccount.id,
        maNv: ADMIN_MA_NV,
        hoTen: 'Quản trị viên',
        email: 'admin@bookmark.local',
        ngayVaoLam: new Date('2024-01-01T00:00:00.000Z'),
        trangThai: 'DANG_LAM',
      },
    })

    // 3. Danh mục cha trước, sau đó danh mục con
    const categoryRows = new Map<string, { danhMucId: number }>()

    for (const category of categories.filter((item) => item.parentSlug === null)) {
      const row = await prisma.danhMuc.upsert({
        where: { slug: category.slug },
        update: {
          danhMucChaId: null,
          tenDanhMuc: category.tenDanhMuc,
          moTa: category.moTa,
          thuTu: category.thuTu,
          trangThai: 'HOAT_DONG',
        },
        create: {
          slug: category.slug,
          tenDanhMuc: category.tenDanhMuc,
          moTa: category.moTa,
          thuTu: category.thuTu,
          trangThai: 'HOAT_DONG',
        },
      })
      categoryRows.set(category.slug, row)
    }

    for (const category of categories.filter((item) => item.parentSlug !== null)) {
      const parent = categoryRows.get(category.parentSlug!)
      if (!parent) {
        throw new Error(`Không tìm thấy danh mục cha: ${category.parentSlug}`)
      }

      const row = await prisma.danhMuc.upsert({
        where: { slug: category.slug },
        update: {
          danhMucChaId: parent.danhMucId,
          tenDanhMuc: category.tenDanhMuc,
          moTa: category.moTa,
          thuTu: category.thuTu,
          trangThai: 'HOAT_DONG',
        },
        create: {
          danhMucChaId: parent.danhMucId,
          slug: category.slug,
          tenDanhMuc: category.tenDanhMuc,
          moTa: category.moTa,
          thuTu: category.thuTu,
          trangThai: 'HOAT_DONG',
        },
      })
      categoryRows.set(category.slug, row)
    }

    // 4. Nhà cung cấp
    const supplier = await prisma.nhaCungCap.upsert({
      where: { maNcc: 'NCC001' },
      update: {
        tenNhaCungCap: 'Nhà sách Phương Nam',
        sdtLienHe: '02838220000',
        email: 'cungcap@bookmark.local',
        diaChi: 'TP. Hồ Chí Minh',
        trangThai: 'HOAT_DONG',
      },
      create: {
        maNcc: 'NCC001',
        tenNhaCungCap: 'Nhà sách Phương Nam',
        sdtLienHe: '02838220000',
        email: 'cungcap@bookmark.local',
        diaChi: 'TP. Hồ Chí Minh',
        trangThai: 'HOAT_DONG',
      },
    })

    // 5. Sản phẩm
    const productRows = new Map<string, { id: string }>()

    for (const product of products) {
      const category = categoryRows.get(product.categorySlug)
      if (!category) {
        throw new Error(`Không tìm thấy danh mục: ${product.categorySlug}`)
      }

      const row = await prisma.sanPham.upsert({
        where: { maSp: product.maSp },
        update: {
          danhMucId: category.danhMucId,
          nhaCungCapId: supplier.nhaCungCapId,
          isbn: product.isbn,
          tenSp: product.tenSp,
          loaiSp: product.loaiSp as LoaiSanPham,
          tacGia: product.tacGia,
          nhaXuatBan: product.nhaXuatBan,
          namXuatBan: product.namXuatBan,
          moTa: product.moTa,
          hinhAnh: null,
          giaBan: product.giaBan,
          soLuongTon: product.soLuongTon,
          nguongTonToiThieu: product.nguongTonToiThieu,
          trangThai: 'DANG_BAN',
        },
        create: {
          id: seedUuid(`product:${product.maSp}`),
          danhMucId: category.danhMucId,
          nhaCungCapId: supplier.nhaCungCapId,
          maSp: product.maSp,
          isbn: product.isbn,
          tenSp: product.tenSp,
          loaiSp: product.loaiSp as LoaiSanPham,
          tacGia: product.tacGia,
          nhaXuatBan: product.nhaXuatBan,
          namXuatBan: product.namXuatBan,
          moTa: product.moTa,
          hinhAnh: null,
          giaBan: product.giaBan,
          soLuongTon: product.soLuongTon,
          nguongTonToiThieu: product.nguongTonToiThieu,
          trangThai: 'DANG_BAN',
        },
      })
      productRows.set(product.maSp, row)
    }

    // 6. Sổ kho ban đầu: mỗi sản phẩm đúng một bản ghi, khớp số tồn hiện tại
    for (const product of products) {
      const productRow = productRows.get(product.maSp)
      if (!productRow) {
        throw new Error(`Không tìm thấy sản phẩm: ${product.maSp}`)
      }

      await prisma.lichSuTonKho.upsert({
        where: { id: seedUuid(`initial-stock:${product.maSp}`) },
        update: {
          sanPhamId: productRow.id,
          nguoiThucHienId: adminEmployee.id,
          phieuNhapId: null,
          donHangId: null,
          phieuKiemKeId: null,
          loaiBienDong: 'DIEU_CHINH',
          soLuongThayDoi: product.soLuongTon,
          soLuongTruoc: 0,
          soLuongSau: product.soLuongTon,
          ghiChu: INITIAL_STOCK_NOTE,
        },
        create: {
          id: seedUuid(`initial-stock:${product.maSp}`),
          sanPhamId: productRow.id,
          nguoiThucHienId: adminEmployee.id,
          loaiBienDong: 'DIEU_CHINH',
          soLuongThayDoi: product.soLuongTon,
          soLuongTruoc: 0,
          soLuongSau: product.soLuongTon,
          ghiChu: INITIAL_STOCK_NOTE,
        },
      })
    }

    // 7. Thành phần combo
    const combo = productRows.get('SP010')
    if (!combo) {
      throw new Error('Không tìm thấy sản phẩm combo SP010.')
    }

    const componentIds: string[] = []
    for (const component of comboComponents) {
      const componentRow = productRows.get(component.maSp)
      if (!componentRow) {
        throw new Error(`Không tìm thấy thành phần combo: ${component.maSp}`)
      }
      componentIds.push(componentRow.id)

      await prisma.thanhPhanCombo.upsert({
        where: {
          comboId_sanPhamId: {
            comboId: combo.id,
            sanPhamId: componentRow.id,
          },
        },
        update: { soLuong: component.soLuong },
        create: {
          comboId: combo.id,
          sanPhamId: componentRow.id,
          soLuong: component.soLuong,
        },
      })
    }

    // Dọn thành phần cũ nếu cấu hình combo thay đổi giữa các lần seed
    await prisma.thanhPhanCombo.deleteMany({
      where: {
        comboId: combo.id,
        sanPhamId: { notIn: componentIds },
      },
    })

    // 8. Voucher mẫu (upsert: không reset da_su_dung giữa các lần seed)
    for (const voucher of vouchers) {
      const fields = {
        tenVoucher: voucher.tenVoucher,
        loaiGiam: voucher.loaiGiam,
        giaTri: voucher.giaTri,
        giaTriDonToiThieu: voucher.giaTriDonToiThieu,
        giamToiDa: voucher.giamToiDa,
        soLuong: voucher.soLuong,
        gioiHanMoiKhach: voucher.gioiHanMoiKhach,
        apDungKenh: voucher.apDungKenh,
        ngayBatDau: voucher.ngayBatDau,
        ngayKetThuc: voucher.ngayKetThuc,
        trangThai: voucher.trangThai,
      }
      await prisma.voucher.upsert({
        where: { maVoucher: voucher.maVoucher },
        update: fields,
        create: { id: seedUuid(`voucher:${voucher.maVoucher}`), maVoucher: voucher.maVoucher, ...fields },
      })
    }

    console.log(
      `Seed hoàn tất: ${roles.length} vai trò, 1 tài khoản admin, ${categories.length} danh mục, 1 nhà cung cấp, ${products.length} sản phẩm, ${comboComponents.length} thành phần combo, ${products.length} bản ghi tồn kho ban đầu, ${vouchers.length} voucher mẫu.`
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
