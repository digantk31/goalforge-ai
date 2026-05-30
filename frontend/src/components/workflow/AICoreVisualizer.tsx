import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Cpu, Loader2 } from 'lucide-react'

interface AICoreVisualizerProps {
  activeStepName: string | null
  isComplete: boolean
  isSynthesizing?: boolean
}

interface AgentNode {
  name: string
  label: string
  color: string
  glowColor: string
  angle: number // Orbit angle
  radius: number // Orbit radius
  x: number
  y: number
  pulse: number
  pulseDir: number
  isActive: boolean
}

interface DataPacket {
  startX: number
  startY: number
  controlX: number
  controlY: number
  endX: number
  endY: number
  progress: number
  speed: number
  color: string
  size: number
}

interface TelemetryWave {
  x: number
  y: number
  radius: number
  maxRadius: number
  color: string
  alpha: number
}

export function AICoreVisualizer({ activeStepName, isComplete, isSynthesizing = false }: AICoreVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeStepRef = useRef<string | null>(null)

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

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    // 1. Define 5 Specialized Agent Nodes in Orbit
    const agents: AgentNode[] = [
      { name: 'planner', label: 'Planner Agent', color: '#a78bfa', glowColor: 'rgba(139, 92, 246, 0.45)', angle: 0, radius: 160, x: 0, y: 0, pulse: 0.5, pulseDir: 1, isActive: false },
      { name: 'research', label: 'Research Agent', color: '#22d3ee', glowColor: 'rgba(6, 182, 212, 0.45)', angle: (Math.PI * 2) / 5, radius: 160, x: 0, y: 0, pulse: 0.3, pulseDir: -1, isActive: false },
      { name: 'worker', label: 'Worker Agent', color: '#fbbf24', glowColor: 'rgba(245, 158, 11, 0.45)', angle: ((Math.PI * 2) / 5) * 2, radius: 160, x: 0, y: 0, pulse: 0.7, pulseDir: 1, isActive: false },
      { name: 'auditor', label: 'QA Auditor Agent', color: '#f87171', glowColor: 'rgba(239, 68, 68, 0.45)', angle: ((Math.PI * 2) / 5) * 3, radius: 160, x: 0, y: 0, pulse: 0.4, pulseDir: -1, isActive: false },
      { name: 'report', label: 'Report Agent', color: '#34d399', glowColor: 'rgba(16, 185, 129, 0.45)', angle: ((Math.PI * 2) / 5) * 4, radius: 160, x: 0, y: 0, pulse: 0.6, pulseDir: 1, isActive: false },
    ]

    const dataPackets: DataPacket[] = []
    const waves: TelemetryWave[] = []
    let coreAngle = 0

    // Helper to calculate Bezier point
    const getBezierPoint = (t: number, p0: number, p1: number, p2: number) => {
      return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2
    }

    // Helper to spawn curved data pipeline between two points
    const spawnDataPipeline = (x1: number, y1: number, x2: number, y2: number, color: string) => {
      // Calculate curved control point in the middle
      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const offset = 60 + Math.random() * 40
      const controlX = midX + Math.cos(angle + Math.PI / 2) * offset
      const controlY = midY + Math.sin(angle + Math.PI / 2) * offset

      // Spawn 6 sequential glowing packets
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          dataPackets.push({
            startX: x1,
            startY: y1,
            controlX,
            controlY,
            endX: x2,
            endY: y2,
            progress: 0,
            speed: 0.015 + Math.random() * 0.01,
            color,
            size: 2.2 + Math.random() * 1.5,
          })
        }, i * 180)
      }
    }

    // Main animation draw loop
    const draw = () => {
      if (!ctx || !canvas) return

      // Cyberpunk dark space bg
      ctx.fillStyle = '#060606'
      ctx.fillRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2

      // Slowly rotate the entire multi-agent orbit
      coreAngle += isSynthesizing ? 0.015 : 0.005

      // 2. Draw Subtle Holographic Digital Concentric Coordinate Rings
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)'
      ctx.lineWidth = 1
      ctx.setLineDash([0])
      
      const dynamicRadius = isSynthesizing 
        ? Math.max(340, Math.min(width, height) * 0.38) 
        : 110
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, dynamicRadius * 0.5, 0, Math.PI * 2)
      ctx.stroke()
      
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, dynamicRadius, 0, Math.PI * 2)
      ctx.stroke()

      // 3. Update & Position Agent Nodes in a Beautiful Orbit
      agents.forEach((agent, index) => {
        // Orbit calculation with gentle floating bobbing and dynamic responsive radius
        const currentAngle = agent.angle + coreAngle * 0.5
        const bob = Math.sin(coreAngle * 3 + index) * 6
        agent.x = centerX + Math.cos(currentAngle) * dynamicRadius
        agent.y = centerY + Math.sin(currentAngle) * dynamicRadius + bob

        // Pulse logic
        agent.pulse += 0.015 * agent.pulseDir
        if (agent.pulse > 1.0 || agent.pulse < 0.2) agent.pulseDir *= -1

        // Map step execution status to Agent active highlights
        const step = (activeStepName || '').toLowerCase()
        if (isSynthesizing) {
          agent.isActive = true // All agents super-activated during synthesis vortex compiling!
        } else if (activeStepName) {
          if (agent.name === 'planner' && (step.includes('plan') || step.includes('analyze'))) agent.isActive = true
          else if (agent.name === 'research' && (step.includes('research') || step.includes('gather') || step.includes('data'))) agent.isActive = true
          else if (agent.name === 'worker' && (step.includes('execute') || step.includes('task') || step.includes('core'))) agent.isActive = true
          else if (agent.name === 'auditor' && (step.includes('review') || step.includes('finalize') || step.includes('evaluation'))) agent.isActive = true
          else if (agent.name === 'report' && (step.includes('report') || step.includes('generate'))) agent.isActive = true
          else agent.isActive = false
        } else {
          agent.isActive = false
        }
      })

      // 4. Update & Draw curved data packets sliding along Bezier pathways
      for (let i = dataPackets.length - 1; i >= 0; i--) {
        const packet = dataPackets[i]
        packet.progress += packet.speed

        if (packet.progress >= 1) {
          // Trigger a beautiful glowing ripple wave at end point
          waves.push({
            x: packet.endX,
            y: packet.endY,
            radius: 4,
            maxRadius: 28,
            color: packet.color,
            alpha: 0.6,
          })
          dataPackets.splice(i, 1)
          continue
        }

        // Calculate current x,y along the Bezier curve
        const px = getBezierPoint(packet.progress, packet.startX, packet.controlX, packet.endX)
        const py = getBezierPoint(packet.progress, packet.startY, packet.controlY, packet.endY)

        // Draw curved faint pipeline trail
        ctx.strokeStyle = packet.color
        ctx.lineWidth = 1.0
        ctx.globalAlpha = (1 - packet.progress) * 0.18
        ctx.beginPath()
        ctx.moveTo(packet.startX, packet.startY)
        ctx.quadraticCurveTo(packet.controlX, packet.controlY, packet.endX, packet.endY)
        ctx.stroke()

        // Draw glowing data particle
        ctx.save()
        ctx.fillStyle = '#ffffff'
        ctx.shadowBlur = 12
        ctx.shadowColor = packet.color
        ctx.beginPath()
        ctx.arc(px, py, packet.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        ctx.globalAlpha = 1.0
      }

      // 5. Update & Draw Telemetry Ripple Waves
      for (let i = waves.length - 1; i >= 0; i--) {
        const wave = waves[i]
        wave.radius += isSynthesizing ? 1.4 : 0.8
        wave.alpha = 1 - wave.radius / wave.maxRadius

        if (wave.alpha <= 0) {
          waves.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.strokeStyle = wave.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = wave.alpha * 0.5
        ctx.beginPath()
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      // 6. Spawn Dynamic Connection Pipelines (Sequentially Orchestrated)
      // High frequency during synthesis, standard during normal runs
      const pipelineInterval = isSynthesizing ? 0.04 : 0.005
      if (Math.random() < pipelineInterval && agents.length > 1) {
        // Find active agent or random agent
        const active = agents.filter(a => a.isActive)
        const sourceAgent = active.length > 0 ? active[Math.random() * active.length | 0] : agents[Math.random() * agents.length | 0]
        
        // Connect to center core OR to another random agent node
        if (Math.random() > 0.4) {
          // Connect Agent -> Core
          spawnDataPipeline(sourceAgent.x, sourceAgent.y, centerX, centerY, sourceAgent.color)
        } else {
          // Connect Core -> Agent
          spawnDataPipeline(centerX, centerY, sourceAgent.x, sourceAgent.y, '#c084fc')
        }
      }

      // 7. Draw Central Orchestrator Core (Representing Gemini)
      // Inner glowing core
      const coreSize = isSynthesizing 
        ? 15 + Math.sin(coreAngle * 4.5) * 3.5 
        : 11 + Math.sin(coreAngle * 2) * 1.5

      const coreGrad = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, coreSize + 25)
      coreGrad.addColorStop(0, '#ffffff')
      coreGrad.addColorStop(0.2, '#c084fc')
      coreGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.25)')
      coreGrad.addColorStop(1, 'rgba(139, 92, 246, 0)')

      ctx.save()
      ctx.fillStyle = coreGrad
      ctx.shadowBlur = 30
      ctx.shadowColor = '#8b5cf6'
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreSize + 25, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Concentric rotating dashboard orbits in the center
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(coreAngle)
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.45)'
      ctx.lineWidth = 1.2
      ctx.setLineDash([6, 10])
      ctx.beginPath()
      ctx.arc(0, 0, 42, 0, Math.PI * 2)
      ctx.stroke()

      ctx.rotate(-coreAngle * 2)
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)'
      ctx.setLineDash([4, 6])
      ctx.beginPath()
      ctx.arc(0, 0, 26, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // 8. Render the Floating Agent Nodes (The Swarm)
      agents.forEach((agent) => {
        // Draw orbital dotted connecting lines back to core
        ctx.save()
        ctx.strokeStyle = agent.isActive ? agent.color : 'rgba(255, 255, 255, 0.04)'
        ctx.lineWidth = agent.isActive ? 1.2 : 0.8
        ctx.setLineDash([4, 8])
        ctx.globalAlpha = agent.isActive ? 0.35 : 0.8
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(agent.x, agent.y)
        ctx.stroke()
        ctx.restore()

        // Outer pulsing ring
        ctx.save()
        ctx.strokeStyle = agent.isActive ? agent.color : 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = agent.isActive ? 2.0 : 1.0
        ctx.shadowBlur = agent.isActive ? 18 : 0
        ctx.shadowColor = agent.color
        ctx.beginPath()
        ctx.arc(agent.x, agent.y, 14 + (agent.isActive ? agent.pulse * 5 : 0), 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        // Solid inner node
        ctx.save()
        ctx.fillStyle = agent.isActive ? agent.color : '#161616'
        ctx.strokeStyle = agent.isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1.5
        ctx.shadowBlur = agent.isActive ? 10 : 0
        ctx.shadowColor = agent.color
        ctx.beginPath()
        ctx.arc(agent.x, agent.y, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        // Typography labels with premium cyberpunk indicators
        ctx.fillStyle = agent.isActive ? '#ffffff' : '#71717a'
        ctx.font = agent.isActive ? 'bold 11px monospace' : '10px monospace'
        ctx.textAlign = 'center'
        ctx.shadowBlur = agent.isActive ? 5 : 0
        ctx.shadowColor = agent.color
        ctx.fillText(agent.label, agent.x, agent.y - 24)
        
        ctx.fillStyle = agent.isActive ? agent.color : '#3f3f46'
        ctx.font = '8px monospace'
        ctx.fillText(agent.isActive ? '● ACTIVE' : '○ STANDBY', agent.x, agent.y + 26)
        ctx.shadowBlur = 0 // Reset
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [activeStepName, isComplete, isSynthesizing])

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-[#060606] border border-zinc-900 flex flex-col items-center justify-center p-6 shadow-inner">
      {/* Interactive Cyber grid */}
      <div className="absolute inset-0 bg-cyber-grid opacity-15 pointer-events-none" />
      
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Visual Overlay Labels */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between items-center text-center select-none pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 backdrop-blur-md text-[10px] font-bold text-brand-400 tracking-widest uppercase">
          <Cpu className="w-3.5 h-3.5 animate-pulse text-brand-400" />
          Multi-Agent Swarm Orchestration
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
                      <span>Active Pipeline: <span className="text-brand-300">{activeStepName}</span></span>
                    ) : (
                      <span>Establishing Multi-Agent Graph...</span>
                    )}
                  </>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 font-mono tracking-wider max-w-xs uppercase">
                {isSynthesizing 
                  ? 'Compiling multi-agent report' 
                  : activeStepName 
                    ? 'Synchronizing neural weights' 
                    : 'Awaiting autonomous planning'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
