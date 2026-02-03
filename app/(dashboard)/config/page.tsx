import { ConfigManagerClient } from '@/components/config/ConfigManagerClient'

export default function ConfigPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm tracking-[0.2em] text-slate-500 uppercase">Config Manager</p>
        <p className="text-sm text-slate-400">
          Generate tool-specific MCP configuration files from your installed servers.
        </p>
      </div>
      <ConfigManagerClient />
    </div>
  )
}
