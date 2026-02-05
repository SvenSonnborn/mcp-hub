import Link from 'next/link'
import { SubmitServerForm } from '@/components/registry/SubmitServerForm'

export default function SubmitServerPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Submit Server</p>
          <p className="text-sm text-slate-300">Share your MCP server with the community.</p>
        </div>
        <Link
          href="/registry"
          className="text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to Registry
        </Link>
      </div>
      <SubmitServerForm />
    </div>
  )
}
