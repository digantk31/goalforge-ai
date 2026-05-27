import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { ToastContainer } from '@/components/ui/Toast'
import { useUIStore } from '@/stores/uiStore'

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)' },
}

export function PageShell() {
  const { sidebarCollapsed } = useUIStore()
  const location = useLocation()
  const navigate = useNavigate()

  // Cmd+K / Ctrl+K → New Goal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        navigate('/new')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans text-zinc-100 overflow-hidden relative">
      {/* Background Noise & Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-noise opacity-20" />
        {/* Top-left orb */}
        <div
          className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[140px] animate-float"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)' }}
        />
        {/* Bottom-right orb */}
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[35%] h-[35%] rounded-full blur-[120px] animate-float"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', animationDelay: '3s' }}
        />
        {/* Center subtle orb */}
        <div
          className="absolute top-[40%] left-[50%] w-[25%] h-[25%] rounded-full blur-[100px] animate-breathe"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, transparent 70%)', transform: 'translateX(-50%)' }}
        />
        {/* Grid overlay for futuristic feel */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <Sidebar />
      <MobileNav />

      <motion.div
        layout
        className="flex flex-col flex-1 min-w-0 relative z-10"
        animate={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768
            ? (sidebarCollapsed ? 72 : 240)
            : 0
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      <ToastContainer />
    </div>
  )
}
