import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Space_Grotesk } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InstallActions } from '@/components/registry/InstallActions'
import { AddToConfigActions } from '@/components/registry/AddToConfigActions'
import { StatusPoller } from '@/components/registry/StatusPoller'
import { UninstallButton } from '@/components/registry/UninstallButton'
import { ServerConfigEditor } from '@/components/registry/ServerConfigEditor'
import { getAllServers, getServerById } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import type { Server, ServerTag } from '@/lib/schemas'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

const TAG_COLORS: Record<ServerTag | string, string> = {
  official: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
  filesystem: 'border-sky-500/40 bg-sky-500/15 text-sky-200',
  github: 'border-violet-500/40 bg-violet-500/15 text-violet-200',
  database: 'border-amber-400/40 bg-amber-400/15 text-amber-200',
  search: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
  browser: 'border-pink-500/40 bg-pink-500/15 text-pink-200',
  api: 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200',
  postgres: 'border-amber-400/40 bg-amber-400/15 text-amber-200',
  sqlite: 'border-amber-400/40 bg-amber-400/15 text-amber-200',
  web: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
  automation: 'border-pink-500/40 bg-pink-500/15 text-pink-200',
  ai: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
  tools: 'border-white/10 bg-white/5 text-slate-200',
  cloud: 'border-sky-500/40 bg-sky-500/15 text-sky-200',
}

const STATUS_STYLES: Record<string, string> = {
  RUNNING: 'text-emerald-200 border-emerald-500/40 bg-emerald-500/15',
  STOPPED: 'text-slate-300 border-white/10 bg-white/5',
  ERROR: 'text-rose-200 border-rose-500/40 bg-rose-500/15',
  PENDING: 'text-cyan-200 border-cyan-400/40 bg-cyan-500/15',
  INSTALLING: 'text-cyan-200 border-cyan-400/40 bg-cyan-500/15',
  UPDATING: 'text-cyan-200 border-cyan-400/40 bg-cyan-500/15',
}

const STATUS_LABELS: Record<string, string> = {
  RUNNING: 'Running',
  STOPPED: 'Stopped',
  ERROR: 'Error',
  PENDING: 'Pending',
  INSTALLING: 'Installing',
  UPDATING: 'Updating',
}

export function generateStaticParams() {
  const servers = getAllServers()
  return servers.map((server) => ({
    id: server.id,
  }))
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const server = getServerById(params.id)
  if (!server) {
    return { title: 'Server Not Found | MCP Hub' }
  }
  return {
    title: `${server.name} | MCP Hub`,
    description: server.description,
  }
}

async function getInstallationForServer(server: Server) {
  const serverRecord = await prisma.mCPServer.findFirst({
    where: {
      OR: [{ id: server.id }, { name: server.id }, { name: server.name }],
    },
  })

  if (!serverRecord) {
    return null
  }

  return prisma.mCPInstallation.findFirst({
    where: { serverId: serverRecord.id },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ServerPage({ params }: { params: { id: string } }) {
  const server = getServerById(params.id)

  if (!server) {
    notFound()
  }

  const installation = await getInstallationForServer(server)
  const statusKey = installation?.status ?? 'PENDING'
  const statusLabel = STATUS_LABELS[statusKey] ?? 'Pending'
  const statusClass = STATUS_STYLES[statusKey] ?? STATUS_STYLES.PENDING

  return (
    <main className={`${spaceGrotesk.className} min-h-screen bg-slate-950 text-slate-100`}>
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/25 blur-[140px]" />
          <div className="absolute right-[-10%] bottom-0 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[160px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-950/60 to-slate-950" />
        </div>

        <div className="relative z-10">
          <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-8">
            <Link href="/" className="text-sm text-slate-400 hover:text-white">
              ← Back to registry
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="tracking-[0.3em] text-cyan-300 uppercase">Server</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300">{server.name}</span>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-10 pb-20">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
              <div className="flex flex-wrap items-center gap-2">
                {server.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className={TAG_COLORS[tag] || ''}>
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-semibold text-white md:text-4xl">{server.name}</h1>
                  <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
                    {server.description}
                  </p>
                </div>
                <div className="flex min-w-[240px] flex-col gap-3">
                  {installation ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <div
                        className={`rounded-full border px-4 py-2 text-xs tracking-[0.3em] uppercase ${statusClass}`}
                      >
                        {statusLabel}
                      </div>
                      <div>
                        <UninstallButton installationId={installation.id} />
                      </div>
                    </div>
                  ) : server.type === 'remote' ? (
                    <AddToConfigActions
                      serverId={server.id}
                      serverName={server.name}
                      remoteUrl={server.remoteUrl || ''}
                    />
                  ) : (
                    <div className="flex flex-col gap-2">
                      <InstallActions serverId={server.id} server={server} tool="claude" />
                      <div className="flex flex-wrap gap-2">
                        <InstallActions
                          serverId={server.id}
                          server={server}
                          tool="cursor"
                          variant="secondary"
                          className="flex-1"
                        />
                        <InstallActions
                          serverId={server.id}
                          server={server}
                          tool="windsurf"
                          variant="secondary"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                  {installation ? (
                    <div>
                      <StatusPoller
                        installationId={installation.id}
                        initialStatus={installation.status}
                      />
                    </div>
                  ) : null}
                  {installation ? (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" asChild className="flex-1">
                        <a href="/config">View Config</a>
                      </Button>
                      <Button variant="secondary" asChild className="flex-1">
                        <a href="#config">Edit configuration</a>
                      </Button>
                    </div>
                  ) : (
                    <Button variant="secondary" asChild>
                      <a href={server.githubUrl} target="_blank" rel="noopener noreferrer">
                        View GitHub
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
                  <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Installation</p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-slate-400">NPM package</p>
                      <p className="mt-2 font-mono text-sm text-slate-100">
                        {server.npmPackage ? `npx ${server.npmPackage}` : 'Not available'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {installation ? (
                        <Button variant="secondary" className="flex-1" asChild>
                          <a href="/config">Open Config Manager</a>
                        </Button>
                      ) : null}
                      <Button variant="secondary" className="flex-1" asChild>
                        <a href={server.githubUrl} target="_blank" rel="noopener noreferrer">
                          GitHub Repo
                        </a>
                      </Button>
                    </div>
                  </div>
                </section>

                {server.tools && server.tools.length > 0 ? (
                  <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
                    <div className="flex items-center justify-between">
                      <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Tools</p>
                      <span className="text-xs text-slate-400">{server.tools.length} total</span>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {server.tools.map((tool) => (
                        <div
                          key={tool.name}
                          className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                        >
                          <code className="text-sm font-semibold text-slate-100">{tool.name}</code>
                          <p className="mt-2 text-sm text-slate-400">{tool.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {installation ? (
                  <div id="config">
                    <ServerConfigEditor
                      installationId={installation.id}
                      initialConfig={(installation.config ?? {}) as Record<string, unknown>}
                    />
                  </div>
                ) : null}
              </div>

              <aside className="space-y-6">
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
                  <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Details</p>
                  <div className="mt-4 space-y-4 text-sm text-slate-300">
                    <div>
                      <p className="text-xs text-slate-500">Author</p>
                      <a
                        href={server.authorUrl || server.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-100 hover:text-white hover:underline"
                      >
                        {server.author}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Version</p>
                      <p className="text-slate-100">{server.version}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">License</p>
                      <p className="text-slate-100">{server.license}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Downloads</p>
                      <p className="text-slate-100">{server.downloads}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
                  <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Links</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button variant="secondary" className="w-full" asChild>
                      <a href={server.githubUrl} target="_blank" rel="noopener noreferrer">
                        GitHub Repository
                      </a>
                    </Button>
                    {server.npmPackage ? (
                      <Button variant="secondary" className="w-full" asChild>
                        <a
                          href={`https://www.npmjs.com/package/${server.npmPackage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          NPM Package
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
