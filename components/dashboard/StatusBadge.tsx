import { cn } from '@/lib/utils'

export type StatusBadgeProps = {
  status: 'RUNNING' | 'STOPPED' | 'ERROR' | 'LOADING'
}

const STATUS_STYLES: Record<
  StatusBadgeProps['status'],
  { label: string; dot: string; text: string }
> = {
  RUNNING: {
    label: 'Running',
    dot: 'bg-emerald-400',
    text: 'text-emerald-200',
  },
  STOPPED: {
    label: 'Stopped',
    dot: 'bg-slate-500',
    text: 'text-slate-300',
  },
  ERROR: {
    label: 'Error',
    dot: 'bg-rose-400',
    text: 'text-rose-200',
  },
  LOADING: {
    label: 'Loading',
    dot: 'bg-cyan-400',
    text: 'text-cyan-200',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status]
  const isPulsing = status === 'RUNNING' || status === 'LOADING'

  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
      <span
        className={cn(
          'relative flex h-2.5 w-2.5 items-center justify-center rounded-full',
          styles.dot,
          isPulsing && 'animate-pulse'
        )}
      />
      <span className={styles.text}>{styles.label}</span>
    </span>
  )
}
