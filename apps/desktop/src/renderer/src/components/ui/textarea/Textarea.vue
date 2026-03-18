<script setup lang="ts">
interface TextareaProps {
  modelValue?: string
}

const props = withDefaults(defineProps<TextareaProps>(), {
  modelValue: ''
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const onInput = (event: Event): void => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <textarea
    :value="props.modelValue"
    class="flex min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
    @input="onInput"
  />
</template>
