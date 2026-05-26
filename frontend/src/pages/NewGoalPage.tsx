import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GlowEffect } from '@/components/ui/GlowEffect'
import { cn } from '@/lib/cn'
import { PRIORITY_COLORS } from '@/lib/constants'
import { api } from '@/lib/api'

const suggestions = [
  'Build a landing page',
  'Research market trends',
  'Write technical docs',
  'Plan product launch'
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
    "Estimating time to completion...",
    "Output estimated in ~45s...",
    "Starting autonomous agents..."
  ]

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isLoading) {
      setLoadingState(0)
      interval = setInterval(() => {
        setLoadingState((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev))
      }, 800)
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
      navigate(`/run/${goal.id}`)
    } catch (error) {
      console.error('Failed to forge goal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-12"
    >
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-gradient-brand">
          What would you like to accomplish?
        </h2>
        <p className="text-zinc-400 text-lg">
          Describe your goal and GoalForge AI will break it down into steps and execute them autonomously.
        </p>
      </div>

      <GlowEffect color="rgba(139, 92, 246, 0.2)" active={goalText.length > 0}>
        <Card className="glass border-zinc-800/50 p-2">
          <CardContent className="p-4 space-y-6">
            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g., Create a comprehensive marketing strategy for a B2B SaaS product..."
              className="w-full bg-transparent border-none text-zinc-100 placeholder:text-zinc-600 focus:ring-0 resize-none text-xl min-h-[120px]"
              autoFocus
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-between border-t border-zinc-800/50 pt-4">
              <div className="space-y-3">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Priority</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PRIORITY_COLORS).map(([p, colors]) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize",
                        priority === p 
                          ? `${colors.bg} ${colors.text} border-${colors.border}` 
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 flex-1 sm:max-w-[200px]">
                 <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tags</span>
                 <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-md">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-zinc-100"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                 </div>
                 <input 
                   type="text"
                   value={tagInput}
                   onChange={e => setTagInput(e.target.value)}
                   onKeyDown={handleAddTag}
                   placeholder="Add tags..."
                   className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
                 />
              </div>
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              className="w-full text-base font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-shadow"
              icon={<Sparkles className="w-5 h-5" />}
              disabled={goalText.length === 0 || isLoading}
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

      <div className="mt-12">
        <p className="text-sm text-zinc-500 mb-4 text-center">Or try one of these suggestions:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="ghost"
              size="sm"
              onClick={() => setGoalText(suggestion)}
              className="rounded-full bg-zinc-900/50 border border-zinc-800 hover:border-brand-500/50 hover:bg-brand-500/10 text-zinc-400 hover:text-brand-300 transition-all"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
