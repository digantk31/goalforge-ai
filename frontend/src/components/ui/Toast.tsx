import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

let toastId = 0
const listeners: Set<(toast: Toast) => void> = new Set()

/** Call from anywhere — no hooks needed */
export function showToast(message: string, type: ToastType = 'info') {
  const toast: Toast = { id: ++toastId, message, type }
  listeners.forEach(fn => fn(toast))
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  info: 'border-brand-500/30 bg-brand-500/10 text-brand-300',
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Toast) => {
    setToasts(prev => [...prev.slice(-4), toast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 4000)
  }, [])

  useEffect(() => {
    listeners.add(addToast)
    return () => { listeners.delete(addToast) }
  }, [addToast])

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              className={cn(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl min-w-[280px] max-w-[400px]",
                styles[toast.type]
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button onClick={() => dismiss(toast.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
