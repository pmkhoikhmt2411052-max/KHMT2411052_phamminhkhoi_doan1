-- Ràng buộc bổ sung thủ công theo docs/database-design.md (mục 4.4 và 4.5).
-- Prisma chỉ quản lý model/quan hệ/unique thường; file này bổ sung:
--   partial unique, exclusion constraint, CHECK, trigger và index.
-- Toàn bộ đối tượng dưới đây được áp dụng qua lịch sử migration của Prisma.

-- Extension phục vụ exclusion constraint (btree_gist) và tìm kiếm tên sản phẩm (pg_trgm).
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 1. Partial unique: mỗi DonHang chỉ có một ThanhToan THANH_CONG
-- ============================================================

CREATE UNIQUE INDEX "ThanhToan_mot_thanh_cong_moi_don"
  ON "ThanhToan" ("don_hang_id")
  WHERE "trang_thai" = 'THANH_CONG';

-- ============================================================
-- 2. Exclusion constraint: không chồng phiếu kiểm kê đang mở
--    - Toàn cửa hàng (danh_muc_id IS NULL) = int4range không biên.
--    - Theo danh mục = [danh_muc_id, danh_muc_id + 1).
--    - Chỉ xét phiếu NHAP / CHO_DUYET.
-- ============================================================

ALTER TABLE "PhieuKiemKe"
  ADD CONSTRAINT "PhieuKiemKe_khong_chong_pham_vi"
  EXCLUDE USING gist (
    (
      int4range(
        CASE WHEN "danh_muc_id" IS NULL THEN NULL ELSE "danh_muc_id" END,
        CASE WHEN "danh_muc_id" IS NULL THEN NULL ELSE "danh_muc_id" + 1 END
      )
    ) WITH &&
  )
  WHERE ("trang_thai" IN ('NHAP', 'CHO_DUYET'));

-- ============================================================
-- 3. CHECK constraints
-- ============================================================

-- Sản phẩm: giá, tồn, ngưỡng tồn không âm.
ALTER TABLE "SanPham"
  ADD CONSTRAINT "SanPham_gia_tri_khong_am_check"
  CHECK ("gia_ban" >= 0 AND "so_luong_ton" >= 0 AND "nguong_ton_toi_thieu" >= 0);

-- Giỏ hàng: số lượng dương; không lưu đơn giá (đã đảm bảo ở schema).
ALTER TABLE "ChiTietGioHang"
  ADD CONSTRAINT "ChiTietGioHang_so_luong_check"
  CHECK ("so_luong" > 0);

-- Chi tiết đơn hàng: số lượng, đơn giá, thành tiền.
ALTER TABLE "ChiTietDonHang"
  ADD CONSTRAINT "ChiTietDonHang_so_luong_check"
  CHECK ("so_luong" > 0),
  ADD CONSTRAINT "ChiTietDonHang_don_gia_check"
  CHECK ("don_gia" >= 0),
  ADD CONSTRAINT "ChiTietDonHang_thanh_tien_check"
  CHECK ("thanh_tien" = "so_luong" * "don_gia");

-- Chi tiết phiếu nhập: số lượng, giá nhập, thành tiền.
ALTER TABLE "ChiTietPhieuNhap"
  ADD CONSTRAINT "ChiTietPhieuNhap_so_luong_check"
  CHECK ("so_luong" > 0),
  ADD CONSTRAINT "ChiTietPhieuNhap_gia_nhap_check"
  CHECK ("gia_nhap" >= 0),
  ADD CONSTRAINT "ChiTietPhieuNhap_thanh_tien_check"
  CHECK ("thanh_tien" = "so_luong" * "gia_nhap");

-- Chi tiết kiểm kê: số lượng hệ thống/thực tế không âm; chênh lệch đúng công thức.
-- Lưu ý: tài liệu ghi "so_luong > 0" cho ChiTietPhieuKiemKe, nhưng bảng này
-- không có cột so_luong; áp dụng cho hai cột số lượng thực tế của bảng.
ALTER TABLE "ChiTietPhieuKiemKe"
  ADD CONSTRAINT "ChiTietPhieuKiemKe_so_luong_khong_am_check"
  CHECK ("so_luong_he_thong" >= 0 AND "so_luong_thuc_te" >= 0),
  ADD CONSTRAINT "ChiTietPhieuKiemKe_chenh_lech_check"
  CHECK ("chenh_lech" = "so_luong_thuc_te" - "so_luong_he_thong");

-- Thành phần combo: số lượng dương, không tự tham chiếu.
ALTER TABLE "ThanhPhanCombo"
  ADD CONSTRAINT "ThanhPhanCombo_so_luong_check"
  CHECK ("so_luong" > 0),
  ADD CONSTRAINT "ThanhPhanCombo_khac_san_pham_check"
  CHECK ("combo_id" <> "san_pham_id");

-- Đơn hàng: công thức tổng tiền, các khoản không âm, giới hạn giảm giá, kênh bán.
ALTER TABLE "DonHang"
  ADD CONSTRAINT "DonHang_tong_tien_check"
  CHECK (
    "tong_tien" = "tien_hang" - "tien_giam_voucher" - "tien_giam_diem" + "phi_van_chuyen"
    AND "tong_tien" >= 0
  ),
  ADD CONSTRAINT "DonHang_gia_tri_khong_am_check"
  CHECK (
    "tien_hang" >= 0
    AND "tien_giam_voucher" >= 0
    AND "tien_giam_diem" >= 0
    AND "phi_van_chuyen" >= 0
    AND "diem_su_dung" >= 0
    AND "diem_cong" >= 0
  ),
  ADD CONSTRAINT "DonHang_giam_voucher_check"
  CHECK ("tien_giam_voucher" <= "tien_hang"),
  ADD CONSTRAINT "DonHang_giam_diem_check"
  CHECK ("tien_giam_diem" <= "tien_hang" - "tien_giam_voucher"),
  ADD CONSTRAINT "DonHang_kenh_ban_check"
  CHECK (
    (
      "kenh_ban" = 'ONLINE'
      AND "khach_hang_id" IS NOT NULL
      AND "ten_nguoi_nhan" IS NOT NULL
      AND "sdt_nguoi_nhan" IS NOT NULL
      AND "dia_chi_giao_hang" IS NOT NULL
      AND "nhan_vien_id" IS NULL
    )
    OR
    (
      "kenh_ban" = 'POS'
      AND "nhan_vien_id" IS NOT NULL
    )
  );

-- Thanh toán: số tiền dương.
ALTER TABLE "ThanhToan"
  ADD CONSTRAINT "ThanhToan_so_tien_check"
  CHECK ("so_tien" > 0);

-- Voucher: số lượt dùng, giới hạn số lượng và giới hạn mỗi khách.
ALTER TABLE "Voucher"
  ADD CONSTRAINT "Voucher_gia_tri_khong_am_check"
  CHECK (
    "da_su_dung" >= 0
    AND "gia_tri_don_toi_thieu" >= 0
    AND ("giam_toi_da" IS NULL OR "giam_toi_da" >= 0)
  ),
  ADD CONSTRAINT "Voucher_so_luong_check"
  CHECK ("so_luong" IS NULL OR ("so_luong" > 0 AND "da_su_dung" <= "so_luong")),
  ADD CONSTRAINT "Voucher_gioi_han_moi_khach_check"
  CHECK ("gioi_han_moi_khach" IS NULL OR "gioi_han_moi_khach" > 0);

-- Lượt dùng voucher: số tiền giảm không âm.
ALTER TABLE "VoucherLuotDung"
  ADD CONSTRAINT "VoucherLuotDung_so_tien_giam_check"
  CHECK ("so_tien_giam" >= 0);

-- Khách hàng: điểm không âm; phải có ít nhất số điện thoại hoặc email.
ALTER TABLE "KhachHang"
  ADD CONSTRAINT "KhachHang_diem_tich_luy_check"
  CHECK ("diem_tich_luy" >= 0),
  ADD CONSTRAINT "KhachHang_lien_he_check"
  CHECK ("sdt" IS NOT NULL OR "email" IS NOT NULL);

-- Lịch sử điểm: số dư không âm, số điểm phát sinh dương (dấu thể hiện qua loại).
ALTER TABLE "LichSuDiem"
  ADD CONSTRAINT "LichSuDiem_so_du_sau_check"
  CHECK ("so_du_sau" >= 0),
  ADD CONSTRAINT "LichSuDiem_so_diem_check"
  CHECK ("so_diem" > 0);

-- Lịch sử tồn kho: công thức sổ kho và các số lượng không âm.
ALTER TABLE "LichSuTonKho"
  ADD CONSTRAINT "LichSuTonKho_cong_thuc_check"
  CHECK (
    "so_luong_truoc" >= 0
    AND "so_luong_sau" >= 0
    AND "so_luong_sau" = "so_luong_truoc" + "so_luong_thay_doi"
  );

-- Phiếu nhập kho: tổng tiền không âm; đã nhập kho phải có người xác nhận và thời điểm.
ALTER TABLE "PhieuNhapKho"
  ADD CONSTRAINT "PhieuNhapKho_tong_tien_check"
  CHECK ("tong_tien" >= 0),
  ADD CONSTRAINT "PhieuNhapKho_xac_nhan_check"
  CHECK (
    "trang_thai" <> 'DA_NHAP_KHO'
    OR ("nguoi_xac_nhan_id" IS NOT NULL AND "ngay_xac_nhan" IS NOT NULL)
  );

-- Phiếu kiểm kê: đã duyệt phải có người duyệt/thời điểm; từ chối phải có lý do.
ALTER TABLE "PhieuKiemKe"
  ADD CONSTRAINT "PhieuKiemKe_duyet_check"
  CHECK (
    "trang_thai" <> 'DA_DUYET'
    OR ("nguoi_duyet_id" IS NOT NULL AND "ngay_duyet" IS NOT NULL)
  ),
  ADD CONSTRAINT "PhieuKiemKe_tu_choi_check"
  CHECK ("trang_thai" <> 'TU_CHOI' OR "ly_do_tu_choi" IS NOT NULL);

-- Đặt trước: số lượng dương.
ALTER TABLE "DonDatTruoc"
  ADD CONSTRAINT "DonDatTruoc_so_luong_check"
  CHECK ("so_luong" > 0);

-- ============================================================
-- 4. Trigger chặn chuyển trạng thái cấm
-- ============================================================

CREATE OR REPLACE FUNCTION "fn_chan_huy_phieu_nhap_da_nhap"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD."trang_thai" = 'DA_NHAP_KHO' AND NEW."trang_thai" = 'DA_HUY' THEN
    RAISE EXCEPTION 'PhieuNhapKho da nhap kho khong duoc huy (id=%)', OLD."id"
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "PhieuNhapKho_chan_huy_sau_khi_nhap"
  BEFORE UPDATE ON "PhieuNhapKho"
  FOR EACH ROW
  EXECUTE FUNCTION "fn_chan_huy_phieu_nhap_da_nhap"();

CREATE OR REPLACE FUNCTION "fn_chan_doi_trang_thai_phieu_kiem_ke_da_duyet"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD."trang_thai" = 'DA_DUYET' AND NEW."trang_thai" <> OLD."trang_thai" THEN
    RAISE EXCEPTION 'PhieuKiemKe da duyet khong duoc doi trang thai (id=%)', OLD."id"
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "PhieuKiemKe_chan_doi_trang_thai_sau_duyet"
  BEFORE UPDATE ON "PhieuKiemKe"
  FOR EACH ROW
  EXECUTE FUNCTION "fn_chan_doi_trang_thai_phieu_kiem_ke_da_duyet"();

-- ============================================================
-- 5. Trigger kiểm tra PhieuNhapKho.tong_tien = SUM(ChiTietPhieuNhap.thanh_tien)
--    Dùng constraint trigger hoãn đến cuối transaction vì tổng tiền được
--    cập nhật sau khi các dòng chi tiết đã được ghi.
-- ============================================================

CREATE OR REPLACE FUNCTION "fn_kiem_tra_tong_tien_phieu_nhap"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_phieu_nhap_id uuid;
  v_tong_tien numeric(14, 2);
  v_tong_chi_tiet numeric(14, 2);
BEGIN
  IF TG_TABLE_NAME = 'PhieuNhapKho' THEN
    v_phieu_nhap_id := NEW."id";
  ELSIF TG_OP = 'DELETE' THEN
    v_phieu_nhap_id := OLD."phieu_nhap_id";
  ELSE
    v_phieu_nhap_id := NEW."phieu_nhap_id";
  END IF;

  SELECT "tong_tien" INTO v_tong_tien
  FROM "PhieuNhapKho"
  WHERE "id" = v_phieu_nhap_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(SUM("thanh_tien"), 0) INTO v_tong_chi_tiet
  FROM "ChiTietPhieuNhap"
  WHERE "phieu_nhap_id" = v_phieu_nhap_id;

  IF v_tong_tien <> v_tong_chi_tiet THEN
    RAISE EXCEPTION
      'PhieuNhapKho.tong_tien (%) khong bang tong chi tiet (%) cho phieu %',
      v_tong_tien, v_tong_chi_tiet, v_phieu_nhap_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER "PhieuNhapKho_kiem_tra_tong_tien"
  AFTER INSERT OR UPDATE OF "tong_tien" ON "PhieuNhapKho"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION "fn_kiem_tra_tong_tien_phieu_nhap"();

CREATE CONSTRAINT TRIGGER "ChiTietPhieuNhap_kiem_tra_tong_tien"
  AFTER INSERT OR UPDATE OR DELETE ON "ChiTietPhieuNhap"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION "fn_kiem_tra_tong_tien_phieu_nhap"();

-- ============================================================
-- 6. Index bổ sung
-- ============================================================

CREATE INDEX "SanPham_ten_sp_trgm_idx"
  ON "SanPham" USING gin ("ten_sp" gin_trgm_ops);

CREATE INDEX "SanPham_danh_muc_id_trang_thai_idx"
  ON "SanPham" ("danh_muc_id", "trang_thai");

CREATE INDEX "DonHang_kenh_ban_ngay_tao_idx"
  ON "DonHang" ("kenh_ban", "ngay_tao");

CREATE INDEX "DonHang_trang_thai_idx"
  ON "DonHang" ("trang_thai");

CREATE INDEX "LichSuTonKho_san_pham_id_ngay_tao_idx"
  ON "LichSuTonKho" ("san_pham_id", "ngay_tao");

CREATE INDEX "LichSuDiem_khach_hang_id_ngay_tao_idx"
  ON "LichSuDiem" ("khach_hang_id", "ngay_tao");

CREATE INDEX "DonDatTruoc_san_pham_id_trang_thai_idx"
  ON "DonDatTruoc" ("san_pham_id", "trang_thai");

CREATE INDEX "Voucher_trang_thai_ngay_ket_thuc_idx"
  ON "Voucher" ("trang_thai", "ngay_ket_thuc");
