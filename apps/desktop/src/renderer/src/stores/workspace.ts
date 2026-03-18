import { defineStore } from 'pinia'
import type { CreateWorkspaceInput, RecentWorkspace, WorkspaceMetadata } from '@kando/shared'

interface WorkspaceState {
  currentWorkspace: WorkspaceMetadata | null
  recentWorkspaces: RecentWorkspace[]
  isLoading: boolean
  isLoadingRecentWorkspaces: boolean
  hasLoadedRecentWorkspaces: boolean
  errorMessage: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong while handling the workspace request.'
}

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    currentWorkspace: null,
    recentWorkspaces: [],
    isLoading: false,
    isLoadingRecentWorkspaces: false,
    hasLoadedRecentWorkspaces: false,
    errorMessage: ''
  }),
  actions: {
    clearError() {
      this.errorMessage = ''
    },

    async createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceMetadata> {
      this.isLoading = true
      this.clearError()

      try {
        const workspace = await window.kando.workspace.create(input)
        this.currentWorkspace = workspace
        await this.loadRecentWorkspaces()

        return workspace
      } catch (error) {
        this.errorMessage = getErrorMessage(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async openWorkspace(path: string): Promise<WorkspaceMetadata> {
      this.isLoading = true
      this.clearError()

      try {
        const workspace = await window.kando.workspace.open(path)
        this.currentWorkspace = workspace
        await this.loadRecentWorkspaces()

        return workspace
      } catch (error) {
        this.errorMessage = getErrorMessage(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadRecentWorkspaces(): Promise<RecentWorkspace[]> {
      this.isLoadingRecentWorkspaces = true

      try {
        const recentWorkspaces = await window.kando.workspace.listRecent()
        this.recentWorkspaces = recentWorkspaces
        this.hasLoadedRecentWorkspaces = true

        return recentWorkspaces
      } catch (error) {
        this.errorMessage = getErrorMessage(error)
        throw error
      } finally {
        this.isLoadingRecentWorkspaces = false
      }
    }
  }
})
