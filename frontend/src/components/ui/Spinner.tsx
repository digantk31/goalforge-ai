import React from 'react'
import { cn } from '@/lib/cn'

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
} as const

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: keyof typeof sizeMap
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const px = sizeMap[size]

    return (
      <svg
        ref={ref}
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        className={cn('animate-spin', className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {/* Background track */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          className="opacity-10"
        />
        {/* Animated arc */}
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-brand-500"
        />
      </svg>
    )
  },
)

Spinner.displayName = 'Spinner'

export { Spinner }
