'use client'

import { useMemo, useState } from 'react'
import { FileText, RotateCw, Settings, Square, Play } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { cn } from '@/lib/utils'

export type Installation = {
  id: string
  status: string
  lastPing: string | null
  errorLog: string | null
  server: {
    id: string
    name: string
    version: string
  }
}

export type InstalledCardProps = {
  installation: Installation
  onAction: (id: string, action: 'start' | 'stop' | 'restart') => void
}

function formatRelativeTime(isoDate: string | null) {
  if (!isoDate) return 'Never'
  const date = new Date(isoDate)
  const diffMs = Date.now() - date.getTime()
  const diffSeconds = Math.max(0, Math.round(diffMs / 1000))
  const minutes = Math.round(diffSeconds / 60)
  const hours = Math.round(diffSeconds / 3600)
  const days = Math.round(diffSeconds / 86400)

  if (diffSeconds < 60) return `${diffSeconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function resolveStatus(status: string): 'RUNNING' | 'STOPPED' | 'ERROR' | 'LOADING' {
  if (status === 'RUNNING') return 'RUNNING'
  if (status === 'STOPPED') return 'STOPPED'
  if (status === 'ERROR') return 'ERROR'
  return 'LOADING'
}

export function InstalledCard({ installation, onAction }: InstalledCardProps) {
  const [showLogs, setShowLogs] = useState(false)
  const status = resolveStatus(installation.status)
  const logLines = useMemo(() => {
    const logs = installation.errorLog?.split('\n') ?? []
    if (logs.length === 0) return []
    return logs.slice(-50)
  }, [installation.errorLog])

  return (
    <Card className="border-slate-800 bg-slate-900/80 p-5 shadow-none transition hover:bg-slate-800/50">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <StatusBadge status={status} />
          <h3 className="mt-3 text-lg font-semibold text-slate-100">{installation.server.name}</h3>
          <p className="mt-1 text-sm text-slate-400">Version {installation.server.version}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'text-slate-300 hover:bg-slate-800',
              status === 'RUNNING' && 'text-emerald-200'
            )}
            onClick={() => onAction(installation.id, 'start')}
            aria-label="Start server"
          >
            <Play />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-slate-800"
            onClick={() => onAction(installation.id, 'stop')}
            aria-label="Stop server"
          >
            <Square />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-slate-800"
            onClick={() => onAction(installation.id, 'restart')}
            aria-label="Restart server"
          >
            <RotateCw />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-slate-800"
            aria-label="Open settings"
          >
            <Settings />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn('text-slate-300 hover:bg-slate-800', showLogs && 'text-violet-200')}
            aria-label="Toggle logs"
            onClick={() => setShowLogs((prev) => !prev)}
          >
            <FileText />
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>Last ping</span>
        <span className="text-slate-200">{formatRelativeTime(installation.lastPing)}</span>
      </div>
      {showLogs ? (
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Recent Logs
          </p>
          {logLines.length > 0 ? (
            <pre className="mt-3 max-h-48 overflow-auto text-xs text-slate-200">
              {logLines.join('\n')}
            </pre>
          ) : (
            <p className="mt-3 text-xs text-slate-500">No logs captured.</p>
          )}
        </div>
      ) : null}
    </Card>
  )
}
