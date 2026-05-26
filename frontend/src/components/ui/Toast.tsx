import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore, type Toast as ToastType } from '@/stores/uiStore'

/* ─── Color bars per type ─── */
const barColors = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
} as const

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
} as const

/* ─── Single toast item ─── */
interface ToastItemProps {
  toast: ToastType
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(
      () => onRemove(toast.id),
      toast.duration ?? 5000,
    )
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.15 } }}
      className={cn(
        'relative overflow-hidden min-w-80',
        'bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg',
        'p-4 pl-6',
      )}
    >
      {/* Left colored bar */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1',
          barColors[toast.type],
        )}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', iconColors[toast.type])}>
            {toast.title}
          </p>
          {toast.message && (
            <p className="mt-0.5 text-xs text-zinc-400 line-clamp-2">
              {toast.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemove(toast.id)}
          className={cn(
            'shrink-0 p-0.5 rounded text-zinc-500 hover:text-zinc-100',
            'hover:bg-zinc-800 transition-colors cursor-pointer',
          )}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Toast Container ─── */
const ToastContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const toasts = useUIStore((s) => s.toasts)
  const removeToast = useUIStore((s) => s.removeToast)

  return (
    <div
      ref={ref}
      className={cn(
        'fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none',
        className,
      )}
      {...props}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
})

ToastContainer.displayName = 'ToastContainer'

export { ToastContainer }
