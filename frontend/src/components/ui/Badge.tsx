import React from 'react'
import { cn } from '@/lib/cn'

const variants = {
  default: 'bg-zinc-800 text-zinc-300',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  error: 'bg-red-500/10 text-red-400',
  info: 'bg-blue-500/10 text-blue-400',
  accent: 'bg-brand-500/10 text-brand-400',
} as const

const dotColors = {
  default: 'bg-zinc-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-red-400',
  info: 'bg-blue-400',
  accent: 'bg-brand-400',
} as const

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants
  dot?: boolean
  children?: React.ReactNode
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', dot = false, children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5',
          'text-xs font-medium rounded-full',
          'transition-colors duration-150',
          variants[variant],
          className,
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'size-1.5 rounded-full shrink-0',
              dotColors[variant],
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    )
  },
)

Badge.displayName = 'Badge'

export { Badge }
