import React from 'react'
import { motion, useMotionValue, useMotionTemplate, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/cn'

/* ─── Padding map ─── */
const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
} as const

/* ─── Card ─── */
export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glow'
  hover?: boolean
  padding?: keyof typeof paddings
  children?: React.ReactNode
}

  const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
      {
        variant = 'default',
        hover = false,
        padding = 'md',
        children,
        className,
        onMouseMove,
        ...props
      },
      ref,
    ) => {
      const mouseX = useMotionValue(0)
      const mouseY = useMotionValue(0)

      function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const { currentTarget, clientX, clientY } = e
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
        if (onMouseMove) onMouseMove(e)
      }

      return (
        <motion.div
          ref={ref}
          onMouseMove={hover ? handleMouseMove : onMouseMove}
          whileHover={
            hover
              ? { y: -2, transition: { duration: 0.2 } }
              : undefined
          }
          className={cn(
            'group relative rounded-xl border bg-zinc-900 overflow-hidden',
            'transition-all duration-200',
            paddings[padding],
            variant === 'glow'
              ? 'border-brand-500/20 animate-pulse-glow'
              : 'border-zinc-800',
            hover && 'hover:border-zinc-700 cursor-pointer',
            className,
          )}
          {...props}
        >
          {hover && (
            <motion.div
              className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
              style={{
                background: useMotionTemplate`
                  radial-gradient(
                    650px circle at ${mouseX}px ${mouseY}px,
                    rgba(139, 92, 246, 0.15),
                    transparent 80%
                  )
                `,
              }}
            />
          )}
          <div className="relative z-10">{children}</div>
        </motion.div>
      )
    },
  )

Card.displayName = 'Card'

/* ─── CardHeader ─── */
export interface CardSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-1.5 pb-4 border-b border-zinc-800/60',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)

CardHeader.displayName = 'CardHeader'

/* ─── CardContent ─── */
const CardContent = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('py-4', className)}
      {...props}
    >
      {children}
    </div>
  ),
)

CardContent.displayName = 'CardContent'

/* ─── CardFooter ─── */
const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2 pt-4 border-t border-zinc-800/60',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }
