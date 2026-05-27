import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, Filter, Loader2, Trash2, AlertTriangle, Sparkles, History } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/formatters'
import { api } from '@/lib/api'

interface DeleteModalProps {
  isOpen: boolean
  goalTitle: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

function DeleteConfirmModal({ isOpen, goalTitle, onConfirm, onCancel, isDeleting }: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Red glow accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-orange-500" />

          <div className="p-6">
            {/* Icon + Title */}
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">Delete Goal</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  This action cannot be undone. This will permanently delete the goal and all associated workflow data.
                </p>
              </div>
            </div>

            {/* Goal preview */}
            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 mb-6">
              <p className="text-sm text-zinc-300 truncate">{goalTitle}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isDeleting}
                className="px-4 text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </Button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:border-red-500/50 hover:text-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Goal
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function HistoryPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All Statuses')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDeleteClick = (e: React.MouseEvent, goal: any) => {
    e.stopPropagation()
    setDeleteTarget({ id: goal.id, title: goal.description || goal.title || 'Untitled Goal' })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await api.deleteGoal(deleteTarget.id)
      setGoals(prev => prev.filter(g => g.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      console.error('Failed to delete goal:', err)
    } finally {
      setIsDeleting(false)
    }
  }

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
        <AnimatePresence mode="popLayout">
          {filteredGoals.map((goal, i) => {
            const status = goal.status || 'completed'
            const priority = goal.priority || 'medium'
            const date = goal.created_at ? new Date(goal.created_at) : new Date()

            return (
            <motion.div
              key={goal.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
              transition={{ delay: i * 0.05 }}
              layout
            >
              <Link to={`/run/${goal.id}`} state={{ goalDescription: goal.description || goal.title || '' }}>
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
                          <span>{status}</span>
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
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleDeleteClick(e, goal)}
                        className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-zinc-600 group-hover:text-brand-500 transition-colors transform group-hover:translate-x-1 duration-200">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )})}
        </AnimatePresence>

        {filteredGoals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex p-4 bg-zinc-800/30 rounded-2xl mb-5">
              <History className="w-10 h-10 text-zinc-600" />
            </div>
            <p className="text-zinc-400 text-lg font-medium">No goals found</p>
            <p className="text-zinc-600 text-sm mt-1.5 mb-6">Your completed workflows will appear here.</p>
            <Link to="/new">
              <Button variant="primary" icon={<Sparkles className="w-4 h-4" />}>
                Create Your First Goal
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        goalTitle={deleteTarget?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </motion.div>
  )
}
