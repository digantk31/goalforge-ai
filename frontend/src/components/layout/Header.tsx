import { Menu, Bell, User } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/constants'

export function Header() {
  const { toggleSidebar } = useUIStore()
  const location = useLocation()

  const currentNav = NAV_ITEMS.find((item) => item.path === location.pathname)
  const pageTitle = currentNav ? currentNav.label : 'GoalForge'

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-100">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-brand-500 rounded-full border border-zinc-950"></span>
        </button>

        <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 ml-2">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  )
}
