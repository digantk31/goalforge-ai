import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronRight, Filter, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { formatRelativeTime } from '@/lib/formatters'
import { api } from '@/lib/api'

export function HistoryPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All Statuses')

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

  const filteredGoals = goals.filter(g => {
    if (filter === 'All Statuses') return true
    const s = g.status || 'completed'
    return s.toLowerCase() === filter.toLowerCase()
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Goal History</h2>
          <p className="text-zinc-400 mt-1">Review your past autonomous workflows.</p>
        </div>
      </div>

      <Card className="glass border-zinc-800/50 p-2">
        <div className="flex flex-col sm:flex-row gap-3 p-2">
          <div className="flex-1">
             <Input icon={<Search className="w-4 h-4 text-zinc-500" />} placeholder="Search goals..." className="w-full bg-zinc-900/50" />
          </div>
          <div className="flex gap-3">
             <div className="relative">
                 <select 
                    className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-brand-500 hover:border-zinc-700 transition-colors h-10"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                 >
                  <option>All Statuses</option>
                  <option>Completed</option>
                  <option>Failed</option>
                  <option>Cancelled</option>
                </select>
                <Filter className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
             </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {filteredGoals.map((goal, i) => {
          const status = goal.status || 'completed'
          const priority = goal.priority || 'medium'
          const date = goal.created_at ? new Date(goal.created_at) : new Date()

          return (
          <motion.div
            key={goal.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card hover className="bg-zinc-900/40 border-zinc-800/60 cursor-pointer group">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-200 truncate group-hover:text-brand-300 transition-colors">
                      {goal.description || 'Untitled Goal'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span>{formatRelativeTime(date)}</span>
                      <span>•</span>
                      <span>completed</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <Badge variant={status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'default'} dot>
                      {status}
                    </Badge>
                    <Badge variant={priority === 'critical' ? 'error' : priority === 'high' ? 'warning' : priority === 'medium' ? 'info' : 'default'}>
                      {priority}
                    </Badge>
                  </div>
                </div>
                <div className="shrink-0 text-zinc-600 group-hover:text-brand-500 transition-colors transform group-hover:translate-x-1 duration-200">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )})}
      </div>
    </motion.div>
  )
}
