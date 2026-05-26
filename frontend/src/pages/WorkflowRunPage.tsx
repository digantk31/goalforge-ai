import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, AlertCircle, TerminalSquare } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { GlowEffect } from '@/components/ui/GlowEffect'
import { cn } from '@/lib/cn'
import { API_URL } from '@/lib/constants'

interface Step {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export function WorkflowRunPage() {
  const { goalId } = useParams<{ goalId: string }>()
  const [steps, setSteps] = useState<Step[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [finalReport, setFinalReport] = useState<string | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!goalId) return

    const sse = new EventSource(`${API_URL}/api/v1/workflows/${goalId}/stream`)

    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        
        // Update step timeline
        if (data.step && data.step !== 'Generate Report') {
          setSteps(prev => {
            const existing = prev.find(s => s.id === (data.id || data.step))
            if (existing) {
              return prev.map(s => s.id === (data.id || data.step) ? { ...s, status: data.status, name: data.step } : s)
            }
            return [...prev, { id: data.id || data.step, name: data.step, status: data.status || 'pending' }]
          })
        }

        // Set final report from backend
        if (data.report) {
          setFinalReport(data.report)
        }
        
        // Append to terminal logs
        if (data.log) {
          setLogs(prev => [...prev, data.log])
        }

      } catch (err) {
        console.error('Failed to parse SSE message', err)
      }
    }

    sse.onerror = () => {
      console.log('SSE connection closed or errored')
      // If we haven't set finalReport yet and stream closes cleanly, we can optionally set it here
      // But we will rely on the "Generate Report" step or similar completion signal.
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 h-[calc(100vh-8rem)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
          <TerminalSquare className="w-8 h-8 text-brand-500" />
          Workflow Execution
        </h1>
        <p className="text-zinc-400 mt-2">Goal ID: {goalId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-5 h-full overflow-y-auto pr-4 custom-scrollbar">
          <GlowEffect color="rgba(139, 92, 246, 0.15)" active={true}>
            <Card className="glass border-zinc-800/50 h-full bg-zinc-900/40 backdrop-blur-md">
              <CardHeader className="border-b border-zinc-800/50 pb-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  Live Timeline
                </h3>
              </CardHeader>
              <CardContent className="pt-6 relative">
                {steps.length === 0 ? (
                  <div className="text-zinc-500 text-center py-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-700" />
                    <p>Waiting for workflow to start...</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    <AnimatePresence>
                      {steps.map((step, index) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative pl-8 pb-8 last:pb-0"
                        >
                          {/* Connecting Line */}
                          {index !== steps.length - 1 && (
                            <div className="absolute left-[11px] top-8 bottom-[-8px] w-0.5 bg-gradient-to-b from-zinc-700 to-transparent" />
                          )}
                          
                          {/* Step Icon */}
                          <div className="absolute left-[-2px] top-1 bg-zinc-900 rounded-full">
                            {getStepIcon(step.status)}
                          </div>

                          {/* Step Content */}
                          <div className={cn(
                            "p-4 rounded-lg border transition-all duration-300 relative overflow-hidden",
                            step.status === 'running' ? "bg-brand-500/10 border-brand-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]" :
                            step.status === 'completed' ? "bg-emerald-500/5 border-emerald-500/20" :
                            step.status === 'failed' ? "bg-red-500/10 border-red-500/20" :
                            "bg-zinc-800/30 border-zinc-700/50"
                          )}>
                            {step.status === 'running' && (
                              <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-transparent via-brand-500/10 to-brand-400/40 blur-sm animate-scan pointer-events-none" />
                            )}
                            <h3 className={cn(
                              "font-medium text-lg relative z-10",
                              step.status === 'running' ? "text-brand-300" :
                              step.status === 'completed' ? "text-emerald-400" :
                              step.status === 'failed' ? "text-red-400" :
                              "text-zinc-400"
                            )}>
                              {step.name}
                            </h3>
                            <p className="text-sm text-zinc-500 mt-1 capitalize">{step.status}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </GlowEffect>
        </div>

        {/* Right Column: Terminal Logs or Final Report */}
        <div className="lg:col-span-7 h-full">
          {finalReport ? (
            <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-y-auto h-full prose prose-invert max-w-none">
              <ReactMarkdown>{finalReport}</ReactMarkdown>
            </div>
          ) : (
            <Card className="h-full bg-[#0a0a0a] border-zinc-800/50 shadow-2xl flex flex-col relative overflow-hidden group">
              {/* Terminal Header */}
              <div className="flex items-center px-4 py-3 bg-zinc-900/80 border-b border-zinc-800/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="mx-auto text-xs font-mono text-zinc-500 flex items-center gap-2">
                  <TerminalSquare className="w-3 h-3" />
                  worker-node-1
                </div>
              </div>

              {/* Terminal Output */}
              <CardContent className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar relative">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                
                {logs.length === 0 ? (
                  <div className="text-zinc-600 flex items-center gap-2">
                    <span className="animate-pulse">_</span> Waiting for logs...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-zinc-300 break-words"
                      >
                        <span className="text-zinc-600 mr-4 select-none">
                          {new Date().toLocaleTimeString([], { hour12: false })}
                        </span>
                        {log}
                      </motion.div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
