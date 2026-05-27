import { useState, useEffect, useRef } from 'react'
import { Menu, Bell, User, Sparkles, Check, LogOut, Settings as SettingsIcon, Database, Cpu } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useLocation, Link } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/constants'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const { toggleSidebar } = useUIStore()
  const location = useLocation()
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [hasNewAlerts, setHasNewAlerts] = useState(true)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const currentNav = NAV_ITEMS.find((item) => item.path === location.pathname)
  const pageTitle = currentNav ? currentNav.label : 'GoalForge'

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-100">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3 relative">
        {/* Notifications Icon Button */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfile(false)
            }}
            className="relative p-2 text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {hasNewAlerts && (
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-brand-500 rounded-full border border-zinc-950 animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2.5 w-80 glass-heavy rounded-2xl border border-zinc-800/60 p-4 shadow-2xl z-50 text-left space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-brand-400" />
                    System Alerts
                  </h3>
                  {hasNewAlerts && (
                    <button 
                      onClick={() => setHasNewAlerts(false)}
                      className="text-[10px] font-medium text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {/* Alert 1 */}
                  <div className="flex gap-3 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0 h-fit">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-semibold text-zinc-200">Report Ready</h4>
                      <p className="text-[10px] text-zinc-500 leading-normal">GTM Strategy Report generated successfully.</p>
                      <span className="text-[9px] text-zinc-600 font-medium block pt-1">2 mins ago</span>
                    </div>
                  </div>

                  {/* Alert 2 */}
                  <div className="flex gap-3 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0 h-fit">
                      <Database className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-semibold text-zinc-200">Connection Live</h4>
                      <p className="text-[10px] text-zinc-500 leading-normal">Successfully connected to MongoDB Atlas.</p>
                      <span className="text-[9px] text-zinc-600 font-medium block pt-1">15 mins ago</span>
                    </div>
                  </div>

                  {/* Alert 3 */}
                  <div className="flex gap-3 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 shrink-0 h-fit">
                      <Cpu className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-semibold text-zinc-200">Gemini Authenticated</h4>
                      <p className="text-[10px] text-zinc-500 leading-normal">AI model weights loaded. Temp initialized at 0.2.</p>
                      <span className="text-[9px] text-zinc-600 font-medium block pt-1">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Avatar Button */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              setShowProfile(!showProfile)
              setShowNotifications(false)
            }}
            className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 hover:border-brand-500/50 flex items-center justify-center text-brand-400 ml-2 transition-all cursor-pointer shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Profile Dropdown Panel */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2.5 w-64 glass-heavy rounded-2xl border border-zinc-800/60 p-4 shadow-2xl z-50 text-left space-y-4"
              >
                {/* User Info Header */}
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-200 truncate">Digant</h4>
                    <p className="text-[10px] text-zinc-500 truncate">digant@goalforge.ai</p>
                  </div>
                </div>

                {/* Workspace Switcher */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block">Active Workspace</span>
                  <div className="space-y-1.5">
                    {/* Item 1 - Active */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-brand-500/5 border border-brand-500/15">
                      <span className="text-xs font-semibold text-brand-300">Personal Sandbox</span>
                      <Check className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                    {/* Item 2 - Locked/Upgrade */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/20 border border-zinc-800/30 opacity-60 group">
                      <span className="text-xs font-medium text-zinc-400">Enterprise Team</span>
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 px-1.5 py-0.5 rounded border border-brand-500/20">Upgrade</span>
                    </div>
                  </div>
                </div>

                {/* Account Navigation / Info */}
                <div className="border-t border-zinc-800 pt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium px-1">
                    <span>API Free Credits</span>
                    <span className="font-mono text-zinc-400">2 / 50 calls</span>
                  </div>

                  <Link to="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors text-xs font-medium">
                    <SettingsIcon className="w-4 h-4 text-zinc-500" />
                    Account Settings
                  </Link>

                  <button className="w-full flex items-center gap-2 p-1.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors text-xs font-medium text-left cursor-pointer">
                    <LogOut className="w-4 h-4 text-red-400/60" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
