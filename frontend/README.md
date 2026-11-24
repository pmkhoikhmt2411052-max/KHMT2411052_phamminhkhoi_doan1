# BookMark Frontend

Khung frontend React + Vite + TypeScript cho hệ thống nhà sách BookMark. Giao diện hoàn toàn tiếng Việt, bố cục gọn phù hợp màn hình 1366px.

## Cài đặt & chạy

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # kiểm tra TypeScript + đóng gói vào dist/
npm run preview  # xem bản build
```

Backend phải chạy tại `http://localhost:3000`. `vite.config.ts` cấu hình proxy: mọi request bắt đầu bằng `/api` được chuyển tiếp sang backend, nên **không cần bật CORS và không dùng biến môi trường nào** cho địa chỉ API. Các service chỉ gọi đường dẫn tương đối `/api/...`.

## Danh sách trang

| Đường dẫn | Trang | Quyền (UX) | API thật được gọi |
|---|---|---|---|
| `/dang-nhap` | Đăng nhập | công khai | `POST /api/auth/dang-nhap`, sau đó `GET /api/auth/toi` để lấy vai trò và điều hướng |
| `/dang-ky` | Đăng ký khách hàng | công khai | `POST /api/auth/dang-ky`, sau đó `GET /api/auth/toi` |
| `/` | Trang chủ khách hàng + nút đăng xuất | `KHACH_HANG` | `GET /api/auth/toi` |
| `/pos` | Bán hàng: tra cứu SP, giỏ hàng, báo giá, chốt đơn, in hóa đơn | `THU_NGAN`, `ADMIN` | `GET /api/pos/san-pham`, `POST /api/pos/bao-gia`, `POST /api/pos/chot-don` |
| `/pos/don-hang` | Danh sách & xem lại hóa đơn (có in) | `THU_NGAN`, `ADMIN` | `GET /api/pos/don-hang`, `GET /api/pos/don-hang/:id` |
| `/kho` | Trang kho (khung, chưa nghiệp vụ) | `NHAN_VIEN_KHO`, `ADMIN` | — |
| `/quan-tri` | Trang quản trị (khung, chưa nghiệp vụ) | `ADMIN` | — |
| `/khong-co-quyen` | Thông báo 403 | mọi vai trò | — |

Sau đăng nhập/đăng ký, điều hướng theo vai trò do `GET /api/auth/toi` trả về: `KHACH_HANG` → `/`, `THU_NGAN` → `/pos`, `NHAN_VIEN_KHO` → `/kho`, `ADMIN` → `/quan-tri`.

## Token & bảo mật

- JWT access token được lưu trong `localStorage` với key `bookmark_token`. Lý do chọn: triển khai đơn giản cho SPA, trang vẫn giữ đăng nhập sau khi tải lại, không cần thay đổi backend để phát hành/đọc cookie.
- Hạn chế: `localStorage` có thể bị đọc bởi mã JavaScript độc hại (XSS). Vì vậy **không lưu mật khẩu hay dữ liệu nhạy cảm**, chỉ lưu token ngắn hạn; không tin vào nội dung token ở giao diện để quyết định quyền.
- API wrapper (`src/services/api.ts`) tự gắn `Authorization: Bearer <token>`; khi nhận `401` thì xóa token và chuyển về `/dang-nhap` (ngoại trừ chính API đăng nhập/đăng ký để form hiển thị thông báo lỗi của server).
- **Quyền thật sự do backend kiểm tra** (`authenticate` + `requireRole`). Việc ẩn menu/nút theo vai trò ở frontend chỉ nhằm cải thiện trải nghiệm, không phải cơ chế bảo mật.

## Giả định đã đưa ra

- Thư mục frontend mới là `D:\BookMark\frontend`; không sửa `backend/` hay `docs/`.
- Backend chạy tại `http://localhost:3000` với prefix `/api`; proxy Vite dùng đúng prefix này.
- Không dùng biến môi trường; `.gitignore` chặn `node_modules`, `dist`, `.env`.
- Không dùng Zod/Recharts để validate/biểu đồ: kiểm tra form thủ công (`src/utils/formRules.ts`).
- Tiền và tổng đơn luôn do server tính lại; client chỉ gửi `sanPhamId`, `soLuong`, voucher/điểm, `tienKhachDua` và `idempotencyKey` (schema `chot-don` strict — không gửi `donGia`/`thanhTien`/`tongTien`).
- Trang POS tạo sẵn khóa giao dịch (`POS-...`) cho idempotency; có thể sửa trước khi chốt.
- Trang kho và quản trị chỉ là khung có tiêu đề theo yêu cầu bước này.
