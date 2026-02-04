import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Overview</p>
        <p className="text-sm text-slate-300">
          Monitor your installed MCP servers and keep their status up to date.
        </p>
      </div>
      <DashboardClient />
    </div>
  )
}
