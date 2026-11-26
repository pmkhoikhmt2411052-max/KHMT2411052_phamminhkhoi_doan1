interface LogoProps {
  /** Chiều cao hiển thị; chiều rộng tự theo tỷ lệ gốc nhờ object-contain. */
  className?: string
  alt?: string
}

/**
 * Logo chính thức của BookMark Nhà Sách.
 * File gốc `/images/bookmark-logo.png` được giữ nguyên, không chỉnh sửa.
 * Bản hiển thị `/images/bookmark-logo-cropped.png` được cắt sát viền + nền trong suốt
 * từ chính file gốc (xử lý bằng PIL, không vẽ lại/không đổi màu navy–gold).
 */
export function Logo({ className = 'h-12', alt = 'BookMark Nhà Sách' }: LogoProps) {
  return (
    <img
      src="/images/bookmark-logo-cropped.png"
      alt={alt}
      className={`block max-w-full object-contain ${className}`}
    />
  )
}
