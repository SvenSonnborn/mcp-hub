'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { InstalledCard, type Installation } from './InstalledCard'
import { StatsRow } from './StatsRow'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

async function fetchInstallations(): Promise<Installation[]> {
  const response = await fetch('/api/installations')
  if (!response.ok) {
    throw new Error('Failed to load installations')
  }
  const data = await response.json()
  return data.installations
}

function DashboardContent() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['installations'],
    queryFn: fetchInstallations,
    refetchInterval: 5000,
  })

  const installations = data ?? []
  const stats = useMemo(() => {
    const total = installations.length
    const running = installations.filter((item) => item.status === 'RUNNING').length
    const stopped = installations.filter((item) => item.status === 'STOPPED').length
    const errors = installations.filter((item) => item.status === 'ERROR').length
    return { total, running, stopped, errors }
  }, [installations])

  const updateStatus = async (id: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const response = await fetch(`/api/installations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!response.ok) {
        throw new Error('Status update failed')
      }
      const verb = action === 'restart' ? 'Restarted' : action === 'start' ? 'Started' : 'Stopped'
      toast.success(`Server ${verb.toLowerCase()}`, {
        description: `Action confirmed: ${verb}.`,
      })
    } catch (error) {
      toast.error('Unable to update server status', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      queryClient.invalidateQueries({ queryKey: ['installations'] })
    }
  }

  return (
    <div className="space-y-6">
      <StatsRow {...stats} />
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-3xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-3xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-12 text-center text-rose-100 backdrop-blur-2xl">
          <p>Unable to load installations.</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : installations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-16 text-center backdrop-blur-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300">
            <span className="text-lg">+</span>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-100">No servers installed</h3>
          <p className="mt-2 text-sm text-slate-400">
            Install a server from the registry to start monitoring it here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/registry">Browse Registry</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {installations.map((installation) => (
            <InstalledCard
              key={installation.id}
              installation={installation}
              onAction={updateStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function DashboardClient() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  )
}
