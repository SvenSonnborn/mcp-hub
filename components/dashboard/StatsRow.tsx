import { AlertTriangle, PauseCircle, PlayCircle, Server } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type StatsRowProps = {
  total: number
  running: number
  stopped: number
  errors: number
}

const statCards = [
  {
    key: 'total',
    label: 'Total Installations',
    icon: Server,
  },
  {
    key: 'running',
    label: 'Running Servers',
    icon: PlayCircle,
  },
  {
    key: 'stopped',
    label: 'Stopped Servers',
    icon: PauseCircle,
  },
  {
    key: 'errors',
    label: 'Errors',
    icon: AlertTriangle,
  },
] as const

export function StatsRow({ total, running, stopped, errors }: StatsRowProps) {
  const values = { total, running, stopped, errors }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        const value = values[stat.key]
        const isError = stat.key === 'errors' && value > 0

        return (
          <Card
            key={stat.key}
            className={cn(
              'p-5 shadow-none transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]',
              isError && 'border-rose-500/40'
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-[0.3em] text-slate-400 uppercase">{stat.label}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-3xl font-semibold text-slate-100">{value}</span>
                  {isError ? (
                    <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-200">
                      Needs attention
                    </span>
                  ) : null}
                </div>
              </div>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5',
                  isError ? 'border-rose-500/40 text-rose-300' : 'text-cyan-200'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
