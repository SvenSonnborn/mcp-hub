'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bot, MousePointer2, Wind, Boxes, Info } from 'lucide-react'
import { ToolSelector, type ToolOption } from '@/components/config/ToolSelector'
import { ConfigPreview } from '@/components/config/ConfigPreview'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ToolId } from '@/lib/config-generator'

type ConfigResponse = {
  tool: string
  includeStopped: boolean
  count: number
  valid: boolean
  config: Record<string, unknown>
}

const TOOL_OPTIONS: ToolOption[] = [
  {
    id: 'claude',
    label: 'Claude Desktop',
    description: 'Optimized for the Claude Desktop client.',
    location: '~/Library/Application Support/Claude/claude_desktop_config.json',
    icon: Bot,
  },
  {
    id: 'cursor',
    label: 'Cursor',
    description: 'Sync with Cursor editor MCP support.',
    location: '~/.cursor/mcp.json',
    icon: MousePointer2,
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    description: 'Windsurf-compatible MCP config file.',
    location: '~/.windsurf/mcp.json',
    icon: Wind,
  },
  {
    id: 'generic',
    label: 'Generic MCP',
    description: 'Standard MCP config used by other clients.',
    location: './mcp.json',
    icon: Boxes,
  },
]

export function ConfigManagerClient() {
  const [selectedTool, setSelectedTool] = useState('claude')
  const [includeStopped, setIncludeStopped] = useState(false)
  const [data, setData] = useState<ConfigResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/config?tool=${selectedTool}&includeStopped=${includeStopped ? '1' : '0'}`
        )
        if (!response.ok) {
          throw new Error('Failed to load config')
        }
        const payload: ConfigResponse = await response.json()
        if (isMounted) {
          setData(payload)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load config')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [selectedTool, includeStopped])

  const selectedOption = useMemo(
    () => TOOL_OPTIONS.find((option) => option.id === selectedTool),
    [selectedTool]
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="space-y-6">
        <ToolSelector options={TOOL_OPTIONS} selected={selectedTool} onChange={setSelectedTool} />
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Include stopped servers</h3>
              <p className="text-xs text-slate-400">Toggle to export stopped installations.</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={includeStopped}
                onChange={(event) => setIncludeStopped(event.target.checked)}
              />
              <div className="h-6 w-11 rounded-full border border-white/10 bg-white/5 peer-checked:border-cyan-400/40 peer-checked:bg-cyan-400/60 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-slate-400 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-slate-950" />
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
            <span>Detected installations</span>
            <span className="font-semibold text-slate-100">{data?.count ?? 0}</span>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400 backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-slate-200">
            <p className="font-semibold">Config location</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center">
                    <Info className="h-3.5 w-3.5 text-slate-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Paste the generated JSON into the tool-specific config file shown here.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="mt-2 text-slate-400">{selectedOption?.location ?? 'mcp.json'}</p>
          <p className="mt-3 text-slate-500">
            Use the Copy button or download the file to the location above.
          </p>
        </div>
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Config preview</h2>
            <p className="text-sm text-slate-400">
              Generated from {data?.count ?? 0} installation{data?.count === 1 ? '' : 's'}.
            </p>
          </div>
          <div
            className={cn(
              'rounded-full border px-3 py-1 text-xs',
              isLoading
                ? 'border-white/10 text-slate-400'
                : error
                  ? 'border-rose-500/40 text-rose-200'
                  : 'border-emerald-500/40 text-emerald-200'
            )}
          >
            {isLoading ? 'Updating...' : error ? 'Needs attention' : 'Ready to copy'}
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-100">
            {error}
          </div>
        ) : (
          <ConfigPreview
            config={data?.config ?? {}}
            isValid={data?.valid ?? true}
            title={selectedOption?.label ?? 'Generated config'}
            tool={selectedTool as ToolId}
          />
        )}
      </div>
    </div>
  )
}
