export type DestinationType =
  | 'postgres'
  | 'mysql'
  | 'slack'
  | 'discord'
  | 'webhook'
  | 's3'
  | 'email'
  | 'elasticsearch'

export interface Destination {
  id:          string
  workspaceId: string
  name:        string
  type:        DestinationType
  config:      Record<string, unknown>
  createdAt:   string
  updatedAt:   string
}

export type DeliveryStatus =
  | 'pending'
  | 'delivered'
  | 'failed'
  | 'dead_lettered'

export interface DeliveryAttempt {
  id:            string
  eventId:       string
  destinationId: string
  status:        DeliveryStatus
  attemptNumber: number
  error?:        string
  attemptedAt:   string
}
