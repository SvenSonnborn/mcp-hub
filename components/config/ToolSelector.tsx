import type { ElementType } from 'react'
import { Info, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToolOption = {
  id: string
  label: string
  description: string
  location: string
  icon: ElementType
}

type ToolSelectorProps = {
  options: ToolOption[]
  selected: string
  onChange: (id: string) => void
}

export function ToolSelector({ options, selected, onChange }: ToolSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Tool presets</h2>
          <p className="text-xs text-slate-400">Pick the config format you need.</p>
        </div>
        <div className="group relative flex items-center text-slate-400">
          <Info className="h-4 w-4" />
          <div className="pointer-events-none absolute top-6 right-0 z-10 w-56 rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2 text-xs text-slate-200 opacity-0 shadow-xl backdrop-blur-xl transition group-hover:opacity-100">
            Each tool expects its config in a different location. Hover a card to see the path.
          </div>
        </div>
      </div>
      <div role="radiogroup" className="space-y-3">
        {options.map((option) => {
          const Icon = option.icon
          const isActive = selected === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.id)}
              className={cn(
                'group relative flex w-full items-start gap-3 rounded-3xl border bg-white/5 p-4 text-left backdrop-blur-2xl transition-all',
                isActive
                  ? 'border-cyan-400/60 bg-white/10 shadow-[0_0_25px_rgba(34,211,238,0.2)]'
                  : 'border-white/10 hover:border-cyan-400/30 hover:bg-white/10'
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-200">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  {option.label}
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-200">
                      <Check className="h-3 w-3" />
                      Selected
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-xs text-slate-400">{option.description}</span>
                <span className="mt-3 block text-[11px] text-slate-500">
                  <span className="mr-1 text-slate-400">Config path:</span>
                  {option.location}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
