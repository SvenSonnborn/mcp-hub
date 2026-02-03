'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <div className="max-w-md space-y-4">
        <p className="text-sm tracking-[0.3em] text-slate-500 uppercase">Error</p>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-slate-400">
          An unexpected error occurred. Try again, and if the issue persists, check the logs.
        </p>
        <Button onClick={reset} className="bg-violet-600 text-white hover:bg-violet-500">
          Retry
        </Button>
      </div>
    </div>
  )
}
