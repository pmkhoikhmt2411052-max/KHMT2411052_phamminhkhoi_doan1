/**
 * Thông tin cửa hàng hiển thị trên hóa đơn.
 * Không chứa bí mật; có thể override qua VITE_STORE_NAME / VITE_STORE_ADDRESS / VITE_STORE_PHONE.
 */
export const STORE_INFO = {
  name: import.meta.env.VITE_STORE_NAME || 'BookMark Nhà Sách',
  address:
    import.meta.env.VITE_STORE_ADDRESS ||
    '123 Nguyễn Văn Cừ, Phường 5, Quận 5, TP. Hồ Chí Minh',
  phone: import.meta.env.VITE_STORE_PHONE || '028 3822 0000',
} as const
