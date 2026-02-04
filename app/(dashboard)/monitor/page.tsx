import { MonitorClient } from '@/components/monitor/MonitorClient'

export default function MonitorPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Monitor</p>
        <p className="text-sm text-slate-300">
          Real-time health telemetry across every installed MCP server.
        </p>
      </div>
      <MonitorClient />
    </div>
  )
}
