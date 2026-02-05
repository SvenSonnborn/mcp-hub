'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type DialogContextValue = {
  open: boolean
  onOpenChange?: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

type DialogProps = {
  open: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
}

const useDialogContext = () => {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error('Dialog components must be used within <Dialog>.')
  }
  return context
}

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = useDialogContext()

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => onOpenChange?.(false)}
        />
        <div
          ref={ref}
          className={cn(
            'relative z-10 w-[95vw] max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 text-slate-100 shadow-2xl',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    )
  }
)
DialogContent.displayName = 'DialogContent'

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-white', className)} {...props} />
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-slate-400', className)} {...props} />
}
