import { MonitorClient } from '@/components/monitor/MonitorClient'

export default function MonitorPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm tracking-[0.2em] text-slate-500 uppercase">Monitor</p>
        <p className="text-sm text-slate-400">
          Real-time health telemetry across every installed MCP server.
        </p>
      </div>
      <MonitorClient />
    </div>
  )
}
