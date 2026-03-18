import { contextBridge, ipcRenderer } from 'electron'
import type { CreateWorkspaceInput, RecentWorkspace, WorkspaceMetadata } from '@kando/shared'

interface WorkspaceBridge {
  create: (input: CreateWorkspaceInput) => Promise<WorkspaceMetadata>
  open: (path: string) => Promise<WorkspaceMetadata>
  listRecent: () => Promise<RecentWorkspace[]>
  pickFolder: () => Promise<string | null>
}

contextBridge.exposeInMainWorld('kando', {
  platform: process.platform,
  workspace: {
    create: (input: CreateWorkspaceInput) => ipcRenderer.invoke('workspace:create', input),
    open: (path: string) => ipcRenderer.invoke('workspace:open', path),
    listRecent: () => ipcRenderer.invoke('workspace:list-recent'),
    pickFolder: () => ipcRenderer.invoke('workspace:pick-folder')
  } satisfies WorkspaceBridge
})
