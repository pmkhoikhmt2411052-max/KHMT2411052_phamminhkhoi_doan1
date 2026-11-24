# Thiết kế API — BookMark

> Trạng thái: đã xong khung app, xác thực, phân quyền, API công khai UC11 và API quản trị
> UC15 cho danh mục/sản phẩm; đã cài đặt nhập kho UC06/UC07, kiểm kê UC08/UC09 và toàn bộ
> POS UC02/UC04/UC05 (tra cứu, báo giá, chốt đơn, hóa đơn, danh sách đơn).
> Nguồn: `docs/spec.md` mục 1.3.2, 2.8.3, 3.1.1, 3.10 và `docs/database-design.md` phần 1.

## 1. Quy ước chung

- Base URL: `/api`. Định dạng trao đổi: JSON.
- Luồng middleware: **route → authenticate (JWT) → requireRole (RBAC) → validate (Zod) → controller → service → Prisma**.
- Mã lỗi: `200` thành công, `201` tạo mới, `400` dữ liệu không hợp lệ, `401` chưa xác thực,
  `403` sai quyền/tài khoản bị khóa, `404` không tìm thấy, `409` trùng dữ liệu, `500` lỗi máy chủ.
- Định dạng lỗi: `{ "error": { "code": "...", "message": "...", "issues?: [...] } }`.
- Vai trò được lưu trong bảng `VaiTro` (`ma_vai_tro`), không phải enum PostgreSQL. Giá trị:
  `ADMIN`, `THU_NGAN`, `NHAN_VIEN_KHO`, `KHACH_HANG`.

## 2. Ma trận vai trò — Use case (UC01–UC17)

Trích từ bảng phân công use case (spec 1.3.2) và RBAC (spec 2.8.3).
`✓` = vai trò được phép; `—` = không được phép.

| UC | Use case | Khách hàng | Thu ngân | NV kho | Quản trị viên | Ghi chú |
|---|---|:---:|:---:|:---:|:---:|---|
| UC01 | Đăng nhập POS | — | ✓ | — | — | Cấp JWT; chỉ `THU_NGAN` vào POS |
| UC02 | Tra cứu sản phẩm | — | ✓ | — | — | `GET /products` thiết kế là public (spec 3.10) |
| UC03 | Thêm vào giỏ hàng POS | — | ✓ | — | — | Kiểm tra tồn kho |
| UC04 | Áp dụng voucher / Tích điểm | — | ✓ | — | — | — |
| UC05 | Thanh toán và In hóa đơn | — | ✓ | — | — | Giao dịch transaction |
| UC06 | Lập phiếu nhập kho | — | — | ✓ | ✓* | Chưa đổi tồn; *ADMIN được phép theo yêu cầu dự án |
| UC07 | Cập nhật tồn kho | — | — | ✓ | ✓* | Xác nhận phiếu mới cộng tồn; *ADMIN được phép theo yêu cầu dự án |
| UC08 | Lập phiếu kiểm kê | — | — | ✓ | — | Gửi chờ Admin duyệt |
| UC09 | Duyệt phiếu kiểm kê | — | — | — | ✓ | Duyệt mới điều chỉnh tồn |
| UC10 | Đăng ký / Đăng nhập | ✓ | — | — | — | Public: không cần token để lấy token |
| UC11 | Tìm kiếm bộ truyện / combo | ✓ | — | — | — | `GET /products` public (spec 3.10) |
| UC12 | Thêm vào giỏ hàng online | ✓ | — | — | — | — |
| UC13 | Đặt trước (Pre-order) | ✓ | — | — | — | Không trừ tồn |
| UC14 | Thanh toán đơn online | ✓ | — | — | — | VNPay sandbox |
| UC15 | Quản lý danh mục hàng hóa | — | — | — | ✓ | — |
| UC16 | Quản lý tài khoản và phân quyền | — | — | — | ✓ | Gán/gỡ vai trò, khóa tài khoản |
| UC17 | Xem báo cáo doanh thu | — | — | — | ✓ | — |

**Nguyên tắc khi triển khai API sau này:**

- Mỗi endpoint của UC ở bảng trên phải khai báo rõ danh sách `ma_vai_tro` cho phép.
- Endpoint nhiều vai trò dùng `requireRole(A, B, ...)`; ví dụ UC02 có thể mở cho
  `THU_NGAN`, `NHAN_VIEN_KHO`, `ADMIN` khi cần tra cứu chéo.
- Kiểm tra quyền bắt buộc ở **server**, không chỉ ẩn nút ở giao diện (spec 2.8.3).
- "Public" chỉ áp dụng cho việc cấp token (UC10) và đọc danh mục/sản phẩm (UC11);
  mọi thao tác ghi vẫn cần token và đúng vai trò.

## 3. Endpoint đã cài đặt

| Method | Path | Quyền | Trạng thái |
|---|---|---|---|
| GET | `/api/health` | Public | ✓ xong |
| POST | `/api/auth/dang-ky` | Public (luôn tạo `KHACH_HANG`) | ✓ xong |
| POST | `/api/auth/dang-nhap` | Public | ✓ xong |
| GET | `/api/auth/toi` | Bất kỳ vai trò (cần token) | ✓ xong |
| GET | `/api/thu-nghiem/admin` | `ADMIN` | ✓ xong — **route tạm** |
| GET | `/api/thu-nghiem/thu-ngan` | `THU_NGAN` | ✓ xong — **route tạm** |
| GET | `/api/thu-nghiem/nhan-vien-kho` | `NHAN_VIEN_KHO` | ✓ xong — **route tạm** |
| GET | `/api/thu-nghiem/khach-hang` | `KHACH_HANG` | ✓ xong — **route tạm** |
| GET | `/api/thu-nghiem/nhieu-vai-tro` | `ADMIN`, `THU_NGAN`, `NHAN_VIEN_KHO` | ✓ xong — **route tạm** |
| GET | `/api/san-pham` | Public | ✓ xong (UC11) |
| GET | `/api/san-pham/:id` | Public | ✓ xong (UC11) |
| GET | `/api/danh-muc` | Public | ✓ xong (UC11) |
| POST | `/api/admin/danh-muc` | `ADMIN` | ✓ xong (UC15) |
| PATCH | `/api/admin/danh-muc/:id` | `ADMIN` | ✓ xong (UC15) |
| POST | `/api/admin/san-pham` | `ADMIN` | ✓ xong (UC15) |
| PATCH | `/api/admin/san-pham/:id` | `ADMIN` | ✓ xong (UC15) |
| PUT | `/api/admin/san-pham/:id/thanh-phan` | `ADMIN` | ✓ xong (UC15) |
| GET | `/api/nhap-kho` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC06) |
| POST | `/api/nhap-kho` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC06) |
| GET | `/api/nhap-kho/:id` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC06) |
| POST | `/api/nhap-kho/:id/chi-tiet` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC06) |
| PATCH | `/api/nhap-kho/:id/chi-tiet/:sanPhamId` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC06) |
| DELETE | `/api/nhap-kho/:id/chi-tiet/:sanPhamId` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC06) |
| POST | `/api/nhap-kho/:id/gui` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC06) |
| POST | `/api/nhap-kho/:id/huy` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC07) |
| POST | `/api/nhap-kho/:id/xac-nhan` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC07) |
| GET | `/api/nhap-kho/lich-su-ton-kho/:sanPhamId` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC07) |
| GET | `/api/kiem-ke` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC08) |
| POST | `/api/kiem-ke` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC08) |
| GET | `/api/kiem-ke/:id` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC08) |
| PATCH | `/api/kiem-ke/:id/chi-tiet/:sanPhamId` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC08) |
| POST | `/api/kiem-ke/:id/gui` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC08) |
| POST | `/api/kiem-ke/:id/huy` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC08) |
| POST | `/api/kiem-ke/:id/sua-lai` | `NHAN_VIEN_KHO`, `ADMIN` | ✓ xong (UC09) |
| POST | `/api/kiem-ke/:id/duyet` | `ADMIN` | ✓ xong (UC09) |
| POST | `/api/kiem-ke/:id/tu-choi` | `ADMIN` | ✓ xong (UC09) |
| GET | `/api/pos/san-pham` | `THU_NGAN`, `ADMIN` | ✓ xong (UC02) |
| POST | `/api/pos/bao-gia` | `THU_NGAN`, `ADMIN` | ✓ xong (UC04) |
| POST | `/api/pos/chot-don` | `THU_NGAN`, `ADMIN` | ✓ xong (UC05) |
| GET | `/api/pos/don-hang` | `THU_NGAN`, `ADMIN` | ✓ xong (UC05) |
| GET | `/api/pos/don-hang/:id` | `THU_NGAN`, `ADMIN` | ✓ xong (UC05) |

> Mọi route `/api/admin/*` đều có `authenticate` + `requireRole('ADMIN')`:
> không token → `401`, sai vai trò → `403`.

> Các route `/api/thu-nghiem/*` chỉ để kiểm thử RBAC. **Sẽ gỡ bỏ** khi các API nghiệp vụ
> thật (UC01–UC17) được cài đặt (ghi chú ngay trong `src/routes/thu-nghiem.routes.ts`).

### 3.1. Đăng ký / đăng nhập

- `POST /api/auth/dang-ky`
  Body: `{ "username": "khach01", "password": "...", "xacNhatMatKhau": "...", "hoTen": "Nguyễn Văn A", "email": "a@example.com", "sdt": "09xxxxxxxx" }`
  (`email` hoặc `sdt` bắt buộc ít nhất một; `xacNhatMatKhau` là tùy chọn nhưng nếu có phải khớp).
  → `201 { token, taiKhoan, khachHang }`. Tạo `TaiKhoan` + `KhachHang` trong một transaction.
- `POST /api/auth/dang-nhap`
  Body: `{ "dinhDanh": "khach01 | email | sdt", "matKhau": "..." }`.
  Khách: username/email/sdt; nhân viên: username. → `200 { token, taiKhoan, khachHang? | nhanVien? }`.
- `GET /api/auth/toi` — Header `Authorization: Bearer <token>` → `200 { taiKhoan, khachHang? | nhanVien? }`.

**Bảo mật xác thực:**

- JWT ký HS256; khi xác minh chỉ chấp nhận đúng `algorithms: ['HS256']`.
- Sai tài khoản và sai mật khẩu dùng **một** thông báo: `Tên đăng nhập hoặc mật khẩu không đúng` (`401`).
- Tài khoản `BI_KHOA` → `403` **chỉ sau khi mật khẩu đã đúng**; nếu mật khẩu sai thì vẫn trả `401` chung.
- Không endpoint nào trả `password_hash`.

### 3.2. Danh mục & sản phẩm công khai (UC11)

- `GET /api/danh-muc` → `200 [ { id, slug, tenDanhMuc, moTa, thuTu, danhMucChaId, con: [...] } ]`.
  Chỉ trả danh mục `HOAT_DONG`, xếp theo `thuTu` rồi `id`; `con` là cây cha–con.
- `GET /api/san-pham` → `200 { data: [...], pagination: { page, pageSize, total, totalPages } }`.

  | Query | Mặc định | Mô tả |
  |---|---|---|
  | `page`, `pageSize` | `1`, `12` (tối đa 60) | Phân trang |
  | `q` | — | Tìm theo tên (có/không dấu), tác giả, `ma_sp` hoặc `isbn` |
  | `danhMucId` | — | Lọc theo danh mục **và toàn bộ danh mục con** |
  | `loaiSp` | — | `SACH`, `TRUYEN_TRANH`, `DO_DUNG_HOC_TAP`, `BO_TRUYEN`, `COMBO` |
  | `sort` (alias `sortBy`) | `ngayTao` | `gia`, `ten`, `ngayTao` |
  | `order` | `desc` | `asc` / `desc` |

  **Sắp xếp:** `?sort=gia&order=asc` sắp theo `gia_ban` tăng, `?sort=ten&order=desc` sắp theo
  `ten_sp` giảm, `?sort=ngayTao&order=desc` là mặc định. Luôn có thêm `id ASC` để ổn định
  phân trang. Giá trị `sort` ngoài danh sách trên, `order` sai, hoặc **bất kỳ tham số lạ nào**
  (ví dụ `?foo=bar`) → `400 VALIDATION_ERROR` thay vì bị bỏ qua.

  Chỉ trả sản phẩm `DANG_BAN` thuộc danh mục `HOAT_DONG` (ẩn danh mục → ẩn cả sản phẩm). Tìm kiếm tên dùng `translate(lower(...))` ở CSDL nên khớp cả
  "Bộ truyện" và "bo truyen"; chuỗi tìm kiếm cũng được bỏ dấu trước khi tạo pattern.
- `GET /api/san-pham/:id` → `200` chi tiết, gồm `thanhPhan` (dành cho combo/bộ truyện).
  Sản phẩm `NGUNG_BAN` hoặc id không tồn tại → `404`.

**DTO công khai** chỉ gồm: `id`, `maSp`, `isbn`, `tenSp`, `loaiSp`, `tacGia`, `nhaXuatBan`,
`namXuatBan`, `moTa`, `hinhAnh`, `giaBan`, `conHang`, `ngayTao`, `danhMuc`.
Không trả `nhaCungCapId`, `nguongTonToiThieu`, `soLuongTon` chính xác, `ngayCapNhat`.
`giaBan` và giá thành phần luôn là **chuỗi** (NUMERIC → string nhất quán).

### 3.3. Quản trị danh mục & sản phẩm (UC15)

Tất cả cần `Authorization: Bearer <token>` của tài khoản `ADMIN`.

- `POST /api/admin/danh-muc`: `{ slug, tenDanhMuc, moTa?, thuTu?, danhMucChaId?, trangThai? }` → `201`.
- `PATCH /api/admin/danh-muc/:id`: các field trên (tùy chọn) → `200`.
  Trùng `slug` → `409`; `danhMucChaId` trỏ tới chính nó hoặc một danh mục con → `400 INVALID_PARENT`.
- `POST /api/admin/san-pham`: `{ danhMucId, maSp, tenSp, loaiSp, giaBan, ... }` → `201`.
  `giaBan >= 0` (nhận số hoặc chuỗi thập phân, trả về chuỗi 2 chữ số). `so_luong_ton` luôn
  khởi tạo `0`. **Không có field `soLuongTon`**: gửi field này (hoặc field lạ) → `400`.
  Trùng `maSp` hoặc `isbn` → `409`.
- `PATCH /api/admin/san-pham/:id`: cập nhật các field trên, kể cả `trangThai: NGUNG_BAN`
  (ngừng bán, **không xóa cứng**). Vẫn từ chối mọi nỗ lực sửa `soLuongTon`.
- `PUT /api/admin/san-pham/:id/thanh-phan`: `{ thanhPhan: [{ sanPhamId, soLuong }] }` → `200`.
  Chỉ áp cho `loaiSp = COMBO | BO_TRUYEN`; thành phần phải tồn tại, `soLuong > 0`, không trùng,
  không phải chính combo và không phải combo/bộ truyện khác. Toàn bộ thay thế nằm trong một
  transaction. Gửi mảng rỗng để xóa sạch thành phần.

DTO admin (khác DTO công khai) có thêm `soLuongTon`, `nguongTonToiThieu`, `nhaCungCapId`,
`trangThai`, `ngayCapNhat`. Tồn kho **không** sửa được qua các API này; chỉ thay đổi qua nghiệp
vụ nhập kho / kiểm kê / bán hàng (UC05–UC09).

### 3.4. Phiếu nhập kho — lập phiếu (UC06, bước 1)

Chỉ `NHAN_VIEN_KHO` hoặc `ADMIN`. **Bước này chưa cộng tồn kho.**

- `POST /api/nhap-kho`:
  ```json
  {
    "nhaCungCapId": 1,
    "ngayNhap": "2026-11-23T00:00:00.000Z",
    "ghiChu": "string?",
    "trangThai": "CHO_XAC_NHAN",
    "chiTiet": [{ "sanPhamId": "uuid", "soLuong": 2, "giaNhap": 10.5 }]
  }
  ```
  `trangThai` mặc định `CHO_XAC_NHAN`; có thể chọn `NHAP` để lưu nháp. `soLuong > 0`,
  `giaNhap >= 0`, phiếu phải có ít nhất 1 dòng, không trùng sản phẩm.
  `maPn` tự sinh `PN-yyyyMMdd-XXXXXX`. `thanhTien = soLuong * giaNhap`,
  `tongTien = SUM(thanhTien)` được tính lại trong cùng transaction sau mỗi thay đổi dòng.
- `POST /api/nhap-kho/:id/chi-tiet` — thêm/cập nhật (upsert) một dòng.
- `PATCH /api/nhap-kho/:id/chi-tiet/:sanPhamId` — sửa một dòng (404 nếu chưa có).
- `GET /api/nhap-kho?trangThai=&page=&pageSize=` — danh sách + phân trang.
- `GET /api/nhap-kho/:id` — chi tiết: nhà cung cấp, người lập, trạng thái, `tongTien`, các dòng.

Chỉ chỉnh sửa được khi phiếu còn `NHAP` / `CHO_XAC_NHAN`; phiếu đã `DA_NHAP_KHO` / `DA_HUY`
→ `409`. Tiền (`giaNhap`, `thanhTien`, `tongTien`) trả về chuỗi 2 chữ số.

### 3.5. Xác nhận nhập kho và sổ tồn (UC07)

- `POST /api/nhap-kho/:id/gui` — `NHAP → CHO_XAC_NHAN`; phiếu phải có ít nhất 1 dòng.
- `POST /api/nhap-kho/:id/huy` — hủy phiếu `NHAP`/`CHO_XAC_NHAN` → `DA_HUY`, **không đổi tồn**.
  Phiếu `DA_NHAP_KHO` → `409` với thông báo rõ (không trả lỗi trigger của CSDL).
- `POST /api/nhap-kho/:id/xac-nhan` — xác nhận trong **một transaction ACID**:
  1. `SELECT ... FOR UPDATE` dòng phiếu, kiểm tra `CHO_XAC_NHAN`.
  2. `SELECT ... ORDER BY id ASC FOR UPDATE` các dòng sản phẩm (tránh deadlock).
  3. Cộng tồn từng dòng; ghi `LichSuTonKho` `loaiBienDong = NHAP_KHO` với
     `soLuongTruoc`, `soLuongThayDoi`, `soLuongSau = truoc + thayDoi`, `phieuNhapId`,
     `nguoiThucHienId`.
  4. `UPDATE ... WHERE trang_thai = 'CHO_XAC_NHAN'` → `DA_NHAP_KHO` kèm
     `nguoiXacNhanId`, `ngayXacNhan`. Nếu `affected rows = 0` → `409`.
  Xác nhận lặp hoặc hai yêu cầu đồng thời: chỉ một yêu cầu `200`, yêu cầu còn lại `409`,
  tồn chỉ tăng một lần. Mọi thao tác ghi khác (sửa/xóa dòng, gửi, hủy) cũng khóa phiếu
  và kiểm tra trạng thái trong cùng transaction.
- `GET /api/nhap-kho/lich-su-ton-kho/:sanPhamId?page=&pageSize=` — lịch sử biến động,
  mới nhất trước.

Spec UC07 không yêu cầu người xác nhận khác người lập; hệ thống ghi nhận
`nguoi_xac_nhan_id` và `ngay_xac_nhan`. Bất biến được kiểm thử: `so_luong_ton` luôn bằng
`tổng so_luong_thay_doi` trong `LichSuTonKho` của sản phẩm.

### 3.6. Kiểm kê — lập phiếu (UC08, bước 1)

Chỉ `NHAN_VIEN_KHO` hoặc `ADMIN`.

- `POST /api/kiem-ke`: `{ "danhMucId": null | 1, "ghiChu": "string?" }` → `201`.
  - `danhMucId = null` → phạm vi **toàn cửa hàng**.
  - `danhMucId = X` → phạm vi **đúng danh mục X, không gồm danh mục con**.
    Spec không nêu rõ có gồm con hay không; đây là lựa chọn đơn giản và được ghi nhận tại đây.
  - Hệ thống chụp `so_luong_he_thong` từ tồn hiện tại của mọi sản phẩm trong phạm vi;
    `so_luong_thuc_te` khởi tạo bằng số hệ thống (`chenh_lech = 0`), nhân viên kho nhập lại.
    Phạm vi không có sản phẩm → `400 EMPTY_SCOPE`. `maPkk` tự sinh `PKK-yyyyMMdd-XXXXXX`.
  - Trùng phạm vi với phiếu đang mở (`NHAP`/`CHO_DUYET`, kể cả toàn cửa hàng) → `409`
    với thông báo rõ; API bắt cả lỗi exclusion constraint `PhieuKiemKe_khong_chong_pham_vi`
    để không lộ lỗi CSDL.
- `PATCH /api/kiem-ke/:id/chi-tiet/:sanPhamId`: `{ soLuongThucTe, ghiChu? }` →
  `chenhLech = soLuongThucTe - soLuongHeThong`. Chỉ khi phiếu còn `NHAP`.
- `POST /api/kiem-ke/:id/gui`: `NHAP → CHO_DUYET`, ghi `ngayGui`.
- `POST /api/kiem-ke/:id/huy`: hủy phiếu `NHAP`/`CHO_DUYET` → `DA_HUY`, không đổi tồn.
- `GET /api/kiem-ke`, `GET /api/kiem-ke/:id`: danh sách (lọc `trangThai`, phân trang) và chi tiết.

### 3.7. Kiểm kê — duyệt / từ chối (UC09)

- `POST /api/kiem-ke/:id/duyet` — **chỉ ADMIN**. Trong một transaction ACID:
  1. `SELECT ... FOR UPDATE` dòng phiếu, kiểm tra `CHO_DUYET`.
  2. Khóa sản phẩm `ORDER BY id ASC FOR UPDATE`.
  3. Kiểm tra trước toàn bộ: `tồn hiện tại + chenh_lech < 0` → `409` nêu rõ `maSp`,
     rollback toàn bộ (không đổi tồn, không ghi sổ).
  4. `so_luong_ton += chenh_lech` (**không gán đè**, vì có thể có nhập kho/bán hàng xen giữa).
     Dòng `chenh_lech = 0` **không ghi** `LichSuTonKho`.
  5. Ghi `LichSuTonKho` `loaiBienDong = KIEM_KE`, `phieuKiemKeId`, `nguoiThucHienId`,
     `soLuongTruoc / soLuongThayDoi / soLuongSau` đúng công thức.
  6. `UPDATE ... WHERE trang_thai = 'CHO_DUYET'` → `DA_DUYET` kèm `nguoiDuyetId`, `ngayDuyet`;
     `affected rows = 0` → `409`. Duyệt lặp/đồng thời chỉ áp dụng một lần.
- `POST /api/kiem-ke/:id/tu-choi` — **chỉ ADMIN**, body `{ lyDoTuChoi }` bắt buộc không rỗng
  (`400` nếu thiếu). Không đổi tồn; phiếu → `TU_CHOI`.
- `POST /api/kiem-ke/:id/sua-lai` — `TU_CHOI → NHAP` (xóa lý do) để nhân viên kho sửa và gửi lại;
  kiểm tra lại chồng phạm vi vì phiếu mở lại có thể trùng phiếu khác.
- Phiếu `DA_DUYET` không đổi trạng thái được nữa; mọi thao tác chuyển trạng thái trả `409`
  rõ ràng, không để lộ lỗi trigger `PhieuKiemKe_chan_doi_trang_thai_sau_duyet`.
- Spec UC09 **không cấm** ADMIN tự lập rồi tự duyệt phiếu; hệ thống cho phép và ghi nhận
  `nguoi_lap_id`, `nguoi_duyet_id` riêng biệt.

### 3.8. POS — quy tắc đã xác nhận (bước 0)

- **Tích điểm:** 1 điểm / 10.000đ trên `tong_tien`, làm tròn xuống. **Dùng điểm:** 1 điểm = 100đ.
  Hai hằng số nằm trong `src/config/pos.ts`, lấy từ env `POS_DIEM_MOI_TIEN`, `POS_GIA_TRI_DIEM`.
- **Tiền:** mọi phép tính dùng Decimal (decimal.js), không dùng số thực; voucher phần trăm
  làm tròn về đồng nguyên (half-up); phản hồi luôn là chuỗi 2 chữ số thập phân.
- **Điểm:** client gửi `diemSuDung`; server trả `400` nếu vượt số dư hoặc vượt phần tiền còn lại
  sau voucher. Báo giá trả thêm `diemToiDa`. Khách `BI_KHOA` không dùng điểm và không được cộng điểm.
- **Voucher phần trăm:** `gia_tri` phải trong 0–100 (kiểm tra khi tính; sẽ kiểm cả ở API tạo voucher khi có).
- **Idempotency (cho bước 2):** `ma_giao_dich = "POS-" + khóa client`; cùng khóa + cùng nội dung → trả đơn cũ;
  cùng khóa + nội dung khác → `409`; bắt `P2002` trong transaction.
- **Múi giờ:** `Asia/Ho_Chi_Minh` (env `POS_TIMEZONE`) cho `ma_dh` và so sánh ngày voucher.
- **Khách:** gửi cả `khachHangId` và `sdt` mà không cùng một khách → `400`.
- **Nhân viên `DA_NGHI`** bị chặn dùng POS (`requireActiveStaff` áp cho mọi route `/api/pos/*`).
- **Ngoài phạm vi bước này:** hủy / hoàn đơn POS (sẽ làm sau nếu có yêu cầu).

### 3.9. POS — tra cứu & báo giá (UC02/UC04, bước 1)

Chỉ `THU_NGAN` hoặc `ADMIN`. **Không ghi gì vào CSDL.**

- `GET /api/pos/san-pham?q=&danhMucId=&page=&pageSize=` — tra theo tên (có/không dấu),
  `ma_sp` hoặc `isbn` (coi isbn là barcode sách); chỉ `DANG_BAN`; trả cả `soLuongTon`.
- `POST /api/pos/bao-gia`:
  ```json
  {
    "chiTiet": [{ "sanPhamId": "uuid", "soLuong": 1 }],
    "maVoucher": "string?",
    "diemSuDung": 0,
    "khachHangId": "uuid?",
    "sdt": "string?"
  }
  ```
  Trả: `chiTiet` (mỗi dòng có `donGia`, `thanhTien`, `duTon`), `tienHang`, `tienGiamVoucher`,
  `tienGiamDiem`, `tongTien`, `diemSuDung`, `diemToiDa`, `diemCong`, `voucher`, `khachHang`.
  - Giá luôn lấy từ `SanPham.gia_ban` ở server; dòng trùng sản phẩm được gộp số lượng.
  - Voucher kiểm đủ 7 điều kiện (trạng thái, ngày bắt đầu/kết thúc, hạn mức, giới hạn mỗi khách,
    kênh, giá trị đơn tối thiểu, giảm tối đa). Thứ tự: **voucher trước, điểm sau**.
  - `diemToiDa = min(diemTichLuy, floor((tienHang - giamVoucher) / giaTriDiem))`.
  - `diemCong = floor(tongTien / diemMoiTien)` (0 nếu không khách hoặc khách bị khóa).

### 3.10. Chốt đơn, hóa đơn và danh sách đơn POS (UC05)

Chỉ `THU_NGAN` hoặc `ADMIN`; mọi route POS còn chặn nhân viên `DA_NGHI` (`403`).

#### `POST /api/pos/chot-don`

```json
{
  "chiTiet": [{ "sanPhamId": "uuid", "soLuong": 2 }],
  "maVoucher": "string?",
  "diemSuDung": 0,
  "khachHangId": "uuid?",
  "sdt": "string?",
  "tienKhachDua": "200000",
  "idempotencyKey": "pos-ca1-0001"
}
```

- `tienKhachDua` nhận số hoặc chuỗi thập phân tối đa 2 chữ số.
- Schema **strict** như các API khác: chỉ nhận các field liệt kê ở trên. Gửi `tongTien`,
  `donGia`, `thanhTien`, `tienGiamVoucher`, ... → `400 VALIDATION_ERROR` (không được "bỏ qua").
  Dù sao thì mọi khoản tiền vẫn do server tính lại từ CSDL trong transaction, không tin client.
- `idempotencyKey` (tùy chọn): `ma_giao_dich = "POS-" + khóa`. Vân tay nội dung gồm
  dòng (đã gộp theo sản phẩm), voucher, `diemSuDung`, khách, nhân viên. Không gồm `tienKhachDua`.

**Phản hồi:** `201` (đơn mới) hoặc `200` (trả đơn cũ). Các khoản tiền đều là chuỗi 2 chữ số:
`maDh`, `id`, `kenhBan`, `trangThai`, `chiTiet[]` (`maSp`, `tenSp`, `soLuong`, `donGia`, `thanhTien`),
`khachHang`, `nhanVien`, `voucher`, `tienHang`, `tienGiamVoucher`, `tienGiamDiem`, `phiVanChuyen`,
`tongTien`, `diemSuDung`, `diemCong`, `tienKhachDua`, `tienThua`, `thanhToan`, `ngayTao`,
`ngayThanhToan`. `tienThua = tienKhachDua - tongTien`.

**Transaction ACID — thứ tự khóa và ghi:**

1. Khóa `SanPham` theo `id ASC` (`FOR UPDATE OF sp`), kiểm tra còn `DANG_BAN` và danh mục
   `HOAT_DONG`. Khóa `Voucher` (nếu có), rồi khóa `KhachHang` (nếu có).
2. Gọi lại **cùng hàm `computeQuote`** dùng cho báo giá để tính giá/voucher/điểm sau khi khóa.
3. `tienKhachDua < tongTien` → `400 INSUFFICIENT_CASH`, không ghi gì. `tongTien = 0` → `400 INVALID_TOTAL`
   (do `ThanhToan.so_tien > 0`).
4. Trừ tồn `UPDATE ... WHERE so_luong_ton >= soLuong`; `affected = 0` → `409 INSUFFICIENT_STOCK`
   (nêu rõ `maSp`), rollback toàn bộ kể cả voucher/điểm/sổ kho.
5. Ghi `DonHang` (`kenh_ban = POS`, `trang_thai = DA_THANH_TOAN`, `phi_van_chuyen = 0`,
   `nhan_vien_id` từ token, đủ cột tiền/điểm, `ngay_thanh_toan`), `ChiTietDonHang`,
   `ThanhToan` (`TIEN_MAT`/`THANH_CONG`, `so_tien = tong_tien`, `ma_giao_dich`),
   `LichSuTonKho` (`BAN_HANG`, `so_luong_thay_doi` âm, trước/sau đúng công thức).
6. Voucher: `da_su_dung` tăng bằng `UPDATE` có điều kiện còn lượt + `VoucherLuotDung`
   (`so_tien_giam = tien_giam_voucher`); giới hạn mỗi khách kiểm lại trong transaction.
7. Điểm: `KhachHang.diem_tich_luy` không âm, ghi `LichSuDiem` `TRU`/`CONG` với `so_du_sau`
   đúng và `don_hang_id`. Khách lẻ bỏ qua; khách `BI_KHOA` không dùng/không cộng.
8. `ma_dh = DH-yyyyMMdd-XXXXXX` theo `Asia/Ho_Chi_Minh`; trùng thì thử lại tối đa 5 lần.
   Lỗi ràng buộc CSDL (CHECK/unique/FK/trigger) được dịch sang lỗi API, không lộ nội dung CSDL.

**Mã lỗi chính:** `INSUFFICIENT_CASH` (400), `INVALID_TOTAL` (400), `INSUFFICIENT_STOCK` (409),
`PRODUCT_NOT_SELLABLE` (400), `CATEGORY_HIDDEN` (400), `POINTS_REQUIRE_CUSTOMER` (400),
`INSUFFICIENT_POINTS` (400), `POINTS_EXCEED_REMAINING` (400), `CUSTOMER_LOCKED` (400),
`VOUCHER_NOT_FOUND` / `VOUCHER_INACTIVE` / `VOUCHER_NOT_STARTED` / `VOUCHER_EXPIRED` /
`VOUCHER_OUT_OF_STOCK` / `VOUCHER_WRONG_CHANNEL` / `VOUCHER_MIN_ORDER` /
`VOUCHER_PER_CUSTOMER_LIMIT` / `VOUCHER_INVALID_PERCENT` (400), `IDEMPOTENCY_CONFLICT` (409),
`CONSTRAINT_VIOLATION` / `INVALID_ORDER_AMOUNT` / `INVALID_PAYMENT_AMOUNT` / `INVALID_POINTS`
/ `INVALID_STOCK_LEDGER` / `INVALID_REFERENCE` (400/409 theo loại ràng buộc).

**Ràng buộc mã voucher:** migration `20261124000000_voucher_ma_voucher_uppercase` thêm CHECK
`Voucher_ma_voucher_upper_check` (`ma_voucher = upper(ma_voucher)`), nên mã lưu trong CSDL luôn
chữ hoa. `validateVoucher` cũng chuẩn hóa `upper()`, vì vậy khách gửi `sale10` vẫn khớp `SALE10`.
Seed có 2 voucher mẫu để demo: `SALE10` (giảm 10%, tối đa 50.000đ, mọi kênh) và `GIAM50K`
(giảm 50.000đ, đơn từ 300.000đ, riêng POS).

**Idempotency:** cùng khóa + cùng nội dung → `200` đơn cũ; cùng khóa + khác nội dung → `409`;
hai yêu cầu đồng thời cùng khóa → bắt `P2002` ngay khi tạo `ThanhToan`, chỉ một đơn được tạo,
yêu cầu thua trả `200` với đơn đã lưu. Khi replay, `tienKhachDua` lấy theo request hiện tại và
`tienThua` tính lại trên `tongTien` đã lưu (vẫn áp `tienKhachDua >= tongTien`).

#### `GET /api/pos/don-hang/:id` — xem / in lại hóa đơn

`200` hóa đơn đã lưu (cùng cấu trúc phản hồi chốt đơn). Thu ngân chỉ xem được đơn mình thu;
`ADMIN` xem được mọi đơn. Đơn không tồn tại hoặc không phải đơn POS → `404`. Vì `tienKhachDua`
không được lưu trong CSDL, `tienKhachDua` và `tienThua` trả `null` khi xem lại.

#### `GET /api/pos/don-hang?page=&pageSize=&trangThai=&maDh=&tuNgay=&denNgay=` — danh sách đơn POS

`200 { data: [...], pagination: { page, pageSize, total, totalPages } }`. Mỗi dòng gồm
`id`, `maDh`, `trangThai`, `tongTien`, `diemSuDung`, `diemCong`, `khachHang`, `nhanVien`,
`soDong`, `ngayTao`, `ngayThanhToan`. Thu ngân chỉ thấy đơn mình thu; `ADMIN` thấy mọi đơn.
`pageSize` tối đa 60. Không có endpoint sửa/xóa đơn (`PATCH`/`DELETE` → `404`).

## 4. Endpoint theo thiết kế 3.10 — chưa cài đặt

| Module | Endpoint | Quyền theo ma trận |
|---|---|---|
| Auth | `GET /api/v1/users/me` | Any Role |
| Auth | `GET /api/v1/users` | `ADMIN` (UC16) |
| Product | ~~`GET /api/v1/products`, `GET /api/v1/products/:id`~~ | Đã cài tại `/api/san-pham` (UC11) |
| Product | ~~`POST /api/v1/products`, `PUT /api/v1/products/:id`~~ | Đã cài tại `/api/admin/san-pham` (UC15) |
| Sales | ~~`POST /api/v1/orders/pos`~~ | Đã cài tại `/api/pos/chot-don` (UC05) |
| Sales | ~~`GET /api/v1/orders/:id`~~ | Đã cài tại `/api/pos/don-hang/:id` (xem/in lại hóa đơn) |
| Sales | `POST /api/v1/orders/online` | `KHACH_HANG` (UC12/14) |
| Sales | `POST /api/v1/payment/vnpay` | `KHACH_HANG` (UC14) |
| Sales | `POST /api/v1/payment/callback` | Public (server-to-server) |
| Inventory | `GET /api/v1/inventory` | `NHAN_VIEN_KHO`, `ADMIN`, `THU_NGAN` |
| Inventory | `POST /api/v1/inventory/imports` | Đã cài tại `/api/nhap-kho` (UC06/07) |
| Inventory | `POST /api/v1/inventory/checks` | Đã cài tại `/api/kiem-ke` (UC08) |
| Inventory | `PUT /api/v1/inventory/checks/:id` | Đã cài tại `/api/kiem-ke/:id/duyet` và `/tu-choi` (UC09) |
| Report | `GET /api/v1/reports/revenue` | `ADMIN` (UC17) |

> Phần này là căn cứ để gắn `requireRole` khi cài đặt từng API thật.
