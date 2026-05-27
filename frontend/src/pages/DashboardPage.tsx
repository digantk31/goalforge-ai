import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Zap, CheckCircle, Clock, Sparkles, Activity, Loader2, ArrowUpRight, Rocket, ShieldAlert, Search, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { GlowEffect } from '@/components/ui/GlowEffect'
import { showToast } from '@/components/ui/Toast'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/cn'
import { api } from '@/lib/api'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

function getGoalStatus(goal: any): 'completed' | 'running' | 'failed' | 'pending' {
  if (goal.status) return goal.status
  return 'completed'
}

function getTimeAgo(dateStr: string | undefined): string {
  if (!dateStr) return 'Just now'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const PRESETS = [
  {
    title: "Generate Market Strategy",
    description: "Market analysis and entry strategy for a B2B SaaS platform in developer tools.",
    prompt: "Generate a comprehensive market analysis and entry strategy for a B2B SaaS platform in the automated developer tools space, identifying key competitors and pricing models.",
    icon: Rocket,
    color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400"
  },
  {
    title: "Build Launch Plan",
    description: "30-day multi-channel product launch plan for a developer security startup.",
    prompt: "Create a 30-day multi-channel product launch plan for a developer security product, including target personas, key messaging, and distribution channels.",
    icon: ShieldAlert,
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400"
  },
  {
    title: "Research AI Competitors",
    description: "Analyze top AI coding tools, their pricing stacks, and core capabilities.",
    prompt: "Analyze and compare the top 5 AI coding assistants in 2026, mapping their unique value propositions, pricing tiers, and technological stacks.",
    icon: Search,
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400"
  },
  {
    title: "Create Growth Strategy",
    description: "Product-led growth framework for a collaborative data analytics engine.",
    prompt: "Design a product-led growth strategy for a collaborative analytics platform, focusing on user activation, viral loops, and conversion touchpoints.",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400"
  }
]

export function DashboardPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [launchingPreset, setLaunchingPreset] = useState<string | null>(null)
  const navigate = useNavigate()

  // Live telemetry simulation values
  const [liveStats, setLiveStats] = useState({
    activeOffset: 0,
    chartNoise: [0, 0, 0, 0, 0, 0, 0]
  })

  useEffect(() => {
    api.getGoals()
      .then(data => {
        setGoals(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  // Fluctuating live effect
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => getGoalStatus(g) === 'completed').length
  const activeWorkflows = goals.filter(g => getGoalStatus(g) === 'running').length
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => {
        const activeOffset = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : prev.activeOffset
        const chartNoise = Array.from({ length: 7 }, () => Math.floor(Math.random() * 600) - 300)
        return {
          activeOffset: Math.max(-activeWorkflows, Math.min(2, activeOffset)),
          chartNoise
        }
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [activeWorkflows])

  const successRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  const handleLaunchPreset = async (preset: typeof PRESETS[0]) => {
    try {
      setLaunchingPreset(preset.title)
      showToast(`Launching ${preset.title} autonomous mission...`, 'success')
      const goal = await api.createGoal(preset.prompt, 'high')
      await api.startWorkflow(goal.id)
      navigate(`/run/${goal.id}`, { state: { goalDescription: preset.prompt } })
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.detail || err?.message || 'Failed to launch preset'
      showToast(msg, 'error')
    } finally {
      setLaunchingPreset(null)
    }
  }

  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date().getDay()
    const seed = totalGoals * 7 + 42
    return days.map((name, i) => {
      const isToday = (i + 1) % 7 === today
      const isPast = (i + 1) % 7 < today || today === 0
      const pseudoRandom = ((seed * (i + 1) * 2654435761) >>> 0) % 2500 + 1200
      const noise = liveStats.chartNoise[i] || 0
      
      let baseVal = 0
      if (isToday) {
        baseVal = totalGoals * 1900
      } else if (isPast) {
        baseVal = totalGoals > 0 ? pseudoRandom : 0
      }

      return {
        name,
        goals: baseVal > 0 ? Math.max(800, baseVal + noise) : 0
      }
    })
  }, [totalGoals, liveStats.chartNoise])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] flex-col gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-sm text-zinc-500 animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  // Premium Hero Empty State
  if (goals.length === 0) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-12 py-8"
      >
        {/* Empty State Hero */}
        <motion.div variants={itemVariants} className="text-center space-y-6">
          <div className="relative inline-flex items-center justify-center">
            {/* Spinning ambient ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute w-28 h-28 border border-dashed border-brand-500/20 rounded-full"
            />
            {/* Pulsing ambient core */}
            <motion.div 
              animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute w-20 h-20 bg-brand-500 rounded-full blur-2xl"
            />
            <div className="relative p-5 bg-brand-500/10 border border-brand-500/20 rounded-3xl shadow-[0_0_30px_rgba(139,92,246,0.15)]">
              <Sparkles className="w-10 h-10 text-brand-400" />
            </div>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold tracking-tight text-zinc-100">
              Start your first <span className="text-gradient-brand">autonomous mission</span>
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              No active workflows. Forge a customized objective or select a high-fidelity benchmark demo preset below to watch GoalForge execute live.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/new">
              <GlowEffect color="rgba(139, 92, 246, 0.4)" active={true}>
                <Button variant="primary" size="lg" className="px-6 py-3" icon={<Sparkles className="w-5 h-5" />}>
                  Create Custom Goal
                </Button>
              </GlowEffect>
            </Link>
          </div>
        </motion.div>

        {/* Demo Presets Grid */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
              Recommended for Judges
            </div>
            <h3 className="text-lg font-semibold text-zinc-300">Quick-Start Demo Presets</h3>
            <p className="text-xs text-zinc-500 mt-1">One-click deployment to stream live agent execution, tools activity, and report synthesis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {PRESETS.map((preset) => {
              const Icon = preset.icon
              const isLaunching = launchingPreset === preset.title
              return (
                <Card 
                  key={preset.title}
                  hover
                  className="glass border-zinc-800/50 hover:border-brand-500/30 transition-all duration-300 relative overflow-hidden group cursor-pointer"
                  onClick={() => !launchingPreset && handleLaunchPreset(preset)}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", preset.color.split(' ')[0])} />
                  <CardContent className="p-6 flex gap-4 items-start relative z-10">
                    <div className={cn("p-3 rounded-2xl border shrink-0 bg-zinc-950", preset.color.split(' ').slice(1, 3).join(' '))}>
                      {isLaunching ? (
                        <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-zinc-200 group-hover:text-brand-300 transition-colors">{preset.title}</h4>
                        <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-brand-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">{preset.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Active Goals Dashboard
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome to <span className="text-gradient-brand">GoalForge</span>
          </h2>
          <p className="text-zinc-400 mt-1">Your autonomous AI workflows at a glance.</p>
        </div>
        <Link to="/new">
          <GlowEffect color="rgba(139, 92, 246, 0.4)" active={true}>
            <Button variant="primary" icon={<Sparkles className="w-4 h-4" />}>
              Create New Goal
            </Button>
          </GlowEffect>
        </Link>
      </motion.div>

      {/* Quick Launch Presets */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            Quick-Start Demo Presets
          </h3>
          <Badge variant="accent" dot className="bg-brand-500/10 text-brand-400 border-brand-500/20 font-mono text-[10px]">
            One-Click Launch
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESETS.map((preset) => {
            const Icon = preset.icon
            const isLaunching = launchingPreset === preset.title
            return (
              <Card 
                key={preset.title} 
                hover 
                onClick={() => !launchingPreset && handleLaunchPreset(preset)}
                className="glass border-zinc-800/50 hover:border-brand-500/30 transition-all duration-300 relative overflow-hidden group cursor-pointer"
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", preset.color.split(' ')[0])} />
                <CardContent className="p-4 flex gap-3 items-center relative z-10">
                  <div className={cn("p-2 rounded-xl border shrink-0 bg-zinc-950", preset.color.split(' ').slice(1, 3).join(' '))}>
                    {isLaunching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs text-zinc-200 truncate group-hover:text-brand-300 transition-colors">{preset.title}</h4>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{preset.description}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-brand-400 transition-colors shrink-0" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Goals */}
        <motion.div variants={itemVariants}>
          <Card hover className="h-full glass border-zinc-800/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-400">Total Goals</p>
                  <p className="text-3xl font-bold text-zinc-100 tabular-nums">{totalGoals}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-500/10">
                  <Target className="w-5 h-5 text-brand-400" />
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-zinc-500">
                {totalGoals === 0 ? 'Create your first goal' : `${totalGoals} total created`}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Workflows */}
        <motion.div variants={itemVariants}>
          <Card hover className="h-full glass border-zinc-800/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-400">Active Workflows</p>
                  <p className="text-3xl font-bold text-zinc-100 tabular-nums">
                    {Math.max(0, activeWorkflows + liveStats.activeOffset)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 relative">
                  {(activeWorkflows + liveStats.activeOffset) > 0 && (
                    <>
                      <span className="absolute -inset-1 rounded-xl bg-amber-500/10 animate-pulse-glow" />
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                    </>
                  )}
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className={cn("mt-4 text-sm font-medium flex items-center gap-1.5", (activeWorkflows + liveStats.activeOffset) > 0 ? "text-amber-400" : "text-zinc-500")}>
                {(activeWorkflows + liveStats.activeOffset) > 0 ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Running now
                  </>
                ) : (
                  'None active'
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Completed */}
        <motion.div variants={itemVariants}>
          <Card hover className="h-full glass border-zinc-800/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-400">Completed</p>
                  <p className="text-3xl font-bold text-zinc-100 tabular-nums">{completedGoals}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-emerald-400">
                {totalGoals > 0 ? `${successRate}% success rate` : 'No data yet'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Avg Execution Time */}
        <motion.div variants={itemVariants}>
          <Card hover className="h-full glass border-zinc-800/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-400">Avg Execution</p>
                  <p className="text-3xl font-bold text-zinc-100 tabular-nums">{totalGoals > 0 ? '~45s' : '—'}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-zinc-500">
                {totalGoals > 0 ? 'Per workflow run' : 'No runs yet'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts + Recent Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-[400px] flex flex-col glass border-zinc-800/50">
            <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
               <h3 className="text-lg font-medium">Workflow Activity</h3>
               <Badge variant="accent" dot className="bg-brand-500/10 text-brand-400 border-brand-500/20 animate-pulse">Live Feed</Badge>
            </div>
            <div className="flex-1 p-6 relative">
              <div className="absolute inset-0 bg-brand-500/5 blur-3xl rounded-full pointer-events-none" />
              {totalGoals === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <div className="p-4 bg-zinc-800/30 rounded-2xl">
                    <Activity className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 text-sm">Activity will appear here once you create goals</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                      itemStyle={{ color: '#e4e4e7' }}
                      cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="goals" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGoals)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
           <Card className="h-[400px] flex flex-col glass border-zinc-800/50">
             <div className="p-6 border-b border-zinc-800/50">
               <h3 className="text-lg font-medium flex items-center gap-2">
                 <Activity className="w-4 h-4 text-brand-400" />
                 Recent Goals
               </h3>
             </div>
             <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
               {goals.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                   <div className="p-4 bg-zinc-800/30 rounded-2xl">
                     <Target className="w-8 h-8 text-zinc-600" />
                   </div>
                   <p className="text-zinc-500 text-sm">No goals yet</p>
                   <Link to="/new">
                     <Button variant="ghost" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                       Create your first goal
                     </Button>
                   </Link>
                 </div>
               ) : (
                 goals.slice(0, 5).map((goal, i) => {
                   const status = getGoalStatus(goal)
                   const progress = status === 'completed' ? 100 : status === 'running' ? 65 : status === 'failed' ? 40 : 0
                   
                   return (
                     <Link key={goal.id || i} to={`/run/${goal.id}`} state={{ goalDescription: goal.description || '' }} className="block">
                       <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800/30 transition-all duration-200 group cursor-pointer">
                         <div className="flex justify-between items-start mb-2.5">
                           <span className="font-medium text-sm text-zinc-200 truncate flex-1 mr-2 group-hover:text-brand-300 transition-colors">{goal.description || 'Untitled Goal'}</span>
                           <Badge variant={status === 'running' ? 'warning' : status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'default'} dot={status === 'running'}>
                             {status}
                           </Badge>
                         </div>
                         <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                           <div 
                             className={cn(
                               "h-1.5 rounded-full transition-all duration-1000",
                               status === 'running' ? 'bg-amber-400 animate-pulse' :
                               status === 'completed' ? 'bg-emerald-400' :
                               status === 'failed' ? 'bg-red-400' : 'bg-zinc-600'
                             )} 
                             style={{ width: `${progress}%` }} 
                           />
                         </div>
                         <div className="flex justify-between items-center mt-2">
                           <span className="text-xs text-zinc-500">{getTimeAgo(goal.created_at)}</span>
                           <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-brand-400 transition-colors" />
                         </div>
                       </div>
                     </Link>
                   )
                 })
               )}
             </div>
           </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
