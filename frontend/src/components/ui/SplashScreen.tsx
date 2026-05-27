import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Diamond } from 'lucide-react'

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 overflow-hidden"
          >
            {/* Background grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }}
            />

            {/* Radial glow */}
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Secondary glow ring */}
            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full border border-brand-500/10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2.5, opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
            />

            {/* Logo + Text */}
            <div className="relative flex flex-col items-center gap-6">
              {/* Diamond icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(139, 92, 246, 0.2)',
                      '0 0 60px rgba(139, 92, 246, 0.4)',
                      '0 0 20px rgba(139, 92, 246, 0.2)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="p-5 bg-brand-500/10 rounded-2xl border border-brand-500/20"
                >
                  <Diamond className="w-12 h-12 text-brand-400" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <div className="flex flex-col items-center gap-2">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-4xl font-bold tracking-tight"
                >
                  <span className="text-gradient-brand">GoalForge</span>
                  <span className="text-zinc-300 ml-2 font-light">AI</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="text-zinc-500 text-sm tracking-wide"
                >
                  Autonomous Goal Execution Engine
                </motion.p>
              </div>

              {/* Loading bar */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 180 }}
                transition={{ delay: 0.9, duration: 0.3 }}
                className="h-0.5 bg-zinc-800 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600 rounded-full"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.2, delay: 1, ease: 'easeInOut' }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main app content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.3, delay: showSplash ? 0 : 0.1 }}
      >
        {children}
      </motion.div>
    </>
  )
}
