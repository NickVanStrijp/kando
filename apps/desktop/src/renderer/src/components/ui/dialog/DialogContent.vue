<script setup lang="ts">
import { inject, onMounted, onUnmounted } from 'vue'
import { cn } from '@renderer/lib/utils'
import { DIALOG_CONTEXT_KEY } from './context'

interface DialogContentProps {
  class?: string
}

const props = defineProps<DialogContentProps>()

const context = inject(DIALOG_CONTEXT_KEY)

if (!context) {
  throw new Error('DialogContent must be used within Dialog.')
}

const closeDialog = (): void => {
  context.setOpen(false)
}

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && context.open.value) {
    context.setOpen(false)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="context.open.value" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-slate-900/45" @click="closeDialog" />

      <div class="relative flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          :class="cn('relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl', props.class)"
          @click.stop
        >
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
