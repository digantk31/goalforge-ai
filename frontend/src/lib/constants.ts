export const APP_NAME = 'GoalForge AI'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', iconName: 'LayoutDashboard' as const },
  { label: 'New Goal', path: '/new', iconName: 'Sparkles' as const },
  { label: 'History', path: '/history', iconName: 'History' as const },
  { label: 'Settings', path: '/settings', iconName: 'Settings' as const },
] as const

export const GOAL_STATUSES = ['draft', 'planning', 'running', 'completed', 'failed', 'cancelled'] as const
export const STEP_STATUSES = ['pending', 'running', 'completed', 'failed', 'skipped'] as const
export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  draft:     { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-400' },
  planning:  { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  pending:   { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-400' },
  running:   { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  failed:    { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  cancelled: { bg: 'bg-zinc-500/10', text: 'text-zinc-500', dot: 'bg-zinc-500' },
  skipped:   { bg: 'bg-zinc-500/10', text: 'text-zinc-500', dot: 'bg-zinc-500' },
}

export const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  low:      { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-700' },
  medium:   { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-800' },
  high:     { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-800' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-800' },
}
