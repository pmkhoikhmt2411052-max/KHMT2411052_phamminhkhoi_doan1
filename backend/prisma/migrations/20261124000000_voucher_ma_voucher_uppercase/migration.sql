-- Mã voucher luôn được lưu ở dạng CHỮ HOA, khớp với cách validateVoucher() chuẩn hóa
-- maVoucher = upper(maVoucher.trim()) trước khi tra cứu.
-- Ngăn việc tạo voucher thường có mã thường (sẽ không bao giờ khớp khi khách nhập).
ALTER TABLE "Voucher"
  ADD CONSTRAINT "Voucher_ma_voucher_upper_check"
  CHECK ("ma_voucher" = upper("ma_voucher"));
