import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm tracking-[0.2em] text-slate-500 uppercase">Overview</p>
        <p className="text-sm text-slate-400">
          Monitor your installed MCP servers and keep their status up to date.
        </p>
      </div>
      <DashboardClient />
    </div>
  )
}
