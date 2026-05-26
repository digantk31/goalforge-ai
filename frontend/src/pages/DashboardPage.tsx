import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, CheckCircle, Coins, Sparkles, Activity, Loader2 } from 'lucide-react'
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

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
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

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
  }

  const activeWorkflows = Math.max(0, Math.floor(goals.length * 0.3))
  const completedGoals = Math.max(0, goals.length - activeWorkflows)

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card hover className="h-full glass border-zinc-800/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-400">Total Goals</p>
                  <p className="text-3xl font-bold text-zinc-100">{goals.length}</p>
                </div>
                <div className="p-2 bg-brand-500/10 rounded-lg">
                  <Target className="w-5 h-5 text-brand-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-400">
                <span className="font-medium">+3 this week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card hover className="h-full glass border-zinc-800/50 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-400">Active Workflows</p>
                  <p className="text-3xl font-bold text-zinc-100">{activeWorkflows}</p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg relative">
                  <span className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full" />
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-amber-400">
                <span className="font-medium">Running now</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card hover className="h-full glass border-zinc-800/50 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-400">Completed</p>
                  <p className="text-3xl font-bold text-zinc-100">{completedGoals}</p>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-zinc-400">
                <span className="font-medium text-emerald-400">92% success</span>
                <span className="ml-2 text-zinc-500">rate</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card hover className="h-full glass border-zinc-800/50 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-400">Tokens Used</p>
                  <p className="text-3xl font-bold text-zinc-100">45.2K</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Coins className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-zinc-500">
                <span>avg 3.8K/goal</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-[400px] flex flex-col glass border-zinc-800/50">
            <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
               <h3 className="text-lg font-medium">Activity Feed</h3>
               <Badge variant="accent" dot>Live</Badge>
            </div>
            <div className="flex-1 p-6 relative">
              {/* Neon glow effect behind chart */}
              <div className="absolute inset-0 bg-brand-500/5 blur-3xl rounded-full" />
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
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                  <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
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
             <div className="flex-1 p-4 overflow-y-auto space-y-3">
               {goals.slice(0, 4).map((goal, i) => {
                 const status = i === 0 ? 'running' : 'completed'
                 const progress = i === 0 ? 60 : 100
                 
                 return (
                 <div key={goal.id || i} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                   <div className="flex justify-between items-start mb-2">
                     <span className="font-medium text-sm text-zinc-200">{goal.description || 'Untitled Goal'}</span>
                     <Badge variant={status === 'running' ? 'warning' : 'success'} dot={status === 'running'}>
                       {status}
                     </Badge>
                   </div>
                   <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-2 overflow-hidden">
                     <div 
                        className={cn("h-1.5 rounded-full transition-all duration-1000", status === 'running' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400')} 
                        style={{ width: `${progress}%` }} 
                     />
                   </div>
                   <span className="text-xs text-zinc-500">Recently</span>
                 </div>
               )})}
             </div>
           </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
