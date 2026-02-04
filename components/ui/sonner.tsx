'use client'

import * as React from 'react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      richColors
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast border border-white/10 bg-slate-950/90 text-slate-100 backdrop-blur-xl',
          description: 'text-slate-400',
          actionButton: 'bg-cyan-400 text-slate-950',
          cancelButton: 'bg-white/10 text-slate-200',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
