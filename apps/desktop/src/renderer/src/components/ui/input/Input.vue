<script setup lang="ts">
interface InputProps {
  modelValue?: string
  type?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text'
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const onInput = (event: Event): void => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    :type="props.type"
    :value="props.modelValue"
    class="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
    @input="onInput"
  >
</template>
