'use client'

export default function AnimatedLockIcon({
  className = 'h-8 w-8 text-white',
}: {
  className?: string
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lock-animate-fade ${className}`}
    >
      <path d="M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z" />
      <path d="M12 15v2" className="lock-animate-keyhole" />
      <g className="lock-animate-shackle">
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </g>
    </svg>
  )
}
