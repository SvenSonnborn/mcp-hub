'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from 'framer-motion'
import {
  ArrowRight,
  Compass,
  Layers,
  Menu,
  Settings,
  Server,
  ShieldCheck,
  Sparkles,
  Download,
  Users,
  Activity,
  X,
} from 'lucide-react'
import { Space_Grotesk } from 'next/font/google'
import Link from 'next/link'
import { useAuth } from '@/components/providers/supabase-provider'
import { useRouter } from 'next/navigation'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap' })

const easing: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

const pageSequence = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const section = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easing } },
}

const heroGroup = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
}

const heroItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing } },
}

const cardsGroup = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
}

const cardItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easing } },
}

const statsGroup = {
  hidden: {},
  show: {
    transition: { delayChildren: 0.2, staggerChildren: 0.05 },
  },
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
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const displayName = useMemo(() => {
    if (!user?.email) return 'User'
    return user.email.split('@')[0]
  }, [user])
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  useEffect(() => {
    if (!menuOpen) return

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) {
        return
      }
      setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [mobileMenuOpen])

  return (
    <motion.main
      variants={pageSequence}
      initial="hidden"
      animate="show"
      className={`${spaceGrotesk.className} min-h-screen bg-slate-950 text-slate-100`}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/30 blur-[140px]" />
          <div className="absolute right-[-10%] bottom-0 h-[420px] w-[420px] rounded-full bg-violet-500/25 blur-[160px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-950/60 to-slate-950" />
        </div>

        <motion.header
          variants={section}
          className="will-change-opacity sticky top-4 z-40 mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl will-change-transform"
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
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-all duration-200 hover:border-cyan-300/40 md:hidden ${glowRing}`}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="relative flex items-center gap-3">
              {authLoading ? (
                <div className="h-10 w-28 animate-pulse rounded-full border border-white/10 bg-white/10" />
              ) : user ? (
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className={`flex min-h-11 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-all duration-200 hover:border-cyan-300/40 ${glowRing}`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-cyan-500/20 text-xs font-semibold text-cyan-100">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt={displayName} className="h-full w-full" />
                      ) : (
                        displayName.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <span className="hidden text-left text-xs md:block">
                      <span className="block text-slate-300">Signed in as</span>
                      <span className="block text-slate-100">{displayName}</span>
                    </span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-slate-950/95 p-2 text-sm text-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                      <Link
                        href="/dashboard"
                        className={`flex min-h-11 items-center rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-white/10 ${glowRing}`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className={`flex min-h-11 items-center rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-white/10 ${glowRing}`}
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch('/logout', { method: 'POST' })
                          router.push('/')
                          router.refresh()
                        }}
                        className={`mt-1 flex min-h-11 w-full items-center rounded-xl px-3 py-2 text-left transition-colors duration-200 hover:bg-white/10 ${glowRing}`}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`hidden cursor-pointer rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan-200 hover:text-cyan-100 md:inline-flex ${glowRing}`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={`cursor-pointer rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-300 ${glowRing}`}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.header>

        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="absolute top-20 right-4 left-4 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="text-xs tracking-[0.3em] text-cyan-200 uppercase">Navigate</p>
                <div className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
                  <Link
                    href="/registry"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-11 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors duration-200 hover:bg-white/10 ${glowRing}`}
                  >
                    Registry
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-11 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors duration-200 hover:bg-white/10 ${glowRing}`}
                  >
                    Dashboard
                  </Link>
                  <a
                    href="https://github.com/SvenSonnborn/mcp-hub"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-11 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors duration-200 hover:bg-white/10 ${glowRing}`}
                  >
                    GitHub
                  </a>
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex min-h-11 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors duration-200 hover:bg-white/10 ${glowRing}`}
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch('/logout', { method: 'POST' })
                          setMobileMenuOpen(false)
                          router.push('/')
                          router.refresh()
                        }}
                        className={`flex min-h-11 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors duration-200 hover:bg-white/10 ${glowRing}`}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex min-h-11 items-center justify-center rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan-200 hover:text-cyan-100 ${glowRing}`}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex min-h-11 items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-300 ${glowRing}`}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.section
          variants={section}
          className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20"
        >
          <motion.div
            variants={heroGroup}
            className="will-change-opacity max-w-3xl will-change-transform"
          >
            <motion.div
              variants={heroItem}
              className="will-change-opacity mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1.5 text-xs tracking-[0.2em] text-cyan-200 uppercase will-change-transform"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? 'Loading...' : `${stats.totalServers} Official Servers Available`}
            </motion.div>
            <motion.h1
              variants={heroItem}
              className="will-change-opacity text-4xl leading-tight font-semibold text-white will-change-transform md:text-6xl lg:text-7xl"
            >
              Discover & Deploy
              <span className="block bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                MCP Servers
              </span>
            </motion.h1>
            <motion.p
              variants={heroItem}
              className="will-change-opacity mt-6 text-base text-slate-300 will-change-transform sm:text-lg md:text-xl"
            >
              Your gateway to the Model Context Protocol ecosystem. Browse curated servers,
              one-click install, and manage your AI infrastructure from a unified dashboard.
            </motion.p>
            <motion.div
              variants={heroItem}
              className="will-change-opacity mt-8 flex flex-wrap gap-4 will-change-transform"
            >
              <Link
                href="/registry"
                className={`flex min-h-11 w-full items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-300 sm:w-auto ${glowRing}`}
              >
                Browse Registry
              </Link>
              <Link
                href="/dashboard"
                className={`flex min-h-11 w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan-200 hover:text-cyan-100 sm:w-auto ${glowRing}`}
              >
                Open Dashboard
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={statsGroup}
            className="will-change-opacity grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl will-change-transform sm:grid-cols-3 sm:p-8"
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
                variants={cardItem}
                className="will-change-opacity flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 will-change-transform sm:p-5"
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
        </motion.section>
      </div>

      <motion.section variants={section} className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div variants={cardsGroup} className="will-change-opacity will-change-transform">
          <motion.div
            variants={cardItem}
            className="will-change-opacity mb-8 will-change-transform"
          >
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
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardItem}
                className={`will-change-opacity cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl will-change-transform sm:p-6 ${hoverLift} ${glowRing}`}
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
      </motion.section>

      <motion.section variants={section} className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div variants={cardsGroup} className="will-change-opacity will-change-transform">
          <motion.div
            variants={cardItem}
            className="will-change-opacity mb-8 flex items-center justify-between will-change-transform"
          >
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
              : visibleServers.map((server) => (
                  <motion.div
                    key={server.id}
                    variants={cardItem}
                    className={`will-change-opacity cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-200 will-change-transform hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10 sm:p-5 ${glowRing}`}
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
      </motion.section>

      <motion.section variants={section} className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div
          variants={cardsGroup}
          className="will-change-opacity rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-950/80 to-violet-500/10 p-8 backdrop-blur-2xl will-change-transform sm:p-10"
        >
          <motion.div
            variants={cardItem}
            className="will-change-opacity flex flex-col gap-6 will-change-transform md:flex-row md:items-center md:justify-between"
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
                className={`flex min-h-11 w-full items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-300 sm:w-auto ${glowRing}`}
              >
                Explore Servers
              </Link>
              <a
                href="https://github.com/SvenSonnborn/mcp-hub"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex min-h-11 w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan-200 hover:text-cyan-100 sm:w-auto ${glowRing}`}
              >
                View on GitHub
              </a>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.footer variants={section} className="mx-auto max-w-6xl px-6 pb-10">
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
      </motion.footer>
    </motion.main>
  )
}
