export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* CN Tower base */}
      <rect x="95" y="60" width="10" height="120" rx="2" fill="#1a202c" />
      {/* CN Tower pod */}
      <ellipse cx="100" cy="100" rx="18" ry="10" fill="#1a202c" />
      <ellipse cx="100" cy="96" rx="15" ry="8" fill="#2d3748" />
      {/* CN Tower antenna — transitions into pizza slice */}
      <polygon points="100,20 92,60 108,60" fill="#e53e3e" />
      {/* Pizza toppings on the slice */}
      <circle cx="100" cy="42" r="3" fill="#ecc94b" />
      <circle cx="96" cy="50" r="2.5" fill="#ecc94b" />
      <circle cx="104" cy="48" r="2" fill="#ecc94b" />
      {/* Pizza crust arc at base of slice */}
      <path d="M91,58 Q100,63 109,58" stroke="#d69e2e" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Tower base platform */}
      <path d="M85,180 L95,160 L105,160 L115,180" fill="#1a202c" />
    </svg>
  );
}
