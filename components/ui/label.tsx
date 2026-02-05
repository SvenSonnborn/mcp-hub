import * as React from 'react'
import { cn } from '@/lib/utils'

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('text-xs tracking-[0.3em] text-cyan-300 uppercase', className)}
        {...props}
      />
    )
  }
)

Label.displayName = 'Label'

export { Label }
