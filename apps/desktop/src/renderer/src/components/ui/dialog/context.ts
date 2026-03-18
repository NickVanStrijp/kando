import type { InjectionKey, Ref } from 'vue'

export interface DialogContext {
  open: Readonly<Ref<boolean>>
  setOpen: (open: boolean) => void
}

export const DIALOG_CONTEXT_KEY: InjectionKey<DialogContext> = Symbol('dialog-context')
