/** Họa tiết sóng xanh nhạt cho khung đăng nhập/đăng ký (SVG nội bộ, không ảnh ngoài). */
export function AuthWave() {
  return (
    <svg
      viewBox="0 0 600 220"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-0 left-0 h-48 w-full"
      aria-hidden="true"
    >
      <path d="M0 150C120 100 220 190 340 140S520 60 600 110V220H0Z" fill="#DCE7FF" />
      <path d="M0 175C130 130 240 205 370 165S530 100 600 145V220H0Z" fill="#EAF0FF" />
    </svg>
  )
}
