import { ConfigManagerClient } from '@/components/config/ConfigManagerClient'

export default function ConfigPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Config Manager</p>
        <p className="text-sm text-slate-300">
          Generate tool-specific MCP configuration files from your installed servers.
        </p>
      </div>
      <ConfigManagerClient />
    </div>
  )
}
