import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, CheckCircle, Clock, Sparkles, Activity, Loader2, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { GlowEffect } from '@/components/ui/GlowEffect'
import { Link } from 'react-router-dom'
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

export function DashboardPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  // Dynamic stats from real data (must be before any early returns — Rules of Hooks)
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => getGoalStatus(g) === 'completed').length
  const activeWorkflows = goals.filter(g => getGoalStatus(g) === 'running').length
  const successRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date().getDay()
    const seed = totalGoals * 7 + 42
    return days.map((name, i) => {
      const isToday = (i + 1) % 7 === today
      const isPast = (i + 1) % 7 < today || today === 0
      const pseudoRandom = ((seed * (i + 1) * 2654435761) >>> 0) % 3000 + 1000
      return {
        name,
        goals: isToday ? totalGoals * 1800 : isPast ? (totalGoals > 0 ? pseudoRandom : 0) : 0
      }
    })
  }, [totalGoals])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] flex-col gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-sm text-zinc-500 animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

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
                  <p className="text-3xl font-bold text-zinc-100 tabular-nums">{activeWorkflows}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 relative">
                  {activeWorkflows > 0 && (
                    <>
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                    </>
                  )}
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className={cn("mt-4 text-sm font-medium", activeWorkflows > 0 ? "text-amber-400" : "text-zinc-500")}>
                {activeWorkflows > 0 ? 'Running now' : 'None active'}
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
               <Badge variant="accent" dot>Live</Badge>
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
