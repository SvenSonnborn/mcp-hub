import { Skeleton } from '@/components/ui/skeleton'

export default function MonitorPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm tracking-[0.2em] text-slate-500 uppercase">Monitor</p>
        <p className="text-sm text-slate-400">
          Live health telemetry will appear here once your servers report metrics.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
        Waiting for health monitor data. Check back after enabling the monitor in your MCP server.
      </div>
    </div>
  )
}
