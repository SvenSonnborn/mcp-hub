import { Suspense } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { getAllServers, getAllTags } from '@/lib/data'
import { ServerGrid } from '@/app/components/server-grid'
import { Skeleton } from '@/components/ui/skeleton'

export default function RegistryPage() {
  const servers = getAllServers()
  const tags = getAllTags()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Registry</p>
        <p className="text-sm text-slate-300">
          Browse official MCP servers and jump into the install details.
        </p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-[0_0_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-40 rounded-3xl" />
                ))}
              </div>
            </div>
          }
        >
          <NuqsAdapter>
            <ServerGrid initialServers={servers} allTags={tags} />
          </NuqsAdapter>
        </Suspense>
      </div>
    </div>
  )
}
