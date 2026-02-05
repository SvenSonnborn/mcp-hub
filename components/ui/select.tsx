import * as React from 'react'
import { cn } from '@/lib/utils'

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-base text-slate-100 shadow-sm backdrop-blur-2xl transition-colors focus-visible:border-cyan-400/60 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        {...props}
      />
    )
  }
)

Select.displayName = 'Select'

export { Select }
