<script setup lang="ts">
import { computed } from 'vue'
import { buttonVariants, type ButtonSize, type ButtonVariant } from './styles'
import { cn } from '@renderer/lib/utils'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'default',
  loading: false,
  disabled: false,
  type: 'button'
})

const isDisabled = computed(() => props.loading || props.disabled)
</script>

<template>
  <button :type="props.type" :disabled="isDisabled" :class="cn(buttonVariants({ variant: props.variant, size: props.size }))">
    <svg
      v-if="props.loading"
      class="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </button>
</template>
