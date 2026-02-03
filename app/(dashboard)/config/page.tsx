import { ConfigManagerClient } from '@/components/config/ConfigManagerClient'

export default function ConfigPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <p className="text-sm tracking-[0.2em] text-slate-500 uppercase">Config Manager</p>
        <h1 className="text-3xl font-semibold">MCP Config Manager</h1>
        <p className="text-sm text-slate-400">
          Generate tool-specific MCP configuration files from your installed servers.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-6xl">
        <ConfigManagerClient />
      </div>
    </main>
  )
}
