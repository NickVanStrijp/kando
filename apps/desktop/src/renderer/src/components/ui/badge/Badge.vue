<script setup lang="ts">
import { badgeVariants, type BadgeVariant } from './styles'
import { cn } from '@renderer/lib/utils'

interface BadgeProps {
  variant?: BadgeVariant
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default'
})
</script>

<template>
  <span :class="cn(badgeVariants({ variant: props.variant }))">
    <slot />
  </span>
</template>
