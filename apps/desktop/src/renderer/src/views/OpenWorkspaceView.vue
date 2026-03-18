<template>
  <main class="min-h-dvh">
    <div class="mx-auto max-w-4xl px-4 py-8">
      <Card class="border border-slate-200 shadow-sm">
        <CardHeader>
          <div class="space-y-2">
            <Badge variant="secondary">Open Workspace</Badge>
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Open an existing workspace</h1>
            <p class="text-slate-600">Choose from recent workspaces or open one by local path.</p>
          </div>
        </CardHeader>

        <CardContent class="space-y-6">
          <div class="space-y-2">
            <label for="workspace-path" class="text-sm font-medium text-slate-700">Workspace path</label>
            <div class="flex flex-col gap-2 sm:flex-row">
              <Input
                id="workspace-path"
                v-model="workspacePath"
                class="w-full"
                :disabled="workspaceStore.isLoading"
                placeholder="E:\\Workspaces\\existing-workspace"
              />
              <Button
                variant="secondary"
                type="button"
                :disabled="workspaceStore.isLoading"
                @click="pickFolder"
              >
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
            <p class="text-xs text-slate-500">Tip: You can paste a path or select a folder.</p>
          </div>

          <div
            v-if="workspaceStore.errorMessage"
            class="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3"
            role="alert"
          >
            <p class="text-sm font-medium text-red-800">Could not open workspace</p>
            <p class="text-sm text-red-700">{{ workspaceStore.errorMessage }}</p>
            <div class="flex justify-end">
              <Button variant="destructive" size="sm" @click="workspaceStore.clearError()">
                Dismiss
              </Button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent Workspaces</h2>
              <Button
                variant="ghost"
                size="sm"
                :loading="workspaceStore.isLoadingRecentWorkspaces"
                :disabled="workspaceStore.isLoading"
                @click="loadRecent"
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
              <div class="flex flex-wrap gap-2">
                <Button size="sm" @click="goToCreateWorkspace">
                  Create Workspace
                </Button>
                <Button variant="ghost" size="sm" @click="pickFolder">
                  Browse Folder
                </Button>
              </div>
            </div>

            <div v-else class="space-y-2">
              <Card
                v-for="recent in workspaceStore.recentWorkspaces"
                :key="recent.path"
                class="border border-slate-200 bg-white"
              >
                <CardContent class="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
                    <Button
                      size="sm"
                      :disabled="workspaceStore.isLoading"
                      @click="openRecentWorkspace(recent.path)"
                    >
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>

        <CardFooter class="justify-end">
          <Button variant="ghost" :disabled="workspaceStore.isLoading" @click="goBack">
            Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { useWorkspaceStore } from '@renderer/stores/workspace'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const workspacePath = ref('')

const canOpenByPath = computed(() => workspacePath.value.trim().length > 0)

const formatDate = (isoDate: string): string => {
  const parsed = new Date(isoDate)
  return Number.isNaN(parsed.valueOf()) ? isoDate : parsed.toLocaleString()
}

const loadRecent = async (): Promise<void> => {
  try {
    await workspaceStore.loadRecentWorkspaces()
  } catch {
    // Surface handled through store error state.
  }
}

const pickFolder = async (): Promise<void> => {
  workspaceStore.clearError()

  const selectedPath = await window.kando.workspace.pickFolder()

  if (selectedPath) {
    workspacePath.value = selectedPath
  }
}

const openWorkspace = async (path: string): Promise<void> => {
  await workspaceStore.openWorkspace(path.trim())
  await router.push({ name: 'workspace-dashboard' })
}

const openWorkspaceByPath = async (): Promise<void> => {
  if (!canOpenByPath.value) {
    return
  }

  await openWorkspace(workspacePath.value)
}

const useRecentPath = (path: string): void => {
  workspaceStore.clearError()
  workspacePath.value = path
}

const openRecentWorkspace = async (path: string): Promise<void> => {
  await openWorkspace(path)
}

const goToCreateWorkspace = async (): Promise<void> => {
  workspaceStore.clearError()
  await router.push({ name: 'create-workspace' })
}

const goBack = async (): Promise<void> => {
  workspaceStore.clearError()
  await router.push({ name: 'welcome' })
}

onMounted(async () => {
  await loadRecent()
})
</script>
