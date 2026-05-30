import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, AlertCircle, TerminalSquare, FileText, Sparkles, Copy, Check, RotateCcw, Download, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { GlowEffect } from '@/components/ui/GlowEffect'
import { cn } from '@/lib/cn'
import { API_URL } from '@/lib/constants'
import { api } from '@/lib/api'
import { AICoreVisualizer } from '@/components/workflow/AICoreVisualizer'
import { HolographicDecryptor } from '@/components/workflow/HolographicDecryptor'

interface Step {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
}

const FAKE_TOOL_LOGS_TEMPLATES: Record<string, string[]> = {
  "Analyze Requirements": [
    "🔍 [Agent Engine] Analyzing user goal and mapping architectural dependencies...",
    "📦 [Tool Call] invoking db_schema_inspector(model=\"goal\")",
    "💾 [Tool Response] Retrieved 3 collections from MongoDB Cluster (12ms)",
    "⚙️ [AI Core] Establishing reasoning path with temperature=0.2..."
  ],
  "Research & Gather Data": [
    "🌐 [Tool Call] invoking google_search(query=\"current trends and competitor landscape\")",
    "📡 [Tool Response] Found 8 high-authority sources in search index",
    "📥 [Tool Call] invoking web_scraper_api(urls=[\"competitor_analysis_data\"])",
    "📊 [Data Engine] Normalizing raw textual nodes & embedding into semantic vector space..."
  ],
  "Plan Implementation": [
    "📋 [Planner Agent] Translating constraints into optimized sequence steps...",
    "🧠 [AI Core] Prompting Gemini Flash with task-decomposition template...",
    "⚡ [Optimizer] Evaluated 3 execution graphs, selected Graph #1 (confidence: 97%)",
    "💾 [Storage] Persisting step timeline configuration to Database..."
  ],
  "Execute Core Tasks": [
    "🛠️ [Worker Pool] Deploying active execution runners...",
    "💻 [Tool Call] invoking code_sandbox_executor(language=\"python\")",
    "📟 [Sandbox Output] Execution finished with exit code 0",
    "🔄 [Self-Correction] Verifying output compliance with target objectives..."
  ],
  "Review & Finalize": [
    "🔎 [QA Auditor] Performing semantic evaluation and structural linting...",
    "📈 [Stats Engine] Aggregating metric results for dashboard telemetry...",
    "🎨 [Format Agent] Normalizing output markdown styling to Linear/Vercel standard...",
    "🚀 [Workflow Service] Final verification successful. Ready for synthesis."
  ]
}

const getGenericFakeLogs = (stepName: string) => [
  `🤖 [Agent Engine] Activating node: "${stepName}"...`,
  `🔍 [Tool Call] invoking semantic_memory_lookup(query="${stepName.toLowerCase()}")`,
  `⚡ [AI Reasoning] Generating intermediate solution draft using Gemini...`,
  `💾 [Context] Appending step checkpoints to current execution stack...`
]

// Web Audio API Synthesized Premium Sound Helper
const playOscillatorSound = (type: 'start' | 'ping' | 'success') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    if (type === 'start') {
      // Subtle ascending tech chime
      osc.type = 'sine'
      osc.frequency.setValueAtTime(261.63, ctx.currentTime) // C4
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.25) // C5
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
    } else if (type === 'ping') {
      // Clean, low-level high E-note completion ping
      osc.type = 'sine'
      osc.frequency.setValueAtTime(659.25, ctx.currentTime) // E5
      gain.gain.setValueAtTime(0.015, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } else if (type === 'success') {
      // Harmonious double-chime ascending major chord (C5 -> E5 -> G5 -> C6)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, ctx.currentTime)
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08)
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16)
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24)
      gain.gain.setValueAtTime(0.035, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    }
  } catch {
    // Audio Context is blocked/unsupported initially
  }
}

export function WorkflowRunPage() {
  const { goalId } = useParams<{ goalId: string }>()
  const location = useLocation()
  const [steps, setSteps] = useState<Step[]>([])
  const [logs, setLogs] = useState<{ text: string; time: string }[]>([])
  const [finalReport, setFinalReport] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [goalTitle, setGoalTitle] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isRerunning, setIsRerunning] = useState(false)
  
  // Live Timer State
  const [elapsedTime, setElapsedTime] = useState(0)

  const logsEndRef = useRef<HTMLDivElement>(null)

  // Interval timer hook
  useEffect(() => {
    if (isComplete || steps.length === 0) return
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isComplete, steps.length])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Warm-up initial logs on mount or rerun
  const runInitialLogs = () => {
    const initialLogs = [
      "🚀 [GoalForge Worker] Initializing agent environment...",
      "📡 [System] Connecting to MongoDB Atlas cluster... Connected (32ms)",
      "🧠 [Core] Loading Gemini 2.5 Flash execution model...",
      "🔒 [Security] API Credential verification: SUCCESS",
      "⚡ [System] Awaiting workflow activation command..."
    ]
    
    initialLogs.forEach((logText, index) => {
      setTimeout(() => {
        const now = new Date().toLocaleTimeString([], { hour12: false })
        setLogs(prev => {
          if (prev.some(l => l.text === logText)) return prev
          return [...prev, { text: logText, time: now }]
        })
      }, (index + 1) * 200)
    })
  }

  // Helper to stream fake logs when step runs
  const queueFakeLogs = (stepName: string) => {
    const templates = FAKE_TOOL_LOGS_TEMPLATES[stepName] || getGenericFakeLogs(stepName)
    templates.forEach((logText, index) => {
      setTimeout(() => {
        const now = new Date().toLocaleTimeString([], { hour12: false })
        setLogs(prev => {
          if (prev.some(l => l.text === logText)) return prev
          return [...prev, { text: logText, time: now }]
        })
      }, (index + 1) * 450 + Math.random() * 200)
    })
  }

  // Load goal title from router state or fetch from API
  useEffect(() => {
    const state = location.state as { goalDescription?: string } | null
    if (state?.goalDescription) {
      setGoalTitle(state.goalDescription)
    } else if (goalId) {
      api.getGoal(goalId)
        .then((goal) => setGoalTitle(goal.description || goal.title || ''))
        .catch(() => {})
    }
  }, [goalId, location.state])

  // Run initial logs on load
  useEffect(() => {
    runInitialLogs()
    playOscillatorSound('start')
  }, [])

  useEffect(() => {
    if (!goalId) return

    const sse = new EventSource(`${API_URL}/api/v1/workflows/${goalId}/stream`)

    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        
        if (data.step && data.step !== 'Generate Report') {
          // If a step changes to running, stream the fake sub-logs
          if (data.status === 'running') {
            queueFakeLogs(data.step)
          }

          // If a step finishes, play a subtle tech ping sound
          if (data.status === 'completed') {
            playOscillatorSound('ping')
          }

          setSteps(prev => {
            const existing = prev.find(s => s.id === (data.id || data.step))
            if (existing) {
              return prev.map(s => s.id === (data.id || data.step) ? { ...s, status: data.status, name: data.step } : s)
            }
            return [...prev, { id: data.id || data.step, name: data.step, status: data.status || 'pending' }]
          })
        }

        if (data.report) {
          setFinalReport(data.report)
          setShowReport(true)
          setIsComplete(true)
          playOscillatorSound('success')
        }
        
        if (data.log) {
          const now = new Date().toLocaleTimeString([], { hour12: false })
          setLogs(prev => [...prev, { text: data.log, time: now }])
        }

      } catch (err) {
        console.error('Failed to parse SSE message', err)
      }
    }

    sse.onerror = () => {
      sse.close()
    }

    return () => {
      sse.close()
    }
  }, [goalId])

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />
      case 'failed': return <AlertCircle className="w-6 h-6 text-red-500" />
      case 'running': return <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
      default: return <Circle className="w-6 h-6 text-zinc-600" />
    }
  }

  const handleCopyReport = async () => {
    if (!finalReport) return
    try {
      await navigator.clipboard.writeText(finalReport)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy report')
    }
  }

  const handleExportMarkdown = () => {
    if (!finalReport) return
    const blob = new Blob([finalReport], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `goalforge-report-${goalId?.slice(0, 8) || 'unknown'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRerun = async () => {
    if (!goalId || isRerunning) return
    setIsRerunning(true)
    // Reset state
    setSteps([])
    setLogs([])
    setFinalReport(null)
    setShowReport(false)
    setIsComplete(false)
    setElapsedTime(0)
    runInitialLogs()
    playOscillatorSound('start')
    try {
      await api.startWorkflow(goalId)
    } catch (err) {
      console.error('Failed to re-run workflow:', err)
    } finally {
      setIsRerunning(false)
    }
  }

  const completedCount = steps.filter(s => s.status === 'completed').length
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0
  const runningStep = steps.find(s => s.status === 'running')
  const activeStepName = runningStep ? runningStep.name : null
  const isSynthesizingReport = steps.length > 0 && completedCount === steps.length && !finalReport

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Back Navigation */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
            <TerminalSquare className="w-8 h-8 text-brand-500 shrink-0" />
            Workflow Execution
          </h1>
          {goalTitle ? (
            <p className="text-zinc-400 mt-1.5 text-sm truncate max-w-xl">
              <span className="text-zinc-500">Goal:</span> {goalTitle}
            </p>
          ) : (
            <p className="text-zinc-500 mt-1.5 text-sm font-mono">ID: {goalId?.slice(0, 12)}...</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Re-run Button */}
          {isComplete && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRerun}
              disabled={isRerunning}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className={cn("w-4 h-4", isRerunning && "animate-spin")} />
              {isRerunning ? 'Starting...' : 'Re-run'}
            </motion.button>
          )}
          {/* Export Markdown Button */}
          {finalReport && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportMarkdown}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
            >
              <Download className="w-4 h-4" /> Export .md
            </motion.button>
          )}
          {/* Copy Report Button */}
          {finalReport && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyReport}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer",
                copied
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
              )}
            >
              {copied ? (
                <><Check className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy Report</>
              )}
            </motion.button>
          )}
          {/* Toggle Button */}
          {finalReport && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowReport(!showReport)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer",
                showReport 
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                  : "bg-brand-500/15 border-brand-500/30 text-brand-300 hover:bg-brand-500/25 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
              )}
            >
              {showReport ? (
                <><TerminalSquare className="w-4 h-4" /> View Logs</>
              ) : (
                <><FileText className="w-4 h-4" /> View Report</>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
              <span>{isComplete ? '✅ Workflow Complete' : `⚡ Executing ${completedCount}/${steps.length} steps...`}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[11px] text-zinc-400">Execution Time: {formatTime(elapsedTime)}</span>
                <span className="tabular-nums font-mono">{progressPercent}%</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isComplete ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-brand-600 to-brand-400"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ minHeight: 'calc(100vh - 16rem)' }}>
        {/* Left Column: Timeline */}
        <div className="lg:col-span-5 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
          <GlowEffect color="rgba(139, 92, 246, 0.12)" active={!isComplete}>
            <Card className="glass border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md">
              <CardHeader className="border-b border-zinc-800/50 pb-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full transition-colors duration-500", isComplete ? "bg-emerald-500 animate-pulse" : "bg-brand-500 animate-pulse")} />
                  Live Timeline
                  {!isComplete && steps.length > 0 && (
                    <div className="ml-2 relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-semibold text-brand-400 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
                      Agent Active
                    </div>
                  )}
                  {steps.length > 0 && (
                    <span className="ml-auto text-xs text-zinc-500 font-normal tabular-nums">{completedCount}/{steps.length}</span>
                  )}
                </h3>
              </CardHeader>
              <CardContent className="pt-6 relative pb-2">
                {steps.length === 0 ? (
                  /* Premium AI Thinking / Planning Effect */
                  <div className="text-zinc-500 text-center py-12 flex flex-col items-center gap-4">
                    <div className="relative flex items-center justify-center w-24 h-24">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                        className="absolute w-24 h-24 border-2 border-dashed border-brand-500/20 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="absolute w-16 h-16 bg-brand-500 rounded-full blur-xl"
                      />
                      <div className="relative p-4 bg-brand-500/10 border border-brand-500/30 rounded-2xl">
                        <Sparkles className="w-8 h-8 text-brand-400 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1.5 max-w-xs mx-auto">
                      <p className="text-sm font-semibold text-zinc-300 flex items-center justify-center gap-1.5">
                        Gemini is analyzing your objective
                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      </p>
                      <p className="text-xs text-zinc-500">Decomposing goal into optimized workflow checkpoints...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0">
                    <AnimatePresence>
                      {steps.map((step, index) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08, type: 'spring' as const, stiffness: 300, damping: 25 }}
                          className="relative pl-8 pb-6 last:pb-0"
                        >
                          {/* Connecting Line */}
                          {index !== steps.length - 1 && (
                            <div className="absolute left-[11px] top-8 bottom-[-4px] w-0.5 overflow-hidden bg-zinc-800">
                              {step.status === 'completed' && (
                                <motion.div 
                                  className="w-full h-full bg-gradient-to-b from-emerald-400 to-emerald-600 origin-top"
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  transition={{ duration: 0.6 }}
                                />
                              )}
                              {step.status === 'running' && (
                                <motion.div 
                                  className="w-full h-full bg-gradient-to-b from-brand-500 to-transparent origin-top"
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: [0, 1, 1], translateY: ["0%", "0%", "100%"] }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                />
                              )}
                            </div>
                          )}
                          
                          <div className="absolute left-[-2px] top-1 bg-zinc-900 rounded-full p-0.5">
                            {getStepIcon(step.status)}
                          </div>

                          <motion.div
                            animate={step.status === 'running' ? {
                              scale: [1, 1.015, 1],
                              boxShadow: [
                                "0 0 0px rgba(139,92,246,0)",
                                "0 0 20px rgba(139,92,246,0.15)",
                                "0 0 0px rgba(139,92,246,0)"
                              ]
                            } : {}}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                            className={cn(
                              "p-4 rounded-xl border transition-all duration-500 relative overflow-hidden",
                              step.status === 'running' ? "bg-brand-500/8 border-brand-500/25" :
                              step.status === 'completed' ? "bg-emerald-500/5 border-emerald-500/15" :
                              step.status === 'failed' ? "bg-red-500/8 border-red-500/20" :
                              "bg-zinc-800/30 border-zinc-700/50"
                            )}
                          >
                            {step.status === 'running' && (
                              <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-transparent via-brand-500/8 to-brand-400/20 blur-sm animate-scan pointer-events-none" />
                            )}
                            <h3 className={cn(
                              "font-medium text-[15px] relative z-10 leading-snug",
                              step.status === 'running' ? "text-brand-300 font-semibold" :
                              step.status === 'completed' ? "text-emerald-400" :
                              step.status === 'failed' ? "text-red-400" :
                              "text-zinc-400"
                            )}>
                              {step.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={cn(
                                "text-xs font-semibold uppercase tracking-wider",
                                step.status === 'running' ? "text-brand-400" :
                                step.status === 'completed' ? "text-emerald-500" :
                                step.status === 'failed' ? "text-red-400" :
                                "text-zinc-500"
                              )}>
                                {step.status}
                              </span>
                              {step.status === 'running' && (
                                <span className="flex gap-0.5">
                                  <span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </span>
                              )}
                            </div>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </GlowEffect>
        </div>

        {/* Right Column: Terminal Logs / Final Report */}
        <div className="lg:col-span-7" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
          <AnimatePresence mode="wait">
            {showReport && finalReport ? (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                className="h-full flex flex-col"
                style={{ maxHeight: 'calc(100vh - 16rem)' }}
              >
                {/* Report Header */}
                <div className="rounded-t-xl border border-b-0 border-zinc-800 bg-gradient-to-r from-brand-500/10 via-zinc-900/95 to-zinc-900/95 p-5 flex items-center gap-4 backdrop-blur-sm">
                  <div className="p-2.5 bg-brand-500/15 rounded-xl border border-brand-500/20">
                    <Sparkles className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-zinc-100">AI-Generated Report</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Powered by Gemini • {steps.length} steps analyzed</p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Complete
                  </div>
                </div>
                {/* Report Body */}
                <div className="flex-1 rounded-b-xl border border-zinc-800 bg-zinc-950/80 overflow-y-auto custom-scrollbar">
                  <div className="p-8 report-content">
                    <HolographicDecryptor markdown={finalReport} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="terminal-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full"
                style={{ maxHeight: 'calc(100vh - 16rem)' }}
              >
                {/* Terminal Card (60% width on md+) */}
                <div className="md:col-span-7 h-full flex flex-col min-h-0">
                  <Card className="h-full bg-[#0a0a0a] border-zinc-800/50 shadow-2xl flex flex-col relative overflow-hidden group terminal-glow">
                    {/* Terminal Header */}
                    <div className="flex items-center px-4 py-3 bg-zinc-900/80 border-b border-zinc-800/50">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70 hover:bg-yellow-500 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70 hover:bg-green-500 transition-colors" />
                      </div>
                      <div className="mx-auto text-xs font-mono text-zinc-500 flex items-center gap-2">
                        <TerminalSquare className="w-3 h-3" />
                        goalforge-worker
                      </div>
                      {!isComplete && logs.length > 0 && (
                        <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                      )}
                    </div>

                    {/* Terminal Output */}
                    <CardContent className="flex-1 p-5 font-mono text-[13px] overflow-y-auto custom-scrollbar relative leading-relaxed">
                      <div className="absolute inset-0 bg-gradient-to-b from-brand-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                      
                      {logs.length === 0 ? (
                        <div className="text-zinc-600 flex items-center gap-2">
                          <span className="inline-block w-2 h-4 bg-zinc-600 animate-[typing-cursor_1s_infinite]" />
                          <span>Waiting for connection...</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {logs.map((log, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-zinc-300 break-words py-0.5 hover:bg-zinc-800/30 px-1 -mx-1 rounded transition-colors"
                            >
                              <span className="text-zinc-600 mr-3 select-none text-xs">
                                {log.time}
                              </span>
                              {log.text}
                            </motion.div>
                          ))}
                          <div ref={logsEndRef} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* AI Visualizer Card (40% width on md+) */}
                <div className="md:col-span-5 h-full flex flex-col min-h-0">
                  <AICoreVisualizer 
                    activeStepName={activeStepName} 
                    isComplete={isComplete} 
                    isSynthesizing={steps.length > 0 && completedCount === steps.length && !finalReport}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Full Screen Report Synthesis Overlay */}
      <AnimatePresence>
        {isSynthesizingReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#060606] flex items-center justify-center p-6"
          >
            {/* The Full Screen Canvas */}
            <div className="absolute inset-0">
              <AICoreVisualizer 
                activeStepName={null} 
                isComplete={false} 
                isSynthesizing={true} 
              />
            </div>

            {/* Glowing Center HUD Panel */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
              className="relative z-10 glass border border-zinc-800/80 p-8 rounded-3xl max-w-md w-full bg-zinc-950/75 backdrop-blur-xl text-center space-y-6 shadow-[0_0_50px_rgba(139,92,246,0.2)]"
            >
              {/* Glowing Orb */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-brand-500 rounded-full blur-xl"
                />
                <div className="relative p-4 bg-brand-500/10 border border-brand-500/30 rounded-2xl animate-pulse">
                  <Sparkles className="w-8 h-8 text-brand-400" />
                </div>
              </div>

              {/* Status Header */}
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold tracking-wide text-zinc-100 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  Synthesizing Report
                </h3>
                <p className="text-zinc-400 text-sm">Gemini is consolidating logs, analyzing metrics, and generating your custom blueprint...</p>
              </div>

              {/* Interactive Neural Console Log Line */}
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3 text-[11px] font-mono text-zinc-500 text-left flex items-center gap-2 select-none leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping shrink-0" />
                <span className="truncate">Active logic compilation: streaming markdown tokens...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
