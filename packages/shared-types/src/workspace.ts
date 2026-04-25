export interface Workspace {
  id:        string
  name:      string
  slug:      string
  createdAt: string
  updatedAt: string
}

export interface ApiKey {
  id:          string
  workspaceId: string
  name:        string
  keyPrefix:   string   // first 8 chars for display — never store full key
  scopes:      ApiKeyScope[]
  createdAt:   string
  expiresAt?:  string
}

export type ApiKeyScope =
  | 'events:write'
  | 'events:read'
  | 'pipelines:read'
  | 'pipelines:write'
  | 'destinations:read'
  | 'destinations:write'
