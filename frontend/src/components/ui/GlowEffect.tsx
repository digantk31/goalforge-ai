import React from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/cn'

export interface GlowEffectProps extends HTMLMotionProps<"div"> {
  color?: string
  active?: boolean
  children?: React.ReactNode
}

const GlowEffect = React.forwardRef<HTMLDivElement, GlowEffectProps>(
  (
    {
      color = 'rgba(139, 92, 246, 0.15)',
      active = true,
      children,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        animate={
          active
            ? {
                boxShadow: [
                  `0 0 20px ${color}, 0 0 40px ${color.replace(/[\d.]+\)$/, '0.05)')}`,
                  `0 0 40px ${color}, 0 0 80px ${color.replace(/[\d.]+\)$/, '0.1)')}`,
                  `0 0 20px ${color}, 0 0 40px ${color.replace(/[\d.]+\)$/, '0.05)')}`,
                ],
              }
            : { boxShadow: 'none' }
        }
        transition={
          active
            ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.2 }
        }
        className={cn('rounded-xl overflow-hidden', className)}
        style={style}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

GlowEffect.displayName = 'GlowEffect'

export { GlowEffect }
