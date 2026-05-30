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
  source: 'core' | string
  target: 'core' | string
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

// 3D Wireframe Vector interface
interface Vector3D {
  x: number
  y: number
  z: number
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

    // 2. Define 3D Tesseract Vertices (Hypercube Projection)
    // A Tesseract consists of 16 vertices: an outer 3D cube and an inner 3D cube
    const outerCubeVertices: Vector3D[] = [
      { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 },  { x: 1, y: -1, z: 1 },  { x: 1, y: 1, z: 1 },  { x: -1, y: 1, z: 1 }
    ]
    const innerCubeVertices: Vector3D[] = outerCubeVertices.map(v => ({ x: v.x * 0.5, y: v.y * 0.5, z: v.z * 0.5 }))
    
    const cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back face edges
      [4, 5], [5, 6], [6, 7], [7, 4], // Front face edges
      [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting pillars
    ]

    const dataPackets: DataPacket[] = []
    const waves: TelemetryWave[] = []
    let coreAngle = 0
    let rotX = 0
    let rotY = 0

    // Helper to calculate Bezier point
    const getBezierPoint = (t: number, p0: number, p1: number, p2: number) => {
      return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2
    }

    // Helper to spawn curved data pipeline between two points dynamically
    const spawnDataPipeline = (source: 'core' | string, target: 'core' | string, color: string) => {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          dataPackets.push({
            source,
            target,
            progress: 0,
            speed: 0.012 + Math.random() * 0.008,
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
      coreAngle += isSynthesizing ? 0.012 : 0.004

      // 3. Draw Subtle Holographic Digital Concentric Coordinate Rings
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.04)'
      ctx.lineWidth = 1
      ctx.setLineDash([0])
      
      const dynamicRadius = isSynthesizing 
        ? Math.max(340, Math.min(width, height) * 0.38) 
        : 110
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, dynamicRadius * 0.5, 0, Math.PI * 2)
      ctx.stroke()
      
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.03)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, dynamicRadius, 0, Math.PI * 2)
      ctx.stroke()

      // 4. Update & Position Agent Nodes in a Beautiful Orbit
      agents.forEach((agent, index) => {
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
          agent.isActive = true // All agents activated during report synthesis
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

      // 5. Update & Draw curved data packets sliding along live, elastic Bezier pathways
      const getAgentCoords = (name: 'core' | string) => {
        if (name === 'core') return { x: centerX, y: centerY }
        const agent = agents.find(a => a.name === name)
        return agent ? { x: agent.x, y: agent.y } : { x: centerX, y: centerY }
      }

      for (let i = dataPackets.length - 1; i >= 0; i--) {
        const packet = dataPackets[i]
        packet.progress += packet.speed

        const start = getAgentCoords(packet.source)
        const end = getAgentCoords(packet.target)

        if (packet.progress >= 1) {
          waves.push({
            x: end.x,
            y: end.y,
            radius: 4,
            maxRadius: 28,
            color: packet.color,
            alpha: 0.6,
          })
          dataPackets.splice(i, 1)
          continue
        }

        // Calculate live control point that moves dynamically with the agents!
        const midX = (start.x + end.x) / 2
        const midY = (start.y + end.y) / 2
        const angle = Math.atan2(end.y - start.y, end.x - start.x)
        const offset = 55 + (i % 3) * 15
        const controlX = midX + Math.cos(angle + Math.PI / 2) * offset
        const controlY = midY + Math.sin(angle + Math.PI / 2) * offset

        const px = getBezierPoint(packet.progress, start.x, controlX, end.x)
        const py = getBezierPoint(packet.progress, start.y, controlY, end.y)

        // Draw live curved pipeline trail
        ctx.strokeStyle = packet.color
        ctx.lineWidth = 1.0
        ctx.globalAlpha = (1 - packet.progress) * 0.18
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.quadraticCurveTo(controlX, controlY, end.x, end.y)
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

      // 6. Update & Draw Telemetry Ripple Waves
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

      // 7. Spawn Dynamic Connection Pipelines (Sequentially Orchestrated)
      const pipelineInterval = isSynthesizing ? 0.05 : 0.005
      if (Math.random() < pipelineInterval && agents.length > 1) {
        const active = agents.filter(a => a.isActive)
        const sourceAgent = active.length > 0 ? active[Math.random() * active.length | 0] : agents[Math.random() * agents.length | 0]
        
        if (Math.random() > 0.45) {
          // Connect Agent -> Core
          spawnDataPipeline(sourceAgent.name, 'core', sourceAgent.color)
        } else {
          // Connect Core -> Agent
          spawnDataPipeline('core', sourceAgent.name, '#c084fc')
        }
      }

      // 8. Draw Central Orchestrator Core (Representing Gemini)
      // 3D PERSPECTIVE PROJECTION OF THE ROTATING TESSERACT (HYPERCUBE)
      rotX += isComplete ? 0.003 : isSynthesizing ? 0.038 : 0.008
      rotY += isComplete ? 0.004 : isSynthesizing ? 0.046 : 0.010

      const tesseractScale = isComplete 
        ? 12 
        : isSynthesizing 
          ? Math.max(38, Math.min(width, height) * 0.05) 
          : 18

      // Projection function: takes a 3D vector, applies X/Y rotations, and projects onto 2D canvas
      const project3D = (v: Vector3D, scale: number) => {
        let x = v.x
        let y = v.y
        let z = v.z

        // Rotate Y axis
        const cosY = Math.cos(rotY)
        const sinY = Math.sin(rotY)
        const x1 = x * cosY - z * sinY
        const z1 = x * sinY + z * cosY

        // Rotate X axis
        const cosX = Math.cos(rotX)
        const sinX = Math.sin(rotX)
        const y2 = y * cosX - z1 * sinX
        const z2 = y * sinX + z1 * cosX

        // Perspective projection factor
        const distance = 3
        const zoom = scale * (distance / (distance + z2))

        return {
          x: centerX + x1 * zoom,
          y: centerY + y2 * zoom
        }
      }

      // Project all 16 tesseract vertices (8 outer cube, 8 inner cube)
      const projectedOuter = outerCubeVertices.map(v => project3D(v, tesseractScale))
      const projectedInner = innerCubeVertices.map(v => project3D(v, tesseractScale))

      // Radial Core Glow
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, tesseractScale * 2.2)
      coreGrad.addColorStop(0, 'rgba(139, 92, 246, 0.28)')
      coreGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.08)')
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.save()
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(centerX, centerY, tesseractScale * 2.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Render Tesseract wireframe edges
      ctx.save()
      ctx.shadowBlur = isSynthesizing ? 15 : 6
      
      // Draw outer cube edges (glowing Purple)
      ctx.strokeStyle = '#c084fc'
      ctx.shadowColor = '#8b5cf6'
      ctx.lineWidth = isSynthesizing ? 1.5 : 1.0
      cubeEdges.forEach(([from, to]) => {
        ctx.beginPath()
        ctx.moveTo(projectedOuter[from].x, projectedOuter[from].y)
        ctx.lineTo(projectedOuter[to].x, projectedOuter[to].y)
        ctx.stroke()
      })

      // Draw inner cube edges (glowing Emerald/Cyan)
      ctx.strokeStyle = '#34d399'
      ctx.shadowColor = '#10b981'
      ctx.lineWidth = isSynthesizing ? 1.2 : 0.8
      cubeEdges.forEach(([from, to]) => {
        ctx.beginPath()
        ctx.moveTo(projectedInner[from].x, projectedInner[from].y)
        ctx.lineTo(projectedInner[to].x, projectedInner[to].y)
        ctx.stroke()
      })

      // Draw tesseract connecting hyper-pillars (between corresponding outer & inner vertices)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
      ctx.shadowColor = '#ffffff'
      ctx.lineWidth = 0.6
      for (let i = 0; i < 8; i++) {
        ctx.beginPath()
        ctx.moveTo(projectedOuter[i].x, projectedOuter[i].y)
        ctx.lineTo(projectedInner[i].x, projectedInner[i].y)
        ctx.stroke()
      }
      ctx.restore()

      // Rotating compass ticks around tesseract
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(coreAngle * 0.4)
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)'
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.arc(0, 0, tesseractScale * 2.8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // 9. Render the Floating Agent Nodes (The Swarm)
      agents.forEach((agent) => {
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

        // Typography labels
        ctx.fillStyle = agent.isActive ? '#ffffff' : '#71717a'
        ctx.font = agent.isActive ? 'bold 11px monospace' : '10px monospace'
        ctx.textAlign = 'center'
        ctx.shadowBlur = agent.isActive ? 5 : 0
        ctx.shadowColor = agent.color
        ctx.fillText(agent.label, agent.x, agent.y - 24)
        
        ctx.fillStyle = agent.isActive ? agent.color : '#3f3f46'
        ctx.font = '8px monospace'
        ctx.fillText(agent.isActive ? '● ACTIVE' : '○ STANDBY', agent.x, agent.y + 26)
        ctx.shadowBlur = 0
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
      <div className="absolute inset-0 bg-cyber-grid opacity-15 pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 w-full h-full flex flex-col justify-between items-center text-center select-none pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 backdrop-blur-md text-[10px] font-bold text-brand-400 tracking-widest uppercase">
          <Cpu className="w-3.5 h-3.5 animate-pulse text-brand-400" />
          Quantum Swarm Orchestrator
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
                  ? 'Compiling multi-dimensional data' 
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
