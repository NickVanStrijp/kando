import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-slate-900 text-white',
        secondary: 'border-transparent bg-slate-100 text-slate-900',
        outline: 'border-slate-300 text-slate-900',
        destructive: 'border-transparent bg-red-600 text-white'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant']
