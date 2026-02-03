import type { MCPInstallation } from '@prisma/client'

export type HealthMetrics = {
  installationId: string
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE'
  uptimeSeconds: number
  avgResponseMs: number
  requestsPerMin: number
  errorRate: number
  lastPing: string | null
  updatedAt: string
}

export type HealthLog = {
  id: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
  source: string
}

const LOG_MESSAGES = [
  'Metrics flush complete.',
  'Background task finished successfully.',
  'Connection pool healthy.',
  'Heartbeat acknowledged.',
  'Cache warmed for active routes.',
  'Latency spike detected, recovering.',
  'Retrying upstream request.',
  'Slow query detected, optimizing.',
  'Worker restarted after backoff.',
  'Memory usage trending upward.',
  'Rate limit nearing threshold.',
  'Request failed with timeout.',
]

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000
  }
  return hash
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function buildHealthMetrics(installation: MCPInstallation) {
  const seed = hashString(installation.id)
  const tick = Math.floor(Date.now() / 60000)
  const jitter = seededRandom(seed + tick)
  const running = installation.status === 'RUNNING'

  const baseUptime = installation.createdAt
    ? Math.round((Date.now() - installation.createdAt.getTime()) / 1000)
    : 0
  const uptimeSeconds = running ? Math.max(baseUptime, 120) : 0

  const avgResponseMs = Math.round(80 + jitter * 140 + (running ? 0 : 40))
  const requestsPerMin = Math.round((running ? 180 : 40) + jitter * 120)
  const errorRate = clamp(
    (installation.status === 'ERROR' ? 6 : running ? 0.6 : 2.2) + jitter * 1.6,
    0.1,
    12
  )

  const status: HealthMetrics['status'] = !running
    ? 'OFFLINE'
    : errorRate > 4
      ? 'DEGRADED'
      : 'HEALTHY'

  return {
    installationId: installation.id,
    status,
    uptimeSeconds,
    avgResponseMs,
    requestsPerMin,
    errorRate,
    lastPing: installation.lastPing ? installation.lastPing.toISOString() : null,
    updatedAt: new Date().toISOString(),
  } satisfies HealthMetrics
}

export function buildHealthLogs(installation: MCPInstallation, count = 160): HealthLog[] {
  const seed = hashString(installation.id)
  const now = Date.now()
  const source = installation.status === 'RUNNING' ? 'runtime' : 'scheduler'
  const errorBias = installation.status === 'ERROR' ? 0.35 : 0.1

  return Array.from({ length: count }).map((_, index) => {
    const offset = index * 42 * 1000
    const roll = seededRandom(seed + index)
    let level: HealthLog['level'] = 'INFO'
    if (roll > 1 - errorBias) level = 'ERROR'
    else if (roll > 0.7) level = 'WARN'

    const messageIndex = Math.floor(seededRandom(seed + index * 3) * LOG_MESSAGES.length)
    const message = LOG_MESSAGES[messageIndex] ?? LOG_MESSAGES[0]

    return {
      id: `${installation.id}-${index}`,
      timestamp: new Date(now - offset).toISOString(),
      level,
      message,
      source,
    }
  })
}
