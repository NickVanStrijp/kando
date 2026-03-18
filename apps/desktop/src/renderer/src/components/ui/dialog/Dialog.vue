<script setup lang="ts">
import { computed, provide } from 'vue'
import { DIALOG_CONTEXT_KEY } from './context'

interface DialogProps {
  open?: boolean
}

const props = withDefaults(defineProps<DialogProps>(), {
  open: false
})

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

const open = computed(() => props.open)

const setOpen = (value: boolean): void => {
  if (value !== props.open) {
    emit('update:open', value)
  }
}

provide(DIALOG_CONTEXT_KEY, {
  open,
  setOpen
})
</script>

<template>
  <slot />
</template>
