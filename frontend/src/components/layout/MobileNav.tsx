import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Diamond, LayoutDashboard, Sparkles, History, Settings } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/uiStore'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Sparkles,
  History,
  Settings,
}

export function MobileNav() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-64 bg-zinc-950 border-r border-zinc-800 z-50 flex flex-col md:hidden shadow-2xl"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Diamond className="w-6 h-6 text-brand-500" />
                <span className="font-semibold text-lg text-gradient-brand">GoalForge</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = iconMap[item.iconName]
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-brand-500/10 text-brand-400 font-medium'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                      )
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
