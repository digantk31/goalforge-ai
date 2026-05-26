import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { ToastContainer } from '@/components/ui/Toast'
import { useUIStore } from '@/stores/uiStore'

export function PageShell() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans text-zinc-100 overflow-hidden relative">
      {/* Background Noise & Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-screen">
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <Sidebar />
      <MobileNav />

      <motion.div
        layout
        className="flex flex-col flex-1 min-w-0"
        animate={{ 
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 
            ? (sidebarCollapsed ? 72 : 240) 
            : 0 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <Outlet />
        </main>
      </motion.div>

      <ToastContainer />
    </div>
  )
}
