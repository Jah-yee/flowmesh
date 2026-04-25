export type StepType = 'filter' | 'transform' | 'enrich' | 'destination'

export interface PipelineStep {
  id:     string
  type:   StepType
  name:   string
  config: Record<string, unknown>
}

export interface Pipeline {
  id:          string
  workspaceId: string
  name:        string
  description?: string
  trigger:     PipelineTrigger
  steps:       PipelineStep[]
  enabled:     boolean
  createdAt:   string
  updatedAt:   string
}

export interface PipelineTrigger {
  type:   'event'
  events: string[]   // e.g. ["order.created", "order.updated"]
}

export type PipelineExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'

export interface PipelineExecution {
  id:           string
  pipelineId:   string
  eventId:      string
  correlationId: string
  status:       PipelineExecutionStatus
  startedAt:    string
  completedAt?: string
  error?:       string
}
