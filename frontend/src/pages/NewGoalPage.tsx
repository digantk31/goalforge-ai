import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Rocket, Lightbulb, BookOpen, Megaphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GlowEffect } from '@/components/ui/GlowEffect'
import { showToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { PRIORITY_COLORS } from '@/lib/constants'
import { api } from '@/lib/api'

const suggestions = [
  { text: 'Create a 5-day workout plan for beginners', icon: Rocket },
  { text: 'Design a go-to-market strategy for an AI startup', icon: Megaphone },
  { text: 'Build a weekly meal prep plan under $50', icon: Lightbulb },
  { text: 'Write a technical blog post about microservices', icon: BookOpen },
  { text: 'Plan a 7-day trip to Japan on a budget', icon: Rocket },
  { text: 'Create a study schedule for learning Python in 30 days', icon: Lightbulb },
]

export function NewGoalPage() {
  const navigate = useNavigate()
  const [goalText, setGoalText] = useState('')
  const [priority, setPriority] = useState<string>('medium')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingState, setLoadingState] = useState(0)

  const loadingMessages = [
    "Analyzing goal...",
    "Planning autonomous workflow...",
    "Starting execution engine...",
    "Launching agents..."
  ]

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isLoading) {
      setLoadingState(0)
      interval = setInterval(() => {
        setLoadingState((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTag = tagInput.trim().replace(',', '')
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
        setTagInput('')
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleForgeGoal = async () => {
    try {
      setIsLoading(true)
      const goal = await api.createGoal(goalText, priority)
      await api.startWorkflow(goal.id)
      showToast('Workflow started successfully!', 'success')
      navigate(`/run/${goal.id}`, { state: { goalDescription: goalText } })
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.message || 'Failed to create goal'
      showToast(msg, 'error')
      console.error('Failed to forge goal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const charCount = goalText.length
  const isReady = charCount > 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto py-12"
    >
      {/* Hero */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex p-3 bg-brand-500/10 rounded-2xl mb-6 border border-brand-500/20"
        >
          <Sparkles className="w-8 h-8 text-brand-400" />
        </motion.div>
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-gradient-brand">
          What would you like to accomplish?
        </h2>
        <p className="text-zinc-400 text-lg max-w-md mx-auto">
          Describe your goal and GoalForge AI will break it down into steps and execute them autonomously.
        </p>
      </div>

      {/* Goal Input Card */}
      <GlowEffect color="rgba(139, 92, 246, 0.2)" active={isReady}>
        <Card className="glass border-zinc-800/50 p-2">
          <CardContent className="p-4 space-y-6">
            <div className="relative">
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="e.g., Create a comprehensive marketing strategy for a B2B SaaS product..."
                className="w-full bg-transparent border-none text-zinc-100 placeholder:text-zinc-600 focus:ring-0 resize-none text-xl min-h-[120px] leading-relaxed"
                autoFocus
              />
              {/* Character indicator */}
              <AnimatePresence>
                {charCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-0 right-0 text-xs text-zinc-600"
                  >
                    {charCount} chars
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between border-t border-zinc-800/50 pt-4">
              <div className="space-y-3">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Priority</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PRIORITY_COLORS).map(([p, colors]) => (
                    <motion.button
                      key={p}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPriority(p)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 capitalize",
                        priority === p 
                          ? `${colors.bg} ${colors.text} border-${colors.border} shadow-sm` 
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 flex-1 sm:max-w-[200px]">
                 <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tags</span>
                 <div className="flex flex-wrap gap-2 mb-2">
                    <AnimatePresence>
                      {tags.map(tag => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-lg border border-zinc-700/50"
                        >
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors ml-0.5"><X className="w-3 h-3" /></button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                 </div>
                 <input 
                   type="text"
                   value={tagInput}
                   onChange={e => setTagInput(e.target.value)}
                   onKeyDown={handleAddTag}
                   placeholder="Add tags..."
                   className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
                 />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full text-base font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300"
              icon={<Sparkles className="w-5 h-5" />}
              disabled={!isReady || isLoading}
              loading={isLoading}
              onClick={handleForgeGoal}
            >
              <span className="min-w-[200px] inline-block">
                {isLoading ? loadingMessages[loadingState] : "Forge Goal"}
              </span>
            </Button>
          </CardContent>
        </Card>
      </GlowEffect>

      {/* Suggestions */}
      <div className="mt-12">
        <p className="text-sm text-zinc-500 mb-4 text-center">Or try one of these suggestions:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {suggestions.map((suggestion, i) => {
            const Icon = suggestion.icon
            return (
              <motion.div
                key={suggestion.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGoalText(suggestion.text)}
                  icon={<Icon className="w-3.5 h-3.5" />}
                  className="rounded-full bg-zinc-900/50 border border-zinc-800 hover:border-brand-500/50 hover:bg-brand-500/10 text-zinc-400 hover:text-brand-300 transition-all duration-200"
                >
                  {suggestion.text}
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
