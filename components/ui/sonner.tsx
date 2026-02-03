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
          toast: 'group toast bg-slate-950 text-slate-100 border border-slate-800',
          description: 'text-slate-400',
          actionButton: 'bg-violet-600 text-white',
          cancelButton: 'bg-slate-800 text-slate-200',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
