/** Minh họa sách cho banner trang chủ (SVG nội bộ, không phải logo). */
export function BookHeroArt() {
  return (
    <svg viewBox="0 0 460 300" className="h-full w-full" fill="none" aria-hidden="true">
      <ellipse cx="235" cy="262" rx="170" ry="18" fill="#D6E3FF" />
      <path d="M70 118c62-26 122-20 162 12v112c-42-30-102-36-162-10z" fill="#183BFF" />
      <path d="M86 126c50-18 98-14 130 10v92c-34-22-80-26-130-8z" fill="#EAF0FF" />
      <path d="M100 146c34-11 66-8 90 7M100 166c34-11 66-8 90 7M100 186c30-9 58-7 80 5" stroke="#183BFF" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
      <path d="M390 118c-62-26-122-20-162 12v112c42-30 102-36 162-10z" fill="#345BFF" />
      <path d="M374 126c-50-18-98-14-130 10v92c34-22 80-26 130-8z" fill="#FFFFFF" />
      <path d="M360 146c-34-11-66-8-90 7M360 166c-34-11-66-8-90 7M360 186c-30-9-58-7-80 5" stroke="#345BFF" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
      <path d="M230 130v110" stroke="#183BFF" strokeWidth="5" strokeLinecap="round" />
      <path d="M226 96h16v38l-8-9-8 9z" fill="#F0B429" />
      <circle cx="330" cy="70" r="8" fill="#F0B429" opacity="0.8" />
      <circle cx="130" cy="78" r="5" fill="#183BFF" opacity="0.5" />
    </svg>
  )
}
