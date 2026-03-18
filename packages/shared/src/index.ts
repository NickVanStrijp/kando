export interface WorkspaceMetadata {
  name: string
  description: string
  path: string
  createdAt: string
}

export interface RecentWorkspace {
  name: string
  path: string
  lastOpenedAt: string
}

export interface CreateWorkspaceInput {
  name: string
  description?: string
  path: string
}
