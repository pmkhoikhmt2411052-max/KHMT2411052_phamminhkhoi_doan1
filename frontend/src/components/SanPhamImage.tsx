import { useEffect, useState } from 'react'

interface SanPhamImageProps {
  src: string | null
  alt: string
  className?: string
}

/** Minh họa sách dùng khi sản phẩm chưa có ảnh bìa (không dùng chữ cái đơn điệu). */
function BookPlaceholder() {
  return (
    <svg viewBox="0 0 120 96" className="h-16 w-20" fill="none" aria-hidden="true">
      <path
        d="M12 22c14-6 28-6 42 1v58c-14-7-28-7-42-1z"
        fill="#EAF0FF"
        stroke="#183BFF"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M108 22c-14-6-28-6-42 1v58c14-7 28-7 42-1z"
        fill="#FFFFFF"
        stroke="#183BFF"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M60 23v58" stroke="#183BFF" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 36h20M22 45h16M22 54h18" stroke="#345BFF" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M78 36h20M82 45h16M80 54h18" stroke="#345BFF" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M52 12h16v14l-8-5-8 5z" fill="#183BFF" />
    </svg>
  )
}

/**
 * Ảnh bìa sản phẩm. Backend trả `hinhAnh` có thể là null (seed chưa có ảnh),
 * nên luôn có khung thay thế đẹp mắt để trang gọn và chụp ảnh báo cáo được.
 */
export function SanPhamImage({ src, alt, className = '' }: SanPhamImageProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 border border-line bg-gradient-to-br from-surface to-white ${className}`}
        role="img"
        aria-label={`Không có hình ảnh cho ${alt}`}
      >
        <BookPlaceholder />
        <span className="text-xs text-muted">Chưa có ảnh bìa</span>
      </div>
    )
  }

  return (
    <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setFailed(true)} />
  )
}
