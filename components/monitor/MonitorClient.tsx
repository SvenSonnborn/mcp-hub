'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { UIEvent } from 'react'
import Link from 'next/link'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Activity, AlertTriangle, Clock, Server, Terminal, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Installation = {
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

type HealthMetrics = {
  installationId: string
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE'
  uptimeSeconds: number
  avgResponseMs: number
  requestsPerMin: number
  errorRate: number
  lastPing: string | null
  updatedAt: string
}

type HealthLog = {
  id: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
  source: string
}

const LOG_ROW_HEIGHT = 44
const LOG_OVERSCAN = 6

async function fetchInstallations(): Promise<Installation[]> {
  const response = await fetch('/api/installations')
  if (!response.ok) {
    throw new Error('Failed to load installations')
  }
  const data = await response.json()
  return data.installations ?? []
}

async function fetchHealth(id: string): Promise<HealthMetrics> {
  const response = await fetch(`/api/health/${id}`)
  if (!response.ok) {
    throw new Error('Failed to load health metrics')
  }
  const data = await response.json()
  return data.metrics
}

async function fetchLogs(id: string): Promise<HealthLog[]> {
  const response = await fetch(`/api/health/${id}/logs`)
  if (!response.ok) {
    throw new Error('Failed to load logs')
  }
  const data = await response.json()
  return data.logs ?? []
}

function formatUptime(seconds: number) {
  if (seconds <= 0) return 'Offline'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatNumber(value: number, suffix = '') {
  return `${value.toLocaleString()}${suffix}`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function MonitorContent() {
  const searchRef = useRef<HTMLInputElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL')
  const [search, setSearch] = useState('')
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(320)
  const [autoScroll, setAutoScroll] = useState(true)

  const installationsQuery = useQuery({
    queryKey: ['installations'],
    queryFn: fetchInstallations,
    refetchInterval: 10000,
  })

  const installations = installationsQuery.data ?? []

  useEffect(() => {
    if (installations.length === 0) return
    if (!selectedId || !installations.some((item) => item.id === selectedId)) {
      setSelectedId(installations[0].id)
    }
  }, [installations, selectedId])

  const healthQuery = useQuery({
    queryKey: ['health', selectedId],
    queryFn: () => fetchHealth(selectedId ?? ''),
    enabled: Boolean(selectedId),
    refetchInterval: 5000,
  })

  const logsQuery = useQuery({
    queryKey: ['health-logs', selectedId],
    queryFn: () => fetchLogs(selectedId ?? ''),
    enabled: Boolean(selectedId),
    refetchInterval: 5000,
  })

  const filteredLogs = useMemo(() => {
    const logs = logsQuery.data ?? []
    return logs.filter((log) => {
      const levelMatch = levelFilter === 'ALL' || log.level === levelFilter
      const searchMatch =
        search.trim().length === 0 ||
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.source.toLowerCase().includes(search.toLowerCase())
      return levelMatch && searchMatch
    })
  }, [levelFilter, logsQuery.data, search])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      setViewportHeight(element.clientHeight)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!autoScroll) return
    const element = viewportRef.current
    if (!element) return
    element.scrollTop = element.scrollHeight
    setScrollTop(element.scrollTop)
  }, [filteredLogs, autoScroll])

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const nextScrollTop = element.scrollTop
    setScrollTop(nextScrollTop)
    const isNearBottom =
      nextScrollTop + element.clientHeight >= element.scrollHeight - LOG_ROW_HEIGHT * 2
    setAutoScroll(isNearBottom)
  }

  const totalHeight = filteredLogs.length * LOG_ROW_HEIGHT
  const startIndex = Math.max(0, Math.floor(scrollTop / LOG_ROW_HEIGHT) - LOG_OVERSCAN)
  const endIndex = Math.min(
    filteredLogs.length,
    Math.ceil((scrollTop + viewportHeight) / LOG_ROW_HEIGHT) + LOG_OVERSCAN
  )
  const visibleLogs = filteredLogs.slice(startIndex, endIndex)

  const selectedInstallation = installations.find((item) => item.id === selectedId)
  const health = healthQuery.data

  const statusTone =
    health?.status === 'HEALTHY'
      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
      : health?.status === 'DEGRADED'
        ? 'border-amber-400/40 bg-amber-400/15 text-amber-200'
        : 'border-rose-500/40 bg-rose-500/15 text-rose-200'

  const chartData = useMemo(() => {
    const base = health?.avgResponseMs ?? 140
    return Array.from({ length: 12 }).map((_, index) => ({
      label: `${index * 5}m`,
      response: Math.round(base + Math.sin(index / 2) * 22 + index * 1.2),
      requests: Math.round((health?.requestsPerMin ?? 200) + Math.cos(index / 3) * 24),
    }))
  }, [health?.avgResponseMs, health?.requestsPerMin])

  if (installationsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-12 rounded-3xl" />
          <Skeleton className="h-12 rounded-3xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    )
  }

  if (installationsQuery.isError) {
    return (
      <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-12 text-center text-rose-100 backdrop-blur-2xl">
        <p>Unable to load installations.</p>
        <Button variant="outline" className="mt-4" onClick={() => installationsQuery.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (installations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-16 text-center backdrop-blur-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300">
          <Server className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-100">No servers installed</h3>
        <p className="mt-2 text-sm text-slate-400">
          Install a server from the registry to start monitoring it here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/registry">Browse Registry</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <label className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">
            Server
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="relative flex-1">
              <select
                value={selectedId ?? ''}
                onChange={(event) => setSelectedId(event.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 transition focus:border-cyan-400/60 focus:outline-none"
              >
                {installations.map((installation) => (
                  <option key={installation.id} value={installation.id} className="bg-slate-950">
                    {installation.server.name} · {installation.status}
                  </option>
                ))}
              </select>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase transition-colors duration-300',
                statusTone
              )}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {health?.status ?? 'Loading'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
            <span>Current installation</span>
            <span className="text-slate-200">
              {selectedInstallation?.server.name} · v{selectedInstallation?.server.version}
            </span>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">
                Live Status
              </label>
              <p className="mt-2 text-sm text-slate-400">
                {health?.lastPing
                  ? `Last ping ${new Date(health.lastPing).toLocaleTimeString()}`
                  : 'Awaiting first ping'}
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
              Auto-refresh 5s
            </div>
          </div>
          {healthQuery.isError ? (
            <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
              Unable to load health metrics.
              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() => healthQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {healthQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-none backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs tracking-[0.2em] text-slate-500 uppercase">Uptime</div>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-100">
              {health ? formatUptime(health.uptimeSeconds) : '--'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Rolling 24h</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-none backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs tracking-[0.2em] text-slate-500 uppercase">Avg Response</div>
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-100">
              {health ? formatNumber(health.avgResponseMs, 'ms') : '--'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Median request time</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-none backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs tracking-[0.2em] text-slate-500 uppercase">
                Requests / min
              </div>
              <Zap className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-100">
              {health ? formatNumber(health.requestsPerMin) : '--'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Trailing 60s</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-none backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs tracking-[0.2em] text-slate-500 uppercase">Error rate</div>
              <AlertTriangle className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-100">
              {health ? formatPercent(health.errorRate) : '--'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Last 15 minutes</p>
          </motion.div>
        </div>
      )}

      {healthQuery.isLoading ? (
        <Skeleton className="h-72 rounded-3xl" />
      ) : (
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">
                Traffic Pulse
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-100">
                Response time & throughput
              </h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
              Mock data
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 16 }}>
                <defs>
                  <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(2,6,23,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                    borderRadius: 16,
                    backdropFilter: 'blur(16px)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="response"
                  stroke="#8b5cf6"
                  fill="url(#colorResponse)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#22d3ee"
                  fill="url(#colorRequests)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">Logs</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-100">Recent runtime activity</h3>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
            <Terminal className="h-3 w-3" />
            Live tail
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
            <span className="text-slate-500">Filter</span>
            {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                className={cn(
                  'rounded-full px-2 py-1 text-[11px] font-semibold tracking-wide uppercase transition',
                  levelFilter === level
                    ? 'bg-cyan-500/20 text-cyan-200'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="relative min-w-[220px] flex-1">
            <Input
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search logs (Cmd+K)"
              className="h-10 rounded-2xl border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/40 hover:bg-white/10"
            onClick={() => {
              const element = viewportRef.current
              if (element) {
                element.scrollTop = element.scrollHeight
                setScrollTop(element.scrollTop)
                setAutoScroll(true)
              }
            }}
          >
            Jump to latest
          </Button>
          <span
            className={cn(
              'text-xs font-semibold tracking-wide uppercase transition-colors',
              autoScroll ? 'text-emerald-300' : 'text-slate-500'
            )}
          >
            Auto-scroll {autoScroll ? 'on' : 'paused'}
          </span>
        </div>

        <div className="mt-6">
          {logsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-10 rounded-2xl" />
              ))}
            </div>
          ) : logsQuery.isError ? (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-8 text-center text-rose-100">
              <p>Unable to load logs.</p>
              <Button variant="outline" className="mt-4" onClick={() => logsQuery.refetch()}>
                Retry
              </Button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center backdrop-blur-2xl">
              <p className="text-sm text-slate-300">No logs match your filters.</p>
              <p className="mt-2 text-xs text-slate-500">Try a different level or search term.</p>
            </div>
          ) : (
            <div
              ref={viewportRef}
              onScroll={handleScroll}
              className="h-80 overflow-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl"
            >
              <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                  style={{
                    transform: `translateY(${startIndex * LOG_ROW_HEIGHT}px)`,
                  }}
                >
                  {visibleLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex h-11 items-center justify-between gap-3 border-b border-white/5 px-4 text-xs text-slate-300"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'w-12 rounded-full border px-2 py-1 text-[10px] font-semibold tracking-wide uppercase transition-colors duration-300',
                            log.level === 'INFO' && 'border-sky-500/40 bg-sky-500/10 text-sky-200',
                            log.level === 'WARN' &&
                              'border-amber-400/40 bg-amber-400/10 text-amber-200',
                            log.level === 'ERROR' &&
                              'border-rose-500/40 bg-rose-500/10 text-rose-200'
                          )}
                        >
                          {log.level}
                        </span>
                        <span className="text-slate-400">{log.source}</span>
                        <span className="text-slate-200">{log.message}</span>
                      </div>
                      <span className="text-slate-500">{formatTime(log.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MonitorClient() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <MonitorContent />
    </QueryClientProvider>
  )
}
