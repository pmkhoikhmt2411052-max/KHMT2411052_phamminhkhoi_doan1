-- Bổ sung ràng buộc còn thiếu theo docs/database-design.md mục 4.4 (Kho):
-- mỗi LichSuTonKho chỉ được tham chiếu tối đa một nguồn nghiệp vụ.
-- Điều chỉnh tay hợp lệ khi cả ba cột nguồn đều NULL.

ALTER TABLE "LichSuTonKho"
  ADD CONSTRAINT "LichSuTonKho_mot_nguon_check"
  CHECK (num_nonnulls("phieu_nhap_id", "don_hang_id", "phieu_kiem_ke_id") <= 1);
