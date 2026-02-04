import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300/60 focus:ring-offset-2 focus:ring-offset-slate-950',
  {
    variants: {
      variant: {
        default: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25',
        secondary: 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
        destructive: 'border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
        outline: 'border-white/10 text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
