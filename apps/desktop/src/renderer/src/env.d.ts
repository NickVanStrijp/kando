/// <reference types="vite/client" />

import type { CreateWorkspaceInput, RecentWorkspace, WorkspaceMetadata } from '@kando/shared'

declare global {
  interface Window {
    kando: {
      platform: string
      workspace: {
        create: (input: CreateWorkspaceInput) => Promise<WorkspaceMetadata>
        open: (path: string) => Promise<WorkspaceMetadata>
        listRecent: () => Promise<RecentWorkspace[]>
        pickFolder: () => Promise<string | null>
      }
    }
  }
}

export {}
