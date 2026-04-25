export interface FlowMeshEvent {
  // required — core identification
  event:         string
  correlationId: string
  eventId:       string
  timestamp:     string
  source:        string
  version:       string

  // required — at least one
  userId?:       string
  anonymousId?:  string

  // optional
  sessionId?:    string
  properties?:   Record<string, unknown>
  context?:      EventContext
}

export interface EventContext {
  app?: {
    name:    string
    version: string
  }
  os?: {
    name:    string
    version: string
  }
  locale?:    string
  timezone?:  string
  ip?:        string
  userAgent?: string
  page?: {
    url:      string
    title:    string
    referrer: string
  }
  campaign?: {
    source: string
    medium: string
    name:   string
  }
}

export interface IdentifyEvent {
  userId:  string
  traits:  Record<string, unknown>
  context?: EventContext
}

export interface PageEvent {
  name:     string
  userId?:  string
  anonymousId?: string
  properties?: Record<string, unknown>
  context?: EventContext
}

export interface GroupEvent {
  userId:   string
  groupId:  string
  traits?:  Record<string, unknown>
  context?: EventContext
}

export type EventValidationError = {
  field:   string
  message: string
}

export type EventValidationResult =
  | { valid: true }
  | { valid: false; errors: EventValidationError[] }
