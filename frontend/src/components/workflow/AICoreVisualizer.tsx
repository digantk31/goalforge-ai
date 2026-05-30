import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Cpu } from 'lucide-react'

interface AICoreVisualizerProps {
  activeStepName: string | null
  isComplete: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  pulseSpeed: number
  pulseDir: number
}

interface Pulse {
  x: number
  y: number
  maxRadius: number
  currentRadius: number
  speed: number
  color: string
}

export function AICoreVisualizer({ activeStepName, isComplete }: AICoreVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeStepRef = useRef<string | null>(null)

  // Track active step to trigger bursts on change
  useEffect(() => {
    activeStepRef.current = activeStepName
  }, [activeStepName])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    // Handle resize
    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    // Particle settings
    const particles: Particle[] = []
    const particleCount = 45
    const connectionDistance = 90
    const pulses: Pulse[] = []

    // Helper to generate particle
    const createParticle = (x?: number, y?: number, speedScale = 1): Particle => {
      const angle = Math.random() * Math.PI * 2
      const speed = (0.2 + Math.random() * 0.4) * speedScale
      return {
        x: x !== undefined ? x : Math.random() * width,
        y: y !== undefined ? y : Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2.5,
        color: Math.random() > 0.4 ? '#8b5cf6' : '#10b981', // Brand purple or emerald green
        alpha: 0.3 + Math.random() * 0.5,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        pulseDir: Math.random() > 0.5 ? 1 : -1,
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle())
    }

    // Trigger a pulse / burst when the active step changes
    const triggerStepBurst = () => {
      const centerX = width / 2
      const centerY = height / 2

      // Create a visual expanding circle pulse
      pulses.push({
        x: centerX,
        y: centerY,
        maxRadius: Math.max(width, height) * 0.6,
        currentRadius: 0,
        speed: 4 + Math.random() * 2,
        color: activeStepName ? '#8b5cf6' : '#10b981',
      })

      // Spawn rapid burst particles shooting outwards
      for (let i = 0; i < 15; i++) {
        const p = createParticle(centerX, centerY, 3.5)
        // Make burst particles brighter
        p.alpha = 1.0
        particles.push(p)
      }

      // Keep particle array size stable by removing old ones
      if (particles.length > 80) {
        particles.splice(0, particles.length - 80)
      }
    }

    // Watch for step changes to trigger bursts
    let lastStep = activeStepRef.current
    const stepChecker = setInterval(() => {
      if (activeStepRef.current !== lastStep) {
        lastStep = activeStepRef.current
        triggerStepBurst()
      }
    }, 100)

    // Initial burst
    triggerStepBurst()

    // Quantum core rotation state
    let coreAngle = 0

    // Animation Loop
    const draw = () => {
      if (!ctx || !canvas) return
      
      // Clear canvas with trace transparency for a sci-fi motion blur
      ctx.fillStyle = 'rgba(10, 10, 10, 0.22)'
      ctx.fillRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2

      // 1. Draw Expanding Pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i]
        pulse.currentRadius += pulse.speed
        
        const progress = pulse.currentRadius / pulse.maxRadius
        const alpha = 1 - progress

        if (alpha <= 0) {
          pulses.splice(i, 1)
          continue
        }

        ctx.strokeStyle = pulse.color
        ctx.globalAlpha = alpha * 0.15
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(pulse.x, pulse.y, pulse.currentRadius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1.0 // Reset
      }

      // 2. Draw Connections (Lines)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.25
            ctx.strokeStyle = particles[i].color === '#8b5cf6' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)'
            ctx.globalAlpha = alpha
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
            ctx.globalAlpha = 1.0 // Reset
          }
        }
      }

      // 3. Draw and Update Particles
      particles.forEach((p) => {
        // Move particle
        p.x += p.vx
        p.y += p.vy

        // Bounce on boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Pulse alpha
        p.alpha += p.pulseSpeed * p.pulseDir
        if (p.alpha > 0.95 || p.alpha < 0.2) p.pulseDir *= -1

        // Draw particle
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0.1, Math.min(1.0, p.alpha))
        ctx.shadowBlur = 10
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.globalAlpha = 1.0 // Reset
        ctx.shadowBlur = 0 // Reset shadow
      })

      // 4. Draw Rotating Quantum Core in Center
      coreAngle += isComplete ? 0.005 : 0.015

      // Layer 1: Outermost glowing circle
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(coreAngle)
      
      const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 55)
      grad.addColorStop(0, 'rgba(139, 92, 246, 0.25)') // Brand Purple
      grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.08)') // Green
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(0, 0, 55, 0, Math.PI * 2)
      ctx.fill()

      // Layer 2: Dashed Tech Ring
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.45)'
      ctx.lineWidth = 1.2
      ctx.setLineDash([8, 12])
      ctx.beginPath()
      ctx.arc(0, 0, 38, 0, Math.PI * 2)
      ctx.stroke()

      // Layer 3: Opposite rotating inner ring
      ctx.rotate(-coreAngle * 2.2)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)'
      ctx.setLineDash([4, 6])
      ctx.beginPath()
      ctx.arc(0, 0, 24, 0, Math.PI * 2)
      ctx.stroke()
      
      ctx.restore()

      // Layer 4: Solid glowing consciousness center orb
      const coreSize = 10 + Math.sin(coreAngle * 3) * 1.5
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, coreSize)
      coreGrad.addColorStop(0, '#ffffff')
      coreGrad.addColorStop(0.3, '#c084fc') // Bright Purple
      coreGrad.addColorStop(0.7, '#8b5cf6')
      coreGrad.addColorStop(1, 'rgba(139, 92, 246, 0)')

      ctx.fillStyle = coreGrad
      ctx.shadowBlur = 25
      ctx.shadowColor = '#8b5cf6'
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0 // Reset

      // Request next frame
      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      clearInterval(stepChecker)
    }
  }, [activeStepName, isComplete])

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-[#0a0a0a] border border-zinc-800/40 flex flex-col items-center justify-center p-6">
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-cyber-grid opacity-15 pointer-events-none" />
      
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Visual Overlay Labels */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between items-center text-center select-none pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 backdrop-blur-md text-[10px] font-bold text-brand-400 tracking-widest uppercase">
          <Cpu className="w-3.5 h-3.5 animate-pulse text-brand-400" />
          Quantum AI Core
        </div>

        <div className="space-y-2 mt-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStepName || 'thinking'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="inline-flex items-center gap-2 text-zinc-200 text-sm font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-brand-400 animate-spin-slow" />
                {activeStepName ? (
                  <span>Executing: <span className="text-brand-300">{activeStepName}</span></span>
                ) : (
                  <span>Decomposing & Mapping...</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 font-mono tracking-wider max-w-xs uppercase">
                {activeStepName ? 'Streaming semantic logic gates' : 'Establishing multi-agent pipeline'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
