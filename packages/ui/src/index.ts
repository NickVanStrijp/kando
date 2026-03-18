import { defineComponent, h } from 'vue'

export const KandoShellSection = defineComponent({
  name: 'KandoShellSection',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'section',
        {
          ...attrs,
          class: ['rounded-2xl border border-slate-800/90 bg-slate-900/70 p-8 shadow-2xl backdrop-blur', attrs.class]
        },
        [
          h('h1', { class: 'mb-3 text-3xl font-semibold text-slate-50' }, props.title),
          slots.default?.()
        ]
      )
  }
})