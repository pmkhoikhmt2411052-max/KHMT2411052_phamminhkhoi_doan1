-- CreateEnum
CREATE TYPE "LoaiSanPham" AS ENUM ('SACH', 'TRUYEN_TRANH', 'DO_DUNG_HOC_TAP', 'BO_TRUYEN', 'COMBO');

-- CreateEnum
CREATE TYPE "TrangThaiSanPham" AS ENUM ('DANG_BAN', 'NGUNG_BAN');

-- CreateEnum
CREATE TYPE "TrangThaiDanhMuc" AS ENUM ('HOAT_DONG', 'TAM_AN');

-- CreateEnum
CREATE TYPE "TrangThaiNhaCungCap" AS ENUM ('HOAT_DONG', 'NGUNG_HOP_TAC');

-- CreateEnum
CREATE TYPE "TrangThaiTaiKhoan" AS ENUM ('HOAT_DONG', 'BI_KHOA');

-- CreateEnum
CREATE TYPE "TrangThaiNhanVien" AS ENUM ('DANG_LAM', 'DA_NGHI');

-- CreateEnum
CREATE TYPE "TrangThaiKhachHang" AS ENUM ('HOAT_DONG', 'BI_KHOA');

-- CreateEnum
CREATE TYPE "KenhBan" AS ENUM ('POS', 'ONLINE');

-- CreateEnum
CREATE TYPE "TrangThaiDonHang" AS ENUM ('CHO_THANH_TOAN', 'DA_THANH_TOAN', 'CHO_HOAN_TIEN', 'DA_HOAN_TIEN', 'DA_HUY');

-- CreateEnum
CREATE TYPE "PhuongThucThanhToan" AS ENUM ('TIEN_MAT', 'VNPAY');

-- CreateEnum
CREATE TYPE "TrangThaiThanhToan" AS ENUM ('CHO_XU_LY', 'THANH_CONG', 'THAT_BAI', 'DA_HOAN_TIEN');

-- CreateEnum
CREATE TYPE "LoaiGiamVoucher" AS ENUM ('PHAN_TRAM', 'SO_TIEN');

-- CreateEnum
CREATE TYPE "ApDungKenhVoucher" AS ENUM ('TAT_CA', 'POS', 'ONLINE');

-- CreateEnum
CREATE TYPE "TrangThaiVoucher" AS ENUM ('HOAT_DONG', 'TAM_DUNG', 'HET_HAN');

-- CreateEnum
CREATE TYPE "TrangThaiDonDatTruoc" AS ENUM ('CHO_HANG', 'DA_CO_HANG', 'DA_HUY', 'DA_CHUYEN_DON');

-- CreateEnum
CREATE TYPE "TrangThaiPhieuNhapKho" AS ENUM ('NHAP', 'CHO_XAC_NHAN', 'DA_NHAP_KHO', 'DA_HUY');

-- CreateEnum
CREATE TYPE "TrangThaiPhieuKiemKe" AS ENUM ('NHAP', 'CHO_DUYET', 'DA_DUYET', 'TU_CHOI', 'DA_HUY');

-- CreateEnum
CREATE TYPE "LoaiBienDongTonKho" AS ENUM ('NHAP_KHO', 'BAN_HANG', 'KIEM_KE', 'HUY_DON', 'HOAN_TRA', 'DIEU_CHINH');

-- CreateEnum
CREATE TYPE "LoaiLichSuDiem" AS ENUM ('CONG', 'TRU', 'HOAN_DIEM', 'THU_HOI_DIEM', 'DIEU_CHINH');

-- CreateTable
CREATE TABLE "VaiTro" (
    "vai_tro_id" SERIAL NOT NULL,
    "ma_vai_tro" TEXT NOT NULL,
    "ten_vai_tro" TEXT NOT NULL,
    "mo_ta" TEXT,
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VaiTro_pkey" PRIMARY KEY ("vai_tro_id")
);

-- CreateTable
CREATE TABLE "TaiKhoan" (
    "id" UUID NOT NULL,
    "vai_tro_id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "trang_thai" "TrangThaiTaiKhoan" NOT NULL DEFAULT 'HOAT_DONG',
    "lan_dang_nhap_cuoi" TIMESTAMP(3),
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaiKhoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NhanVien" (
    "id" UUID NOT NULL,
    "tai_khoan_id" UUID NOT NULL,
    "ma_nv" TEXT NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "email" TEXT,
    "sdt" TEXT,
    "ngay_vao_lam" TIMESTAMP(3) NOT NULL,
    "trang_thai" "TrangThaiNhanVien" NOT NULL DEFAULT 'DANG_LAM',
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NhanVien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KhachHang" (
    "id" UUID NOT NULL,
    "tai_khoan_id" UUID,
    "ho_ten" TEXT NOT NULL,
    "sdt" TEXT,
    "email" TEXT,
    "diem_tich_luy" INTEGER NOT NULL DEFAULT 0,
    "dia_chi_mac_dinh" TEXT,
    "trang_thai" "TrangThaiKhachHang" NOT NULL DEFAULT 'HOAT_DONG',
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KhachHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DanhMuc" (
    "danh_muc_id" SERIAL NOT NULL,
    "danh_muc_cha_id" INTEGER,
    "slug" TEXT NOT NULL,
    "ten_danh_muc" TEXT NOT NULL,
    "mo_ta" TEXT,
    "thu_tu" INTEGER NOT NULL DEFAULT 0,
    "trang_thai" "TrangThaiDanhMuc" NOT NULL DEFAULT 'HOAT_DONG',

    CONSTRAINT "DanhMuc_pkey" PRIMARY KEY ("danh_muc_id")
);

-- CreateTable
CREATE TABLE "NhaCungCap" (
    "nha_cung_cap_id" SERIAL NOT NULL,
    "ma_ncc" TEXT NOT NULL,
    "ten_nha_cung_cap" TEXT NOT NULL,
    "sdt_lien_he" TEXT,
    "email" TEXT,
    "dia_chi" TEXT,
    "trang_thai" "TrangThaiNhaCungCap" NOT NULL DEFAULT 'HOAT_DONG',

    CONSTRAINT "NhaCungCap_pkey" PRIMARY KEY ("nha_cung_cap_id")
);

-- CreateTable
CREATE TABLE "SanPham" (
    "id" UUID NOT NULL,
    "danh_muc_id" INTEGER NOT NULL,
    "nha_cung_cap_id" INTEGER,
    "ma_sp" TEXT NOT NULL,
    "isbn" TEXT,
    "ten_sp" TEXT NOT NULL,
    "loai_sp" "LoaiSanPham" NOT NULL,
    "tac_gia" TEXT,
    "nha_xuat_ban" TEXT,
    "nam_xuat_ban" INTEGER,
    "mo_ta" TEXT,
    "hinh_anh" TEXT,
    "gia_ban" DECIMAL(12,2) NOT NULL,
    "so_luong_ton" INTEGER NOT NULL DEFAULT 0,
    "nguong_ton_toi_thieu" INTEGER NOT NULL DEFAULT 0,
    "trang_thai" "TrangThaiSanPham" NOT NULL DEFAULT 'DANG_BAN',
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SanPham_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThanhPhanCombo" (
    "combo_id" UUID NOT NULL,
    "san_pham_id" UUID NOT NULL,
    "so_luong" INTEGER NOT NULL,

    CONSTRAINT "ThanhPhanCombo_pkey" PRIMARY KEY ("combo_id","san_pham_id")
);

-- CreateTable
CREATE TABLE "GioHang" (
    "id" UUID NOT NULL,
    "khach_hang_id" UUID NOT NULL,
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GioHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietGioHang" (
    "gio_hang_id" UUID NOT NULL,
    "san_pham_id" UUID NOT NULL,
    "so_luong" INTEGER NOT NULL,
    "ngay_them" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChiTietGioHang_pkey" PRIMARY KEY ("gio_hang_id","san_pham_id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" UUID NOT NULL,
    "ma_voucher" TEXT NOT NULL,
    "ten_voucher" TEXT NOT NULL,
    "loai_giam" "LoaiGiamVoucher" NOT NULL,
    "gia_tri" DECIMAL(12,2) NOT NULL,
    "gia_tri_don_toi_thieu" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "giam_toi_da" DECIMAL(14,2),
    "so_luong" INTEGER,
    "da_su_dung" INTEGER NOT NULL DEFAULT 0,
    "gioi_han_moi_khach" INTEGER,
    "ap_dung_kenh" "ApDungKenhVoucher" NOT NULL,
    "ngay_bat_dau" TIMESTAMP(3) NOT NULL,
    "ngay_ket_thuc" TIMESTAMP(3) NOT NULL,
    "trang_thai" "TrangThaiVoucher" NOT NULL DEFAULT 'HOAT_DONG',

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonHang" (
    "id" UUID NOT NULL,
    "khach_hang_id" UUID,
    "nhan_vien_id" UUID,
    "ma_dh" TEXT NOT NULL,
    "kenh_ban" "KenhBan" NOT NULL,
    "trang_thai" "TrangThaiDonHang" NOT NULL DEFAULT 'CHO_THANH_TOAN',
    "tien_hang" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tien_giam_voucher" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tien_giam_diem" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "phi_van_chuyen" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tong_tien" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "diem_su_dung" INTEGER NOT NULL DEFAULT 0,
    "diem_cong" INTEGER NOT NULL DEFAULT 0,
    "ten_nguoi_nhan" TEXT,
    "sdt_nguoi_nhan" TEXT,
    "dia_chi_giao_hang" TEXT,
    "ghi_chu" TEXT,
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_thanh_toan" TIMESTAMP(3),

    CONSTRAINT "DonHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietDonHang" (
    "don_hang_id" UUID NOT NULL,
    "san_pham_id" UUID NOT NULL,
    "so_luong" INTEGER NOT NULL,
    "don_gia" DECIMAL(12,2) NOT NULL,
    "thanh_tien" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ChiTietDonHang_pkey" PRIMARY KEY ("don_hang_id","san_pham_id")
);

-- CreateTable
CREATE TABLE "ThanhToan" (
    "id" UUID NOT NULL,
    "don_hang_id" UUID NOT NULL,
    "ma_giao_dich" TEXT,
    "phuong_thuc" "PhuongThucThanhToan" NOT NULL,
    "so_tien" DECIMAL(14,2) NOT NULL,
    "trang_thai" "TrangThaiThanhToan" NOT NULL DEFAULT 'CHO_XU_LY',
    "thoi_gian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ma_phan_hoi" TEXT,

    CONSTRAINT "ThanhToan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherLuotDung" (
    "id" UUID NOT NULL,
    "voucher_id" UUID NOT NULL,
    "don_hang_id" UUID NOT NULL,
    "khach_hang_id" UUID,
    "so_tien_giam" DECIMAL(14,2) NOT NULL,
    "ngay_dung" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherLuotDung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonDatTruoc" (
    "id" UUID NOT NULL,
    "khach_hang_id" UUID NOT NULL,
    "san_pham_id" UUID NOT NULL,
    "don_hang_id" UUID,
    "ma_ddt" TEXT NOT NULL,
    "so_luong" INTEGER NOT NULL,
    "ten_nguoi_nhan" TEXT NOT NULL,
    "sdt_nguoi_nhan" TEXT NOT NULL,
    "dia_chi" TEXT NOT NULL,
    "trang_thai" "TrangThaiDonDatTruoc" NOT NULL DEFAULT 'CHO_HANG',
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_bao_co_hang" TIMESTAMP(3),
    "ghi_chu" TEXT,

    CONSTRAINT "DonDatTruoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhieuNhapKho" (
    "id" UUID NOT NULL,
    "nha_cung_cap_id" INTEGER NOT NULL,
    "nguoi_lap_id" UUID NOT NULL,
    "nguoi_xac_nhan_id" UUID,
    "ma_pn" TEXT NOT NULL,
    "trang_thai" "TrangThaiPhieuNhapKho" NOT NULL DEFAULT 'NHAP',
    "tong_tien" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ngay_nhap" TIMESTAMP(3) NOT NULL,
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_xac_nhan" TIMESTAMP(3),
    "ghi_chu" TEXT,

    CONSTRAINT "PhieuNhapKho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietPhieuNhap" (
    "phieu_nhap_id" UUID NOT NULL,
    "san_pham_id" UUID NOT NULL,
    "so_luong" INTEGER NOT NULL,
    "gia_nhap" DECIMAL(12,2) NOT NULL,
    "thanh_tien" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ChiTietPhieuNhap_pkey" PRIMARY KEY ("phieu_nhap_id","san_pham_id")
);

-- CreateTable
CREATE TABLE "PhieuKiemKe" (
    "id" UUID NOT NULL,
    "danh_muc_id" INTEGER,
    "nguoi_lap_id" UUID NOT NULL,
    "nguoi_duyet_id" UUID,
    "ma_pkk" TEXT NOT NULL,
    "trang_thai" "TrangThaiPhieuKiemKe" NOT NULL DEFAULT 'NHAP',
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_gui" TIMESTAMP(3),
    "ngay_duyet" TIMESTAMP(3),
    "ly_do_tu_choi" TEXT,
    "ghi_chu" TEXT,

    CONSTRAINT "PhieuKiemKe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietPhieuKiemKe" (
    "phieu_kiem_ke_id" UUID NOT NULL,
    "san_pham_id" UUID NOT NULL,
    "so_luong_he_thong" INTEGER NOT NULL,
    "so_luong_thuc_te" INTEGER NOT NULL,
    "chenh_lech" INTEGER NOT NULL,
    "ghi_chu" TEXT,

    CONSTRAINT "ChiTietPhieuKiemKe_pkey" PRIMARY KEY ("phieu_kiem_ke_id","san_pham_id")
);

-- CreateTable
CREATE TABLE "LichSuTonKho" (
    "id" UUID NOT NULL,
    "san_pham_id" UUID NOT NULL,
    "nguoi_thuc_hien_id" UUID,
    "phieu_nhap_id" UUID,
    "don_hang_id" UUID,
    "phieu_kiem_ke_id" UUID,
    "loai_bien_dong" "LoaiBienDongTonKho" NOT NULL,
    "so_luong_thay_doi" INTEGER NOT NULL,
    "so_luong_truoc" INTEGER NOT NULL,
    "so_luong_sau" INTEGER NOT NULL,
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ghi_chu" TEXT,

    CONSTRAINT "LichSuTonKho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LichSuDiem" (
    "id" UUID NOT NULL,
    "khach_hang_id" UUID NOT NULL,
    "don_hang_id" UUID,
    "nguoi_thuc_hien_id" UUID,
    "loai" "LoaiLichSuDiem" NOT NULL,
    "so_diem" INTEGER NOT NULL,
    "so_du_sau" INTEGER NOT NULL,
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ghi_chu" TEXT,

    CONSTRAINT "LichSuDiem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaiTro_ma_vai_tro_key" ON "VaiTro"("ma_vai_tro");

-- CreateIndex
CREATE UNIQUE INDEX "TaiKhoan_username_key" ON "TaiKhoan"("username");

-- CreateIndex
CREATE UNIQUE INDEX "NhanVien_tai_khoan_id_key" ON "NhanVien"("tai_khoan_id");

-- CreateIndex
CREATE UNIQUE INDEX "NhanVien_ma_nv_key" ON "NhanVien"("ma_nv");

-- CreateIndex
CREATE UNIQUE INDEX "NhanVien_email_key" ON "NhanVien"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NhanVien_sdt_key" ON "NhanVien"("sdt");

-- CreateIndex
CREATE UNIQUE INDEX "KhachHang_tai_khoan_id_key" ON "KhachHang"("tai_khoan_id");

-- CreateIndex
CREATE UNIQUE INDEX "KhachHang_sdt_key" ON "KhachHang"("sdt");

-- CreateIndex
CREATE UNIQUE INDEX "KhachHang_email_key" ON "KhachHang"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DanhMuc_slug_key" ON "DanhMuc"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NhaCungCap_ma_ncc_key" ON "NhaCungCap"("ma_ncc");

-- CreateIndex
CREATE UNIQUE INDEX "SanPham_ma_sp_key" ON "SanPham"("ma_sp");

-- CreateIndex
CREATE UNIQUE INDEX "SanPham_isbn_key" ON "SanPham"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "GioHang_khach_hang_id_key" ON "GioHang"("khach_hang_id");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_ma_voucher_key" ON "Voucher"("ma_voucher");

-- CreateIndex
CREATE UNIQUE INDEX "DonHang_ma_dh_key" ON "DonHang"("ma_dh");

-- CreateIndex
CREATE UNIQUE INDEX "ThanhToan_ma_giao_dich_key" ON "ThanhToan"("ma_giao_dich");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherLuotDung_don_hang_id_key" ON "VoucherLuotDung"("don_hang_id");

-- CreateIndex
CREATE UNIQUE INDEX "DonDatTruoc_don_hang_id_key" ON "DonDatTruoc"("don_hang_id");

-- CreateIndex
CREATE UNIQUE INDEX "DonDatTruoc_ma_ddt_key" ON "DonDatTruoc"("ma_ddt");

-- CreateIndex
CREATE UNIQUE INDEX "PhieuNhapKho_ma_pn_key" ON "PhieuNhapKho"("ma_pn");

-- CreateIndex
CREATE UNIQUE INDEX "PhieuKiemKe_ma_pkk_key" ON "PhieuKiemKe"("ma_pkk");

-- AddForeignKey
ALTER TABLE "TaiKhoan" ADD CONSTRAINT "TaiKhoan_vai_tro_id_fkey" FOREIGN KEY ("vai_tro_id") REFERENCES "VaiTro"("vai_tro_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhanVien" ADD CONSTRAINT "NhanVien_tai_khoan_id_fkey" FOREIGN KEY ("tai_khoan_id") REFERENCES "TaiKhoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KhachHang" ADD CONSTRAINT "KhachHang_tai_khoan_id_fkey" FOREIGN KEY ("tai_khoan_id") REFERENCES "TaiKhoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DanhMuc" ADD CONSTRAINT "DanhMuc_danh_muc_cha_id_fkey" FOREIGN KEY ("danh_muc_cha_id") REFERENCES "DanhMuc"("danh_muc_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SanPham" ADD CONSTRAINT "SanPham_danh_muc_id_fkey" FOREIGN KEY ("danh_muc_id") REFERENCES "DanhMuc"("danh_muc_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SanPham" ADD CONSTRAINT "SanPham_nha_cung_cap_id_fkey" FOREIGN KEY ("nha_cung_cap_id") REFERENCES "NhaCungCap"("nha_cung_cap_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhPhanCombo" ADD CONSTRAINT "ThanhPhanCombo_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "SanPham"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhPhanCombo" ADD CONSTRAINT "ThanhPhanCombo_san_pham_id_fkey" FOREIGN KEY ("san_pham_id") REFERENCES "SanPham"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GioHang" ADD CONSTRAINT "GioHang_khach_hang_id_fkey" FOREIGN KEY ("khach_hang_id") REFERENCES "KhachHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietGioHang" ADD CONSTRAINT "ChiTietGioHang_gio_hang_id_fkey" FOREIGN KEY ("gio_hang_id") REFERENCES "GioHang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietGioHang" ADD CONSTRAINT "ChiTietGioHang_san_pham_id_fkey" FOREIGN KEY ("san_pham_id") REFERENCES "SanPham"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonHang" ADD CONSTRAINT "DonHang_khach_hang_id_fkey" FOREIGN KEY ("khach_hang_id") REFERENCES "KhachHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonHang" ADD CONSTRAINT "DonHang_nhan_vien_id_fkey" FOREIGN KEY ("nhan_vien_id") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDonHang" ADD CONSTRAINT "ChiTietDonHang_don_hang_id_fkey" FOREIGN KEY ("don_hang_id") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDonHang" ADD CONSTRAINT "ChiTietDonHang_san_pham_id_fkey" FOREIGN KEY ("san_pham_id") REFERENCES "SanPham"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhToan" ADD CONSTRAINT "ThanhToan_don_hang_id_fkey" FOREIGN KEY ("don_hang_id") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherLuotDung" ADD CONSTRAINT "VoucherLuotDung_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherLuotDung" ADD CONSTRAINT "VoucherLuotDung_don_hang_id_fkey" FOREIGN KEY ("don_hang_id") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherLuotDung" ADD CONSTRAINT "VoucherLuotDung_khach_hang_id_fkey" FOREIGN KEY ("khach_hang_id") REFERENCES "KhachHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonDatTruoc" ADD CONSTRAINT "DonDatTruoc_khach_hang_id_fkey" FOREIGN KEY ("khach_hang_id") REFERENCES "KhachHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonDatTruoc" ADD CONSTRAINT "DonDatTruoc_san_pham_id_fkey" FOREIGN KEY ("san_pham_id") REFERENCES "SanPham"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonDatTruoc" ADD CONSTRAINT "DonDatTruoc_don_hang_id_fkey" FOREIGN KEY ("don_hang_id") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuNhapKho" ADD CONSTRAINT "PhieuNhapKho_nha_cung_cap_id_fkey" FOREIGN KEY ("nha_cung_cap_id") REFERENCES "NhaCungCap"("nha_cung_cap_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuNhapKho" ADD CONSTRAINT "PhieuNhapKho_nguoi_lap_id_fkey" FOREIGN KEY ("nguoi_lap_id") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuNhapKho" ADD CONSTRAINT "PhieuNhapKho_nguoi_xac_nhan_id_fkey" FOREIGN KEY ("nguoi_xac_nhan_id") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietPhieuNhap" ADD CONSTRAINT "ChiTietPhieuNhap_phieu_nhap_id_fkey" FOREIGN KEY ("phieu_nhap_id") REFERENCES "PhieuNhapKho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietPhieuNhap" ADD CONSTRAINT "ChiTietPhieuNhap_san_pham_id_fkey" FOREIGN KEY ("san_pham_id") REFERENCES "SanPham"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuKiemKe" ADD CONSTRAINT "PhieuKiemKe_danh_muc_id_fkey" FOREIGN KEY ("danh_muc_id") REFERENCES "DanhMuc"("danh_muc_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuKiemKe" ADD CONSTRAINT "PhieuKiemKe_nguoi_lap_id_fkey" FOREIGN KEY ("nguoi_lap_id") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuKiemKe" ADD CONSTRAINT "PhieuKiemKe_nguoi_duyet_id_fkey" FOREIGN KEY ("nguoi_duyet_id") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietPhieuKiemKe" ADD CONSTRAINT "ChiTietPhieuKiemKe_phieu_kiem_ke_id_fkey" FOREIGN KEY ("phieu_kiem_ke_id") REFERENCES "PhieuKiemKe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietPhieuKiemKe" ADD CONSTRAINT "ChiTietPhieuKiemKe_san_pham_id_fkey" FOREIGN KEY ("san_pham_id") REFERENCES "SanPham"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuTonKho" ADD CONSTRAINT "LichSuTonKho_san_pham_id_fkey" FOREIGN KEY ("san_pham_id") REFERENCES "SanPham"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuTonKho" ADD CONSTRAINT "LichSuTonKho_nguoi_thuc_hien_id_fkey" FOREIGN KEY ("nguoi_thuc_hien_id") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuTonKho" ADD CONSTRAINT "LichSuTonKho_phieu_nhap_id_fkey" FOREIGN KEY ("phieu_nhap_id") REFERENCES "PhieuNhapKho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuTonKho" ADD CONSTRAINT "LichSuTonKho_don_hang_id_fkey" FOREIGN KEY ("don_hang_id") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuTonKho" ADD CONSTRAINT "LichSuTonKho_phieu_kiem_ke_id_fkey" FOREIGN KEY ("phieu_kiem_ke_id") REFERENCES "PhieuKiemKe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuDiem" ADD CONSTRAINT "LichSuDiem_khach_hang_id_fkey" FOREIGN KEY ("khach_hang_id") REFERENCES "KhachHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuDiem" ADD CONSTRAINT "LichSuDiem_don_hang_id_fkey" FOREIGN KEY ("don_hang_id") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuDiem" ADD CONSTRAINT "LichSuDiem_nguoi_thuc_hien_id_fkey" FOREIGN KEY ("nguoi_thuc_hien_id") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
