'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useMotionValueEvent, useSpring } from 'framer-motion'
import {
  ArrowRight,
  Compass,
  Layers,
  Settings,
  Server,
  ShieldCheck,
  Sparkles,
  Download,
  Users,
  Activity,
} from 'lucide-react'
import { Space_Grotesk } from 'next/font/google'
import Link from 'next/link'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap' })

const container = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, duration: 0.6, ease: 'easeOut' },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const glowRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

const hoverLift =
  'transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]'

interface Stats {
  totalServers: number
  totalInstallations: number
  recentInstallations: number
}

interface ServerPreview {
  id: string
  name: string
  category: string
  isOfficial: boolean
}

const fallbackServers: ServerPreview[] = [
  { id: 'filesystem', name: 'filesystem', category: 'Data', isOfficial: true },
  { id: 'github', name: 'github', category: 'Integration', isOfficial: true },
  { id: 'postgres', name: 'postgres', category: 'Database · Data', isOfficial: false },
  { id: 'slack', name: 'slack', category: 'Communication · Integration', isOfficial: false },
  { id: 'brave-search', name: 'brave-search', category: 'Search', isOfficial: true },
  { id: 'fetch', name: 'fetch', category: 'Network', isOfficial: true },
]

function Counter({ value }: { value: number }) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { stiffness: 120, damping: 20 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    motionValue.set(value)
  }, [motionValue, value])

  useMotionValueEvent(springValue, 'change', (latest) => {
    setDisplayValue(latest)
  })

  return <motion.span>{Math.round(displayValue)}</motion.span>
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalServers: 0,
    totalInstallations: 0,
    recentInstallations: 0,
  })
  const [servers, setServers] = useState<ServerPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats(data.stats)
        }
        if (data.servers) {
          setServers(data.servers)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const showDemoServers = !loading && servers.length === 0
  const visibleServers = showDemoServers ? fallbackServers : servers

  return (
    <main className={`${spaceGrotesk.className} min-h-screen bg-slate-950 text-slate-100`}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/30 blur-[140px]" />
          <div className="absolute right-[-10%] bottom-0 h-[420px] w-[420px] rounded-full bg-violet-500/25 blur-[160px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-950/60 to-slate-950" />
        </div>

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="sticky top-4 z-40 mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl"
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-200">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm tracking-[0.25em] text-cyan-200/80 uppercase">MCP Hub</p>
              <p className="text-xs text-slate-400">Curated servers, unified control</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link
              href="/registry"
              className={`cursor-pointer transition-colors duration-200 hover:text-white ${glowRing}`}
            >
              Registry
            </Link>
            <Link
              href="/dashboard"
              className={`cursor-pointer transition-colors duration-200 hover:text-white ${glowRing}`}
            >
              Dashboard
            </Link>
            <a
              href="https://github.com/SvenSonnborn/mcp-hub"
              target="_blank"
              rel="noopener noreferrer"
              className={`cursor-pointer transition-colors duration-200 hover:text-white ${glowRing}`}
            >
              GitHub
            </a>
          </nav>
          <Link
            href="/dashboard"
            className={`cursor-pointer rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-300 ${glowRing}`}
          >
            Launch Console
          </Link>
        </motion.header>

        <section className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pt-24 pb-20">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl">
            <motion.div
              variants={item}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1.5 text-xs tracking-[0.2em] text-cyan-200 uppercase"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? 'Loading...' : `${stats.totalServers} Official Servers Available`}
            </motion.div>
            <motion.h1
              variants={item}
              className="text-4xl leading-tight font-semibold text-white md:text-6xl lg:text-7xl"
            >
              Discover & Deploy
              <span className="block bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                MCP Servers
              </span>
            </motion.h1>
            <motion.p variants={item} className="mt-6 text-lg text-slate-300 md:text-xl">
              Your gateway to the Model Context Protocol ecosystem. Browse curated servers,
              one-click install, and manage your AI infrastructure from a unified dashboard.
            </motion.p>
            <motion.div variants={item} className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/registry"
                className={`cursor-pointer rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-300 ${glowRing}`}
              >
                Browse Registry
              </Link>
              <Link
                href="/dashboard"
                className={`cursor-pointer rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan-200 hover:text-cyan-100 ${glowRing}`}
              >
                Open Dashboard
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl sm:grid-cols-3 sm:p-8"
          >
            {[
              {
                label: 'Available Servers',
                value: stats.totalServers,
                accent: 'text-cyan-300',
                icon: Server,
              },
              {
                label: 'Total Installs',
                value: stats.totalInstallations,
                accent: 'text-violet-300',
                icon: Download,
              },
              {
                label: 'Active This Month',
                value: stats.recentInstallations,
                accent: 'text-emerald-300',
                icon: Activity,
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={item}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  <stat.icon className={`h-6 w-6 ${stat.accent}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.accent}`}>
                    {loading ? '-' : <Counter value={stat.value} />}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={item} className="mb-8">
            <p className="text-sm tracking-[0.2em] text-cyan-400 uppercase">Features</p>
            <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
              Everything you need to orchestrate MCP at scale
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Compass,
                title: 'Discovery',
                body: 'Browse curated MCP servers with detailed documentation, ratings, and official verification badges.',
              },
              {
                icon: Layers,
                title: 'Installation',
                body: 'One-click install flows with automatic configuration generation for Claude, Cursor, and more.',
              },
              {
                icon: Settings,
                title: 'Management',
                body: 'Unified dashboard to monitor health, view logs, and manage all your MCP servers in one place.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                className={`cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${hoverLift} ${glowRing}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={item} className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm tracking-[0.2em] text-cyan-400 uppercase">Popular Servers</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Trending in the Registry</h2>
            </div>
            <Link
              href="/registry"
              className={`hidden cursor-pointer items-center gap-2 text-sm text-cyan-200 transition-colors duration-200 hover:text-cyan-100 md:flex ${glowRing}`}
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                  />
                ))
              : visibleServers.map((server, index) => (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                    className={`cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10 ${glowRing}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200">
                          <Server className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{server.name}</p>
                          <p className="text-xs text-slate-400">{server.category}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {showDemoServers && (
                          <span className="rounded-full border border-cyan-200/30 bg-slate-400/10 px-2 py-0.5 text-[10px] text-cyan-100/80">
                            Demo Data
                          </span>
                        )}
                        {server.isOfficial && (
                          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-200">
                            Official
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-950/80 to-violet-500/10 p-8 backdrop-blur-2xl sm:p-10"
        >
          <motion.div
            variants={item}
            className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-sm tracking-[0.2em] text-cyan-200 uppercase">Get Started</p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                Ready to supercharge your AI workflow?
              </h2>
              <p className="mt-3 max-w-xl text-sm text-slate-300">
                Join thousands of developers using MCP Hub to discover, install, and manage Model
                Context Protocol servers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/registry"
                className={`cursor-pointer rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-300 ${glowRing}`}
              >
                Explore Servers
              </Link>
              <a
                href="https://github.com/SvenSonnborn/mcp-hub"
                target="_blank"
                rel="noopener noreferrer"
                className={`cursor-pointer rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan-200 hover:text-cyan-100 ${glowRing}`}
              >
                View on GitHub
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <ShieldCheck className="h-4 w-4 text-cyan-200" />
            MCP Hub — Not affiliated with Anthropic. MCP is a trademark of Anthropic.
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <Link
              href="/dashboard"
              className={`cursor-pointer transition-colors duration-200 hover:text-white ${glowRing}`}
            >
              Dashboard
            </Link>
            <Link
              href="/registry"
              className={`cursor-pointer transition-colors duration-200 hover:text-white ${glowRing}`}
            >
              Registry
            </Link>
            <a
              href="https://github.com/SvenSonnborn/mcp-hub"
              target="_blank"
              rel="noopener noreferrer"
              className={`cursor-pointer transition-colors duration-200 hover:text-white ${glowRing}`}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
