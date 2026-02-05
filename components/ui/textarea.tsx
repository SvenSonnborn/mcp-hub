import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-base text-slate-100 shadow-sm backdrop-blur-2xl transition-colors placeholder:text-slate-500 focus-visible:border-cyan-400/60 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
