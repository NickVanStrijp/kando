<template>
  <main class="min-h-dvh">
    <div class="mx-auto max-w-5xl px-4 py-8">
      <Card class="border border-slate-200 shadow-sm">
        <CardHeader>
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="space-y-2">
              <Badge variant="secondary">Workspace Dashboard</Badge>
              <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
                {{ workspace?.name ?? 'No workspace selected' }}
              </h1>
              <p class="text-slate-600">{{ workspace?.description || 'No description yet.' }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" @click="goToOpenWorkspace">
                Open Another
              </Button>
              <Button variant="ghost" size="sm" @click="goToWelcome">
                Home
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent class="space-y-6">
          <div v-if="workspace" class="space-y-6">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Workspace Path</p>
                <p class="mt-1 break-all text-sm text-slate-900">{{ workspace.path }}</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Created</p>
                <p class="mt-1 text-sm text-slate-900">{{ formatDate(workspace.createdAt) }}</p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Card
                v-for="section in sections"
                :key="section.title"
                class="border border-slate-200 bg-white"
              >
                <CardContent class="space-y-3 pt-6">
                  <div class="space-y-1">
                    <p class="text-base font-semibold text-slate-900">{{ section.title }}</p>
                    <p class="text-sm text-slate-600">{{ section.description }}</p>
                  </div>
                  <div class="flex items-center justify-between">
                    <Badge variant="outline">Planned</Badge>
                    <Button variant="ghost" size="sm" disabled>
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div v-else class="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm font-medium text-slate-700">No workspace is currently open.</p>
            <p class="text-sm text-slate-600">Create a new workspace or open an existing one to continue.</p>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" @click="goToCreateWorkspace">
                Create Workspace
              </Button>
              <Button variant="ghost" size="sm" @click="goToOpenWorkspace">
                Open Workspace
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader } from '@renderer/components/ui/card'
import { useWorkspaceStore } from '@renderer/stores/workspace'

interface DashboardSection {
  title: string
  description: string
}

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const workspace = computed(() => workspaceStore.currentWorkspace)

const sections: DashboardSection[] = [
  {
    title: 'Overview',
    description: 'Capture and refine the product context for this workspace.'
  },
  {
    title: 'PRDs',
    description: 'Define feature-level product requirements and goals.'
  },
  {
    title: 'Stories',
    description: 'Break PRDs into actionable user stories and acceptance criteria.'
  },
  {
    title: 'Tasks',
    description: 'Plan and track implementation and testing work.'
  },
  {
    title: 'Repos',
    description: 'Attach repositories and prepare repo-aware execution context.'
  },
  {
    title: 'Models',
    description: 'Set model routing for each workflow stage.'
  },
  {
    title: 'Settings',
    description: 'Manage workspace-level preferences and configuration.'
  }
]

const goToWelcome = async (): Promise<void> => {
  await router.push({ name: 'welcome' })
}

const goToCreateWorkspace = async (): Promise<void> => {
  workspaceStore.clearError()
  await router.push({ name: 'create-workspace' })
}

const goToOpenWorkspace = async (): Promise<void> => {
  workspaceStore.clearError()
  await router.push({ name: 'open-workspace' })
}

const formatDate = (isoDate: string): string => {
  const parsed = new Date(isoDate)
  return Number.isNaN(parsed.valueOf()) ? isoDate : parsed.toLocaleString()
}
</script>
