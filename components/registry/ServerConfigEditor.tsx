'use client'

import { useMemo, useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ServerConfigEditorProps = {
  installationId: string
  initialConfig: Record<string, unknown>
}

export function ServerConfigEditor({ installationId, initialConfig }: ServerConfigEditorProps) {
  const initialValue = useMemo(() => JSON.stringify(initialConfig ?? {}, null, 2), [initialConfig])
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const hasChanges = value.trim() !== initialValue.trim()

  const handleReset = () => {
    setValue(initialValue)
    setError(null)
  }

  const handleSave = async () => {
    if (!installationId) return
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(value)
      setError(null)
    } catch (err) {
      setError('Invalid JSON. Fix syntax before saving.')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/installations/${installationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: parsed }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to update config')
      }
      toast.success('Configuration saved')
    } catch (err) {
      toast.error('Config update failed', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Configuration</p>
          <p className="mt-2 text-sm text-slate-300">
            Update runtime settings for this MCP server. Save to apply changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className={cn('h-4 w-4', isSaving && 'animate-pulse')} />
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          spellCheck={false}
          className="min-h-[240px] w-full resize-y bg-transparent font-mono text-sm text-slate-100 outline-none"
        />
      </div>
      <div className="mt-3 text-xs text-slate-400">
        {error ? (
          <span className="text-rose-200">{error}</span>
        ) : hasChanges ? (
          'Unsaved changes'
        ) : (
          'Config is up to date'
        )}
      </div>
    </div>
  )
}
