<template>
  <main class="min-h-dvh">
    <div class="mx-auto min-h-dvh max-w-6xl px-6 py-10 sm:px-8">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <section class="space-y-8">
          <header class="space-y-4">
            <h1 class="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Welcome to Kando</h1>
            <p class="max-w-xl text-xl leading-relaxed text-slate-600">
              Create or open a workspace to start planning and building.
            </p>
          </header>

          <div class="flex flex-wrap gap-3">
            <Button class="gap-2" @click="openCreateDialog">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create Workspace
            </Button>
            <Button variant="outline" class="gap-2" @click="openOpenDialog">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
              Open Workspace
            </Button>
          </div>

          <div class="h-px w-full bg-slate-200" />

          <section class="space-y-4">
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Getting Started</h2>
            <ol class="space-y-3">
              <li class="flex items-start gap-3 text-lg text-slate-700">
                <span class="font-semibold text-slate-900">1.</span>
                <span>Create a new workspace or open an existing one</span>
              </li>
              <li class="flex items-start gap-3 text-lg text-slate-700">
                <span class="font-semibold text-slate-900">2.</span>
                <span>Define your product overview and requirements</span>
              </li>
              <li class="flex items-start gap-3 text-lg text-slate-700">
                <span class="font-semibold text-slate-900">3.</span>
                <span>Break down work into stories and track execution</span>
              </li>
            </ol>
          </section>
        </section>

        <aside class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div v-if="workspaceStore.isLoadingRecentWorkspaces && !workspaceStore.hasLoadedRecentWorkspaces" class="space-y-3">
            <p class="text-sm font-medium text-slate-700">Loading recent workspaces...</p>
            <div class="space-y-2">
              <div class="h-12 animate-pulse rounded-md bg-slate-100" />
              <div class="h-12 animate-pulse rounded-md bg-slate-100" />
              <div class="h-12 animate-pulse rounded-md bg-slate-100" />
            </div>
          </div>

          <div v-else-if="recentLoadError" class="space-y-3">
            <p class="text-sm font-semibold text-red-700">Could not load recent workspaces</p>
            <p class="text-sm text-red-600">{{ recentLoadError }}</p>
            <Button size="sm" variant="outline" @click="loadRecentWorkspaces">Retry</Button>
          </div>

          <div v-else-if="topRecentWorkspaces.length > 0" class="space-y-4">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-xl font-semibold tracking-tight text-slate-900">Recent Workspaces</h2>
              <Button size="sm" variant="ghost" :loading="workspaceStore.isLoadingRecentWorkspaces" @click="loadRecentWorkspaces">
                Refresh
              </Button>
            </div>

            <div class="space-y-3">
              <Card
                v-for="recent in topRecentWorkspaces"
                :key="recent.path"
                class="border border-slate-200 bg-slate-50"
              >
                <CardContent class="space-y-3 p-4">
                  <div class="space-y-1">
                    <p class="text-sm font-semibold text-slate-900">{{ recent.name }}</p>
                    <p class="break-all text-xs text-slate-600">{{ recent.path }}</p>
                    <p class="text-xs text-slate-500">Last opened: {{ formatDate(recent.lastOpenedAt) }}</p>
                  </div>
                  <Button size="sm" :disabled="workspaceStore.isLoading" @click="openRecentWorkspace(recent.path)">
                    Open
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div v-else class="flex min-h-80 flex-col items-center justify-center space-y-4 text-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
                <path d="M12 21v-9" />
                <path d="M20 7.5l-8 4.5-8-4.5" />
              </svg>
            </div>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">No workspaces yet</h2>
            <p class="max-w-xs text-lg text-slate-600">
              Create your first workspace to start planning and building your projects.
            </p>
          </div>
        </aside>
      </div>
    </div>

    <Dialog :open="isCreateDialogOpen" @update:open="onCreateDialogOpenChange">
      <DialogContent class="max-w-2xl p-0">
        <div class="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Set up a new workspace to start planning and building your project.
            </DialogDescription>
          </DialogHeader>

          <Button variant="ghost" size="icon" aria-label="Close create workspace modal" @click="closeDialog">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <form class="space-y-5 px-6 py-5" @submit.prevent="createWorkspace">
          <div class="space-y-2">
            <label for="workspace-name" class="text-sm font-medium text-slate-700">Workspace Name</label>
            <Input
              id="workspace-name"
              v-model="createForm.name"
              :disabled="workspaceStore.isLoading"
              placeholder="My Awesome Project"
              required
            />
          </div>

          <div class="space-y-2">
            <label for="workspace-description" class="text-sm font-medium text-slate-700">Description</label>
            <Textarea
              id="workspace-description"
              v-model="createForm.description"
              :disabled="workspaceStore.isLoading"
              placeholder="Brief description of your workspace..."
            />
          </div>

          <div class="space-y-2">
            <label for="workspace-path" class="text-sm font-medium text-slate-700">Path</label>
            <div class="flex gap-2">
              <Input
                id="workspace-path"
                v-model="createForm.path"
                class="w-full"
                :disabled="workspaceStore.isLoading"
                placeholder="E:\\Workspaces\\my-awesome-project"
                required
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                aria-label="Browse for workspace path"
                :disabled="workspaceStore.isLoading"
                @click="pickCreateFolder"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              </Button>
            </div>
            <p class="text-sm text-slate-500">Select a local folder path for this workspace.</p>
          </div>

          <p v-if="workspaceStore.errorMessage" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ workspaceStore.errorMessage }}
          </p>

          <DialogFooter class="pt-1 sm:justify-end">
            <Button variant="ghost" type="button" :disabled="workspaceStore.isLoading" @click="closeDialog">
              Cancel
            </Button>
            <Button type="submit" :loading="workspaceStore.isLoading" :disabled="workspaceStore.isLoading">
              Create Workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog :open="isOpenDialogOpen" @update:open="onOpenDialogOpenChange">
      <DialogContent class="max-w-3xl p-0">
        <div class="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <DialogHeader>
            <DialogTitle>Open Workspace</DialogTitle>
            <DialogDescription>
              Open a workspace by path or select one from your recent workspaces.
            </DialogDescription>
          </DialogHeader>

          <Button variant="ghost" size="icon" aria-label="Close open workspace modal" @click="closeDialog">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div class="space-y-6 px-6 py-5">
          <div class="space-y-2">
            <label for="open-workspace-path" class="text-sm font-medium text-slate-700">Workspace Path</label>
            <div class="flex flex-col gap-2 sm:flex-row">
              <Input
                id="open-workspace-path"
                v-model="openWorkspacePath"
                class="w-full"
                :disabled="workspaceStore.isLoading"
                placeholder="E:\\Workspaces\\existing-workspace"
              />
              <Button variant="outline" type="button" :disabled="workspaceStore.isLoading" @click="pickOpenFolder">
                Browse
              </Button>
              <Button
                type="button"
                :loading="workspaceStore.isLoading"
                :disabled="workspaceStore.isLoading || !canOpenByPath"
                @click="openWorkspaceByPath"
              >
                Open
              </Button>
            </div>
          </div>

          <p
            v-if="workspaceStore.errorMessage"
            class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {{ workspaceStore.errorMessage }}
          </p>

          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent Workspaces</h3>
              <Button
                size="sm"
                variant="ghost"
                :loading="workspaceStore.isLoadingRecentWorkspaces"
                :disabled="workspaceStore.isLoading"
                @click="loadRecentWorkspaces"
              >
                Refresh
              </Button>
            </div>

            <div
              v-if="workspaceStore.isLoadingRecentWorkspaces && !workspaceStore.hasLoadedRecentWorkspaces"
              class="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600"
            >
              Loading recent workspaces...
            </div>

            <div
              v-else-if="workspaceStore.recentWorkspaces.length === 0"
              class="space-y-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-4"
            >
              <p class="text-sm font-medium text-slate-700">No recent workspaces yet</p>
              <p class="text-sm text-slate-600">Create your first workspace, then it will appear here.</p>
              <Button size="sm" @click="openCreateDialog">
                Create Workspace
              </Button>
            </div>

            <div v-else class="max-h-72 space-y-2 overflow-y-auto pr-1">
              <Card
                v-for="recent in workspaceStore.recentWorkspaces"
                :key="recent.path"
                class="border border-slate-200 bg-white"
              >
                <CardContent class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div class="space-y-1">
                    <p class="text-sm font-semibold text-slate-900">{{ recent.name }}</p>
                    <p class="break-all text-xs text-slate-600">{{ recent.path }}</p>
                    <p class="text-xs text-slate-500">Last opened: {{ formatDate(recent.lastOpenedAt) }}</p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      :disabled="workspaceStore.isLoading"
                      @click="useRecentPath(recent.path)"
                    >
                      Use Path
                    </Button>
                    <Button size="sm" :disabled="workspaceStore.isLoading" @click="openRecentWorkspace(recent.path)">
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter class="sm:justify-between">
            <Button variant="ghost" type="button" :disabled="workspaceStore.isLoading" @click="openCreateDialog">
              Create Workspace Instead
            </Button>
            <Button variant="ghost" type="button" :disabled="workspaceStore.isLoading" @click="closeDialog">
              Cancel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { useWorkspaceStore } from '@renderer/stores/workspace'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const createForm = reactive({
  name: '',
  description: '',
  path: ''
})

const openWorkspacePath = ref('')
const recentLoadError = ref('')

const isCreateDialogOpen = computed(() => route.name === 'create-workspace')
const isOpenDialogOpen = computed(() => route.name === 'open-workspace')
const canOpenByPath = computed(() => openWorkspacePath.value.trim().length > 0)
const topRecentWorkspaces = computed(() => workspaceStore.recentWorkspaces.slice(0, 5))

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong while loading recent workspaces.'
}

const formatDate = (isoDate: string): string => {
  const parsed = new Date(isoDate)
  return Number.isNaN(parsed.valueOf()) ? isoDate : parsed.toLocaleString()
}

const loadRecentWorkspaces = async (): Promise<void> => {
  recentLoadError.value = ''

  try {
    await workspaceStore.loadRecentWorkspaces()
  } catch (error) {
    recentLoadError.value = getErrorMessage(error)
  }
}

const closeDialog = async (): Promise<void> => {
  workspaceStore.clearError()

  if (route.name !== 'welcome') {
    await router.replace({ name: 'welcome' })
  }
}

const openCreateDialog = async (): Promise<void> => {
  workspaceStore.clearError()
  await router.push({ name: 'create-workspace' })
}

const openOpenDialog = async (): Promise<void> => {
  workspaceStore.clearError()
  await router.push({ name: 'open-workspace' })
}

const onCreateDialogOpenChange = (open: boolean): void => {
  if (!open) {
    void closeDialog()
  }
}

const onOpenDialogOpenChange = (open: boolean): void => {
  if (!open) {
    void closeDialog()
  }
}

const pickCreateFolder = async (): Promise<void> => {
  workspaceStore.clearError()

  const selectedPath = await window.kando.workspace.pickFolder()

  if (selectedPath) {
    createForm.path = selectedPath
  }
}

const pickOpenFolder = async (): Promise<void> => {
  workspaceStore.clearError()

  const selectedPath = await window.kando.workspace.pickFolder()

  if (selectedPath) {
    openWorkspacePath.value = selectedPath
  }
}

const createWorkspace = async (): Promise<void> => {
  await workspaceStore.createWorkspace({
    name: createForm.name,
    description: createForm.description,
    path: createForm.path
  })

  await router.push({ name: 'workspace-dashboard' })
}

const openWorkspace = async (path: string): Promise<void> => {
  await workspaceStore.openWorkspace(path.trim())
  await router.push({ name: 'workspace-dashboard' })
}

const openWorkspaceByPath = async (): Promise<void> => {
  if (!canOpenByPath.value) {
    return
  }

  await openWorkspace(openWorkspacePath.value)
}

const useRecentPath = (path: string): void => {
  workspaceStore.clearError()
  openWorkspacePath.value = path
}

const openRecentWorkspace = async (path: string): Promise<void> => {
  await openWorkspace(path)
}

watch(isOpenDialogOpen, (isOpen) => {
  if (isOpen) {
    void loadRecentWorkspaces()
  }
})

onMounted(async () => {
  await loadRecentWorkspaces()
})
</script>
