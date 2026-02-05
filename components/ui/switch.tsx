'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type SwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'inline-flex h-5 w-9 items-center rounded-full border border-white/20 transition-colors',
        checked ? 'bg-cyan-500/80' : 'bg-white/10',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform',
          checked && 'translate-x-4'
        )}
      />
    </button>
  )
)
Switch.displayName = 'Switch'
