# Thiết kế API — BookMark

> Trạng thái: đang cài đặt (mới đến bước 3/4: khung app → xác thực → phân quyền).
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
| UC06 | Lập phiếu nhập kho | — | — | ✓ | — | Chưa đổi tồn |
| UC07 | Cập nhật tồn kho | — | — | ✓ | — | Xác nhận phiếu mới cộng tồn |
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

## 4. Endpoint theo thiết kế 3.10 — chưa cài đặt

| Module | Endpoint | Quyền theo ma trận |
|---|---|---|
| Auth | `GET /api/v1/users/me` | Any Role |
| Auth | `GET /api/v1/users` | `ADMIN` (UC16) |
| Product | `GET /api/v1/products`, `GET /api/v1/products/:id` | Public (UC11) |
| Product | `POST /api/v1/products`, `PUT /api/v1/products/:id` | `ADMIN` (UC15) |
| Sales | `POST /api/v1/orders/pos` | `THU_NGAN` (UC05) |
| Sales | `POST /api/v1/orders/online` | `KHACH_HANG` (UC12/14) |
| Sales | `POST /api/v1/payment/vnpay` | `KHACH_HANG` (UC14) |
| Sales | `POST /api/v1/payment/callback` | Public (server-to-server) |
| Inventory | `GET /api/v1/inventory` | `NHAN_VIEN_KHO`, `ADMIN`, `THU_NGAN` |
| Inventory | `POST /api/v1/inventory/imports`, `POST /api/v1/inventory/checks` | `NHAN_VIEN_KHO` (UC06/08) |
| Inventory | `PUT /api/v1/inventory/checks/:id` | `ADMIN` (UC09) |
| Report | `GET /api/v1/reports/revenue` | `ADMIN` (UC17) |

> Phần này là căn cứ để gắn `requireRole` khi cài đặt từng API thật.
