<template>
  <main class="min-h-dvh">
    <div class="mx-auto max-w-3xl px-4 py-8">
      <Card class="border border-slate-200 shadow-sm">
        <CardHeader>
          <div class="space-y-2">
            <Badge variant="secondary">Create Workspace</Badge>
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Create a new workspace</h1>
            <p class="text-slate-600">Set workspace metadata and local path to initialize Kando artifacts.</p>
          </div>
        </CardHeader>

        <CardContent>
          <form class="space-y-5" @submit.prevent="createWorkspace">
            <div class="space-y-2">
              <label for="workspace-name" class="text-sm font-medium text-slate-700">Name</label>
              <Input
                id="workspace-name"
                v-model="form.name"
                :disabled="workspaceStore.isLoading"
                placeholder="Workspace name"
                required
              />
            </div>

            <div class="space-y-2">
              <label for="workspace-description" class="text-sm font-medium text-slate-700">Description</label>
              <Textarea
                id="workspace-description"
                v-model="form.description"
                :disabled="workspaceStore.isLoading"
                placeholder="Describe this workspace"
              />
            </div>

            <div class="space-y-2">
              <label for="workspace-path" class="text-sm font-medium text-slate-700">Path</label>
              <div class="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="workspace-path"
                  v-model="form.path"
                  class="w-full"
                  :disabled="workspaceStore.isLoading"
                  placeholder="E:\\Workspaces\\my-workspace"
                  required
                />
                <Button
                  variant="secondary"
                  type="button"
                  :disabled="workspaceStore.isLoading"
                  @click="pickFolder"
                >
                  Browse
                </Button>
              </div>
            </div>

            <p v-if="workspaceStore.errorMessage" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {{ workspaceStore.errorMessage }}
            </p>

            <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                type="button"
                :disabled="workspaceStore.isLoading"
                @click="goBack"
              >
                Back
              </Button>
              <Button type="submit" :loading="workspaceStore.isLoading" :disabled="workspaceStore.isLoading">
                Create Workspace
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { useWorkspaceStore } from '@renderer/stores/workspace'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const form = reactive({
  name: '',
  description: '',
  path: ''
})

const pickFolder = async (): Promise<void> => {
  workspaceStore.clearError()

  const selectedPath = await window.kando.workspace.pickFolder()

  if (selectedPath) {
    form.path = selectedPath
  }
}

const createWorkspace = async (): Promise<void> => {
  await workspaceStore.createWorkspace({
    name: form.name,
    description: form.description,
    path: form.path
  })

  await router.push({ name: 'workspace-dashboard' })
}

const goBack = async (): Promise<void> => {
  workspaceStore.clearError()
  await router.push({ name: 'welcome' })
}
</script>
