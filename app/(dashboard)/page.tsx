import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <p className="text-sm tracking-[0.2em] text-slate-500 uppercase">Overview</p>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Monitor your installed MCP servers and keep their status up to date.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-6xl">
        <DashboardClient />
      </div>
    </main>
  )
}
