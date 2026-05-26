export type GoalStatus = 'draft' | 'planning' | 'running' | 'completed' | 'failed' | 'cancelled'
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type StepType = 'research' | 'analysis' | 'generation' | 'code' | 'validation'

export interface Goal {
  id: string
  title: string
  description: string | null
  status: GoalStatus
  // Extended fields — not yet returned by backend, kept optional for forward compatibility
  priority?: Priority
  tags?: string[]
  step_count?: number
  completed_steps?: number
  latest_run_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface StepOutput {
  result: string
  artifacts: string[]
  confidence: number
}

export interface ToolCall {
  tool: string
  query: string
  result_summary: string
}

export interface Step {
  id: string
  run_id: string
  goal_id: string
  order: number
  title: string
  description: string
  status: StepStatus
  step_type: StepType
  input_context: string
  output: StepOutput | null
  tokens_used: number
  duration_ms: number
  retry_count: number
  error: string | null
  tool_calls: ToolCall[]
  started_at: string | null
  completed_at: string | null
}

export interface WorkflowRun {
  id: string
  goal_id: string
  status: GoalStatus
  mode: 'auto' | 'step-by-step'
  plan_summary: string
  total_steps: number
  completed_steps: number
  failed_steps: number
  total_tokens_used: number
  total_duration_ms: number
  error: string | null
  started_at: string
  completed_at: string | null
  created_at: string
}
