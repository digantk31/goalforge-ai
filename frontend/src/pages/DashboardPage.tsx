import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, CheckCircle, Coins, Sparkles, Activity, Loader2, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { GlowEffect } from '@/components/ui/GlowEffect'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/cn'
import { api } from '@/lib/api'

const mockChartData = [
  { name: 'Mon', tokens: 4000 },
  { name: 'Tue', tokens: 3000 },
  { name: 'Wed', tokens: 2000 },
  { name: 'Thu', tokens: 8780 },
  { name: 'Fri', tokens: 1890 },
  { name: 'Sat', tokens: 2390 },
  { name: 'Sun', tokens: 3490 },
]

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

const statCards = [
  {
    label: 'Total Goals',
    icon: Target,
    color: 'brand',
    gradient: 'from-brand-500/8 to-transparent',
    iconBg: 'bg-brand-500/10',
    iconColor: 'text-brand-400',
    subtitle: '+3 this week',
    subtitleColor: 'text-emerald-400',
  },
  {
    label: 'Active Workflows',
    icon: Zap,
    color: 'amber',
    gradient: 'from-amber-500/8 to-transparent',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    subtitle: 'Running now',
    subtitleColor: 'text-amber-400',
    ping: true,
  },
  {
    label: 'Completed',
    icon: CheckCircle,
    color: 'emerald',
    gradient: 'from-emerald-500/8 to-transparent',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    subtitle: '92% success rate',
    subtitleColor: 'text-emerald-400',
  },
  {
    label: 'Tokens Used',
    icon: Coins,
    color: 'blue',
    gradient: 'from-blue-500/8 to-transparent',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    subtitle: 'avg 3.8K/goal',
    subtitleColor: 'text-zinc-500',
  },
]

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] flex-col gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-sm text-zinc-500 animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  const activeWorkflows = Math.max(0, Math.floor(goals.length * 0.3))
  const completedGoals = Math.max(0, goals.length - activeWorkflows)
  const statValues = [goals.length, activeWorkflows, completedGoals, '45.2K']

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
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <Card hover className="h-full glass border-zinc-800/50 relative overflow-hidden group">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", card.gradient)} />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-zinc-400">{card.label}</p>
                      <p className="text-3xl font-bold text-zinc-100 tabular-nums">{statValues[i]}</p>
                    </div>
                    <div className={cn("p-2.5 rounded-xl relative", card.iconBg)}>
                      {card.ping && (
                        <>
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                        </>
                      )}
                      <Icon className={cn("w-5 h-5", card.iconColor)} />
                    </div>
                  </div>
                  <div className={cn("mt-4 flex items-center text-sm font-medium", card.subtitleColor)}>
                    {card.subtitle}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts + Recent Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-[400px] flex flex-col glass border-zinc-800/50">
            <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
               <h3 className="text-lg font-medium">Activity Feed</h3>
               <Badge variant="accent" dot>Live</Badge>
            </div>
            <div className="flex-1 p-6 relative">
              <div className="absolute inset-0 bg-brand-500/5 blur-3xl rounded-full pointer-events-none" />
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTokens)" />
                </AreaChart>
              </ResponsiveContainer>
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
                   const status = i === 0 ? 'running' : 'completed'
                   const progress = i === 0 ? 65 : 100
                   
                   return (
                     <Link key={goal.id || i} to={`/run/${goal.id}`} className="block">
                       <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800/30 transition-all duration-200 group cursor-pointer">
                         <div className="flex justify-between items-start mb-2.5">
                           <span className="font-medium text-sm text-zinc-200 truncate flex-1 mr-2 group-hover:text-brand-300 transition-colors">{goal.description || 'Untitled Goal'}</span>
                           <Badge variant={status === 'running' ? 'warning' : 'success'} dot={status === 'running'}>
                             {status}
                           </Badge>
                         </div>
                         <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                           <div 
                             className={cn("h-1.5 rounded-full transition-all duration-1000", status === 'running' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400')} 
                             style={{ width: `${progress}%` }} 
                           />
                         </div>
                         <div className="flex justify-between items-center mt-2">
                           <span className="text-xs text-zinc-500">Recently</span>
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
