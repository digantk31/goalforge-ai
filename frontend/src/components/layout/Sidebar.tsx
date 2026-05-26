import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Diamond, LayoutDashboard, Sparkles, History, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/uiStore'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Sparkles,
  History,
  Settings,
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore()

  return (
    <motion.aside
      layout
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      className="fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col bg-zinc-950 border-r border-zinc-800"
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-zinc-800 shrink-0 overflow-hidden">
        <Diamond className="w-6 h-6 text-brand-500 shrink-0" />
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="ml-3 font-semibold text-lg text-gradient-brand whitespace-nowrap"
            >
              GoalForge
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.iconName]
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative',
                  isActive
                    ? 'bg-brand-500/10 text-brand-400'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                )
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute left-0 top-1 bottom-1 w-1 bg-brand-500 rounded-r-full"
                    />
                  )}
                  <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-brand-400' : 'text-zinc-400 group-hover:text-zinc-100')} />
                  {!sidebarCollapsed && (
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer Toggle */}
      <div className="p-4 border-t border-zinc-800 shrink-0">
        <button
          onClick={toggleSidebarCollapse}
          className="flex items-center justify-center w-full p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  )
}

// Needed to wrap AnimatePresence correctly
import { AnimatePresence } from 'framer-motion'
