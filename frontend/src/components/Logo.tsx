interface LogoProps {
  /** Chiều cao hiển thị; chiều rộng tự theo tỷ lệ gốc nhờ object-contain. */
  className?: string
  alt?: string
}

/**
 * Logo chính thức của BookMark Nhà Sách.
 * Nguồn duy nhất: /images/bookmark-logo.png (frontend/public/images/bookmark-logo.png).
 * Không tự vẽ/chỉnh màu/cắt ảnh — chỉ hiển thị với object-fit: contain.
 */
export function Logo({ className = 'h-12', alt = 'BookMark Nhà Sách' }: LogoProps) {
  return (
    <img
      src="/images/bookmark-logo.png"
      alt={alt}
      className={`block max-w-full object-contain ${className}`}
    />
  )
}
