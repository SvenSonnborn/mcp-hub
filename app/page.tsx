import { Suspense } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Button } from '@/components/ui/button'
import { getAllServers, getAllTags } from '@/lib/data'
import { ServerGrid } from './components/server-grid'

export default function Home() {
  const servers = getAllServers()
  const tags = getAllTags()

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <span className="text-sm font-bold text-white">MCP</span>
            </div>
            <span className="text-lg font-semibold">MCP Hub</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Servers
            </Button>
            <Button variant="ghost" size="sm">
              Documentation
            </Button>
            <Button variant="ghost" size="sm">
              Community
            </Button>
            <Button size="sm">Submit Server</Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
          {servers.length} official servers available
        </div>
        <h1 className="mb-6 text-5xl font-bold text-slate-900">Discover MCP Servers</h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600">
          Your gateway to the Model Context Protocol ecosystem. Find, evaluate, and integrate MCP
          servers for your AI applications.
        </p>
      </section>

      {/* Search & Filter - Client Component */}
      <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading...</div>}>
        <NuqsAdapter>
          <ServerGrid initialServers={servers} allTags={tags} />
        </NuqsAdapter>
      </Suspense>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900">
                <span className="text-xs font-bold text-white">MCP</span>
              </div>
              <span className="text-sm text-slate-600">MCP Hub</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-900">
                About
              </a>
              <a href="#" className="hover:text-slate-900">
                Documentation
              </a>
              <a
                href="https://github.com/modelcontextprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-slate-400">
            Not affiliated with Anthropic. MCP is a trademark of Anthropic.
          </div>
        </div>
      </footer>
    </main>
  )
}
