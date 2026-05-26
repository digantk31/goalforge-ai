import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

const overlayVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const contentVariants: any = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 350 },
  },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } },
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, description, children, className }, ref) => {
    /* Lock body scroll when open */
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
      }
      return () => {
        document.body.style.overflow = ''
      }
    }, [open])

    /* Close on Escape */
    useEffect(() => {
      if (!open) return
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    return createPortal(
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Content */}
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'relative z-10 w-full max-w-lg mx-4',
                'bg-zinc-900 border border-zinc-800 rounded-xl',
                'shadow-2xl shadow-black/40',
                'p-6',
                className,
              )}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'absolute top-4 right-4',
                  'p-1 rounded-md text-zinc-500 hover:text-zinc-100',
                  'hover:bg-zinc-800 transition-colors cursor-pointer',
                )}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Header */}
              {(title || description) && (
                <div className="mb-4 pr-8">
                  {title && (
                    <h2 className="text-lg font-semibold text-zinc-100">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-zinc-400">{description}</p>
                  )}
                </div>
              )}

              {/* Body */}
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body,
    )
  },
)

Modal.displayName = 'Modal'

export { Modal }
