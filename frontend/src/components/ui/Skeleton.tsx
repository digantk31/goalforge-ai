import React from 'react'
import { cn } from '@/lib/cn'

const variantClasses = {
  text: 'h-4 w-full rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
} as const

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantClasses
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-zinc-800 animate-pulse',
          variantClasses[variant],
          className,
        )}
        aria-hidden="true"
        {...props}
      />
    )
  },
)

Skeleton.displayName = 'Skeleton'

export { Skeleton }
