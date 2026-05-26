import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'

export interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
} as const

const originMap = {
  top: { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } },
  bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 } },
  left: { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 } },
} as const

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, side = 'top', className }, ref) => {
    const [visible, setVisible] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const show = useCallback(() => {
      timerRef.current = setTimeout(() => setVisible(true), 200)
    }, [])

    const hide = useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setVisible(false)
    }, [])

    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }, [])

    const anim = originMap[side]

    return (
      <div
        ref={ref}
        className="relative inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}

        <AnimatePresence>
          {visible && (
            <motion.div
              role="tooltip"
              initial={anim.initial}
              animate={anim.animate}
              exit={{ ...anim.initial, transition: { duration: 0.1 } }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute z-50 pointer-events-none whitespace-nowrap',
                'bg-zinc-800 text-zinc-200 text-xs font-medium',
                'px-2.5 py-1.5 rounded-md shadow-lg',
                'border border-zinc-700/50',
                positionClasses[side],
                className,
              )}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

Tooltip.displayName = 'Tooltip'

export { Tooltip }
