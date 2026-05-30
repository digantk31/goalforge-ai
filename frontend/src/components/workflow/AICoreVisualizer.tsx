import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Cpu, Loader2 } from 'lucide-react'

interface AICoreVisualizerProps {
  activeStepName: string | null
  isComplete: boolean
  isSynthesizing?: boolean
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

interface SynapticSpark {
  startX: number
  startY: number
  endX: number
  endY: number
  progress: number
  speed: number
  color: string
}

export function AICoreVisualizer({ activeStepName, isComplete, isSynthesizing = false }: AICoreVisualizerProps) {
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

    // Particle & Synaptic settings
    const particles: Particle[] = []
    const particleCount = isSynthesizing ? 65 : 45 // More particles during synthesis
    const connectionDistance = 100
    const pulses: Pulse[] = []
    const sparks: SynapticSpark[] = []

    // Helper to generate particle
    const createParticle = (x?: number, y?: number, speedScale = 1): Particle => {
      const angle = Math.random() * Math.PI * 2
      const speed = (0.25 + Math.random() * 0.45) * speedScale
      return {
        x: x !== undefined ? x : Math.random() * width,
        y: y !== undefined ? y : Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2.8,
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

      // Create expanding telemetry pulse
      pulses.push({
        x: centerX,
        y: centerY,
        maxRadius: Math.max(width, height) * 0.65,
        currentRadius: 0,
        speed: 5 + Math.random() * 2,
        color: activeStepName ? '#8b5cf6' : '#10b981',
      })

      // Spawn burst particles
      const count = isSynthesizing ? 25 : 15
      for (let i = 0; i < count; i++) {
        const p = createParticle(centerX, centerY, isSynthesizing ? 4.5 : 3.5)
        p.alpha = 1.0
        particles.push(p)
      }

      // Cap particles limit to prevent slowdown
      const limit = isSynthesizing ? 120 : 80
      if (particles.length > limit) {
        particles.splice(0, particles.length - limit)
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
      
      // Clear canvas with trail blur for motion trail effect
      ctx.fillStyle = 'rgba(6, 6, 6, 0.25)'
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
        ctx.globalAlpha = alpha * 0.2
        ctx.lineWidth = 1.8
        ctx.beginPath()
        ctx.arc(pulse.x, pulse.y, pulse.currentRadius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1.0 // Reset
      }

      // 2. Draw Connections (Lines) & Spawn Synaptic Sparks
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.26
            ctx.strokeStyle = particles[i].color === '#8b5cf6' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)'
            ctx.globalAlpha = alpha
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
            ctx.globalAlpha = 1.0 // Reset

            // ⚡ Randomly spawn electrical synaptic sparks moving along lines
            const spawnChance = isSynthesizing ? 0.025 : 0.007
            const maxSparks = isSynthesizing ? 45 : 20
            if (Math.random() < spawnChance && sparks.length < maxSparks) {
              sparks.push({
                startX: particles[i].x,
                startY: particles[i].y,
                endX: particles[j].x,
                endY: particles[j].y,
                progress: 0,
                speed: 0.015 + Math.random() * 0.035,
                color: particles[i].color === '#8b5cf6' ? '#c084fc' : '#34d399', // Bright glowing colors
              })
            }
          }
        }
      }

      // 3. Draw & Update Synaptic Sparks (Electrical impulses)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i]
        spark.progress += spark.speed

        if (spark.progress >= 1) {
          sparks.splice(i, 1)
          continue
        }

        const x = spark.startX + (spark.endX - spark.startX) * spark.progress
        const y = spark.startY + (spark.endY - spark.startY) * spark.progress

        // Draw electrical spark trail
        ctx.save()
        ctx.fillStyle = '#ffffff'
        ctx.shadowBlur = 12
        ctx.shadowColor = spark.color
        ctx.beginPath()
        ctx.arc(x, y, 2.4, 0, Math.PI * 2)
        ctx.fill()

        // Tiny electrical pulse tail
        ctx.strokeStyle = spark.color
        ctx.globalAlpha = (1 - spark.progress) * 0.4
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(spark.startX, spark.startY)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.restore()
      }

      // 4. Draw and Update Particles & Cyber data labels
      particles.forEach((p, idx) => {
        // Apply gravitational pull / swirl effect during synthesis (creating a visual black hole vortex)
        if (isSynthesizing) {
          const dx = centerX - p.x
          const dy = centerY - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 10) {
            const pullForce = 0.05
            const spiralForce = 0.04
            p.vx += (dx / dist) * pullForce + (dy / dist) * spiralForce
            p.vy += (dy / dist) * pullForce - (dx / dist) * spiralForce
          }
          
          // Cap speeds
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
          if (speed > 3.8) {
            p.vx = (p.vx / speed) * 3.8
            p.vy = (p.vy / speed) * 3.8
          }
        }

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
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw floating cyber data texts next to some particles (adds ultra-realistic AI complexity)
        if (idx % 6 === 0 && p.alpha > 0.55) {
          const labels = ['0x8F', 'NODE_OK', 'LOGIC_GATE', 'GEMINI_CORE', '0xFF', 'TOKEN_STREAM', 'VIRTUAL_CPU', 'SYNAPSE_A1', 'METRIC_DB']
          const label = labels[idx % labels.length]
          ctx.fillStyle = 'rgba(255, 255, 255, 0.32)'
          ctx.font = '8px monospace'
          ctx.fillText(label, p.x + 8, p.y + 3)
        }

        ctx.globalAlpha = 1.0 // Reset
        ctx.shadowBlur = 0 // Reset shadow
      })

      // 5. Draw Rotating Quantum Core & HUD compass in Center
      coreAngle += isComplete ? 0.005 : isSynthesizing ? 0.065 : 0.015

      // Complex holographic HUD coordinate ticks (highly professional AI look)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(-coreAngle * 0.4)
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)'
      ctx.lineWidth = 0.8
      
      // Thin coordinate compass rings
      ctx.beginPath()
      ctx.arc(0, 0, 75, 0, Math.PI * 2)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(-82, 0)
      ctx.lineTo(-72, 0)
      ctx.moveTo(72, 0)
      ctx.lineTo(82, 0)
      ctx.moveTo(0, -82)
      ctx.lineTo(0, -72)
      ctx.moveTo(0, 72)
      ctx.lineTo(0, 82)
      ctx.stroke()
      ctx.restore()

      // Core circles
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
      const coreSize = isSynthesizing 
        ? 14 + Math.sin(coreAngle * 4.5) * 3.0 
        : 10 + Math.sin(coreAngle * 3) * 1.5
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
  }, [activeStepName, isComplete, isSynthesizing])

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-[#060606] border border-zinc-900 flex flex-col items-center justify-center p-6 shadow-inner">
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
              key={isSynthesizing ? 'synthesizing' : activeStepName || 'thinking'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="inline-flex items-center gap-2 text-zinc-200 text-sm font-semibold tracking-wide">
                {isSynthesizing ? (
                  <span className="text-emerald-400 flex items-center gap-2">
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Synthesizing AI Report...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-brand-400 animate-spin-slow" />
                    {activeStepName ? (
                      <span>Executing: <span className="text-brand-300">{activeStepName}</span></span>
                    ) : (
                      <span>Decomposing & Mapping...</span>
                    )}
                  </>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 font-mono tracking-wider max-w-xs uppercase">
                {isSynthesizing 
                  ? 'Compiling multi-agent report' 
                  : activeStepName 
                    ? 'Streaming semantic logic gates' 
                    : 'Establishing multi-agent pipeline'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
