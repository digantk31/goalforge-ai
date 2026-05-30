import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Diamond } from 'lucide-react'

// Particle definition for synaptic animation
interface NodeParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  pulseSpeed: number
  pulsePhase: number
  color: string
  isCoreNode?: boolean
}

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [statusIdx, setStatusIdx] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const bootStatuses = [
    'ESTABLISHING COGNITIVE INTERACTION PROTOCOLS...',
    'INITIATING QUANTUM AGENT ORCHESTRATOR...',
    'BOOTING GEMINI-2.0-FLASH NEURAL SYNAPSE...',
    'CALIBRATING MUTUAL AGENT AUTONOMY COEFFICIENT...',
    'STABILIZING SYNAPTIC VECTOR ALIGNMENT...',
    'SYNTHESIZING GOALFORGE HOLOGRAPHIC CONSOLE...',
  ]

  // Status loop
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIdx((prev) => (prev < bootStatuses.length - 1 ? prev + 1 : prev))
    }, 450)
    return () => clearInterval(statusInterval)
  }, [])

  // Auto transition out
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Live particle canvas background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Generate nodes
    const particles: NodeParticle[] = []
    const particleCount = Math.min(65, Math.floor((width * height) / 25000))

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 0.4 + 0.2
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2 + 1,
        pulseSpeed: Math.random() * 0.05 + 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
        color: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#8b5cf6' : '#6366f1', // emerald, purple, indigo
      })
    }

    // Dynamic Central Core Nodes (attract particles)
    const coreNodeCount = 4
    for (let i = 0; i < coreNodeCount; i++) {
      const angle = (i / coreNodeCount) * Math.PI * 2
      particles.push({
        x: width / 2 + Math.cos(angle) * 120,
        y: height / 2 + Math.sin(angle) * 120,
        vx: Math.cos(angle + Math.PI / 2) * 0.3,
        vy: Math.sin(angle + Math.PI / 2) * 0.3,
        radius: 3.5,
        pulseSpeed: 0.08,
        pulsePhase: i * (Math.PI / 2),
        color: '#8b5cf6',
        isCoreNode: true,
      })
    }

    // Draw Loop
    let time = 0
    const render = () => {
      time += 0.015
      ctx.clearRect(0, 0, width, height)

      // 1. Draw glowing background grid
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.04)'
      ctx.lineWidth = 1
      const gridSize = 60
      const offsetX = (time * 10) % gridSize
      const offsetY = (time * 10) % gridSize

      for (let x = offsetX; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // 2. Draw neural pathways (synaptic connections)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = p1.isCoreNode || p2.isCoreNode ? 180 : 130

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.28
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            
            // Draw curving neural paths
            const cx = (p1.x + p2.x) / 2 + Math.sin(time + dist * 0.01) * 8
            const cy = (p1.y + p2.y) / 2 + Math.cos(time + dist * 0.01) * 8
            
            ctx.quadraticCurveTo(cx, cy, p2.x, p2.y)

            // Dynamic color gradient based on particle colors
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
            grad.addColorStop(0, p1.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'))
            grad.addColorStop(1, p2.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'))
            
            ctx.strokeStyle = grad
            ctx.lineWidth = p1.isCoreNode || p2.isCoreNode ? 1.5 : 0.8
            ctx.stroke()

            // Draw floating neural data packet sparks
            if (time % 4 < 0.1 && Math.random() < 0.05) {
              const sparkT = (time % 1)
              const sx = p1.x + (p2.x - p1.x) * sparkT
              const sy = p1.y + (p2.y - p1.y) * sparkT
              ctx.beginPath()
              ctx.arc(sx, sy, 2, 0, Math.PI * 2)
              ctx.fillStyle = '#ffffff'
              ctx.shadowColor = '#8b5cf6'
              ctx.shadowBlur = 10
              ctx.fill()
              ctx.shadowBlur = 0 // Reset
            }
          }
        }
      }

      // 3. Update & Draw particles
      particles.forEach((p) => {
        p.pulsePhase += p.pulseSpeed
        const pulse = Math.sin(p.pulsePhase) * 1.5 + 2

        // Core orbit math
        if (p.isCoreNode) {
          const centerX = width / 2
          const centerY = height / 2
          const dx = p.x - centerX
          const dy = p.y - centerY
          const dist = Math.sqrt(dx * dx + dy * dy)
          const angle = Math.atan2(dy, dx) + 0.005 // Orbit speed
          p.x = centerX + Math.cos(angle) * dist
          p.y = centerY + Math.sin(angle) * dist
        } else {
          // Standard drift
          p.x += p.vx
          p.y += p.vy

          // Core gravitational pull
          const cdx = width / 2 - p.x
          const cdy = height / 2 - p.y
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy)
          if (cdist < 300) {
            p.vx += (cdx / cdist) * 0.003
            p.vy += (cdy / cdist) * 0.003
            // Speed cap
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
            if (speed > 1.2) {
              p.vx = (p.vx / speed) * 1.2
              p.vy = (p.vy / speed) * 1.2
            }
          }

          // Bounce walls
          if (p.x < 0 || p.x > width) p.vx *= -1
          if (p.y < 0 || p.y > height) p.vy *= -1
        }

        // Draw particle glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius + (p.isCoreNode ? pulse : 0), 0, Math.PI * 2)
        ctx.fillStyle = p.color
        if (p.isCoreNode) {
          ctx.shadowColor = p.color
          ctx.shadowBlur = 12
        }
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // 4. Draw Rotating Cybernetic Holograms in the center
      const cx = width / 2
      const cy = height / 2

      // Outer Dashboard ring
      ctx.beginPath()
      ctx.arc(cx, cy, 140, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Dotted Rotating Ring
      ctx.beginPath()
      ctx.arc(cx, cy, 160, time * 0.4, time * 0.4 + Math.PI * 1.4)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)' // Emerald green
      ctx.lineWidth = 2
      ctx.setLineDash([5, 15])
      ctx.stroke()
      ctx.setLineDash([]) // reset

      // Reverse Dotted Ring
      ctx.beginPath()
      ctx.arc(cx, cy, 175, -time * 0.3, -time * 0.3 + Math.PI * 0.8)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)' // Indigo
      ctx.lineWidth = 1
      ctx.setLineDash([20, 10, 5, 10])
      ctx.stroke()
      ctx.setLineDash([]) // reset

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#03000a] overflow-hidden select-none"
          >
            {/* Live Interactive Synapse Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Glowing neon radial backdrop */}
            <div className="absolute w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[90px] pointer-events-none" />

            {/* Central Holographic Dashboard Console */}
            <div className="relative flex flex-col items-center gap-8 z-10">
              
              {/* Spinning Logo Assembly */}
              <div className="relative flex items-center justify-center">
                {/* Spinning glow ring */}
                <motion.div
                  className="absolute w-36 h-36 rounded-full border border-brand-500/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />
                
                {/* Secondary emerald ring */}
                <motion.div
                  className="absolute w-40 h-40 rounded-full border-t border-b border-emerald-500/20"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                />

                {/* Central Glassmorphic Tesseract Frame */}
                <motion.div
                  initial={{ scale: 0, rotate: -225 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
                >
                  <motion.div
                    className="p-6 bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800/80 shadow-2xl relative group overflow-hidden"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(139, 92, 246, 0.15), inset 0 0 10px rgba(139, 92, 246, 0.1)',
                        '0 0 45px rgba(139, 92, 246, 0.35), inset 0 0 15px rgba(139, 92, 246, 0.2)',
                        '0 0 20px rgba(139, 92, 246, 0.15), inset 0 0 10px rgba(139, 92, 246, 0.1)',
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Glowing neon laser sweep inside logo */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/10 to-transparent w-full h-[30%] top-[-30%] animate-scan pointer-events-none" />

                    <Diamond className="w-14 h-14 text-brand-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Title & Core Subtitle */}
              <div className="flex flex-col items-center gap-2 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="text-4xl font-extrabold tracking-wider"
                >
                  <span className="text-gradient-brand">GoalForge</span>
                  <span className="text-zinc-200 ml-2 font-extralight tracking-widest text-3xl">AI</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="text-xs text-brand-400 font-mono tracking-[0.25em] uppercase"
                >
                  Autonomous Agent Synthesis
                </motion.p>
              </div>

              {/* Holographic Progress Status Console */}
              <div className="flex flex-col items-center gap-3 w-72">
                
                {/* Cyberpunk Boot Logs */}
                <div className="h-6 flex items-center justify-center w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={statusIdx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="text-[10px] text-emerald-400/90 font-mono tracking-widest select-none truncate text-center"
                    >
                      &gt; {bootStatuses[statusIdx]}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Glassmorphic Cyber Progress Bar */}
                <div className="relative w-full h-2 bg-zinc-950 border border-zinc-900/60 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-600 via-emerald-400 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.8, ease: [0.25, 0.8, 0.25, 1] }}
                  />
                </div>

                {/* Core Data Counter */}
                <div className="flex justify-between w-full text-[9px] text-zinc-500 font-mono">
                  <span>COGNITION_SECURE</span>
                  <span>VER_2.0.FLASH</span>
                </div>

              </div>

            </div>

            {/* Futuristic Tech HUD decorations in screen corners */}
            <div className="absolute bottom-6 left-6 font-mono text-[9px] text-zinc-600/80 flex flex-col gap-1 hidden md:flex pointer-events-none">
              <div>SYS_GRID: ON_LATENCY_0.02ms</div>
              <div>AGENT_POOL: COALESCED [n=12]</div>
            </div>

            <div className="absolute bottom-6 right-6 font-mono text-[9px] text-zinc-600/80 flex flex-col gap-1 items-end hidden md:flex pointer-events-none">
              <div>GEO_LOC: DEPLOYED_VERCEL</div>
              <div>SECURE_CORE_ESTABLISHED: OK</div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Main app content reveal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.5, delay: showSplash ? 0 : 0.1 }}
      >
        {children}
      </motion.div>
    </>
  )
}

