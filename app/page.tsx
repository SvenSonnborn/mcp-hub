import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAllServers, getAllTags } from '@/lib/data'
import type { Server, ServerTag } from '@/lib/schemas'

const TAG_COLORS: Record<ServerTag | string, string> = {
  official: 'bg-green-100 text-green-800 border-green-200',
  filesystem: 'bg-blue-100 text-blue-800 border-blue-200',
  github: 'bg-purple-100 text-purple-800 border-purple-200',
  database: 'bg-orange-100 text-orange-800 border-orange-200',
  search: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  browser: 'bg-pink-100 text-pink-800 border-pink-200',
  api: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  postgres: 'bg-orange-100 text-orange-800 border-orange-200',
  sqlite: 'bg-orange-100 text-orange-800 border-orange-200',
  web: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  automation: 'bg-pink-100 text-pink-800 border-pink-200',
  ai: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  tools: 'bg-slate-100 text-slate-800 border-slate-200',
  cloud: 'bg-sky-100 text-sky-800 border-sky-200',
}

function ServerCard({ server }: { server: Server }) {
  return (
    <Card className="group flex h-full flex-col transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{server.name}</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              by{' '}
              <a
                href={server.authorUrl || server.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-700 hover:underline"
              >
                {server.author}
              </a>
            </CardDescription>
          </div>
          <span className="text-xs text-slate-400">{server.downloads}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="mb-4 flex-1 text-sm text-slate-600">{server.description}</p>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {server.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={TAG_COLORS[tag] || 'border-slate-200 bg-slate-100 text-slate-700'}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={server.githubUrl} target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </Button>
          <Button size="sm" className="flex-1">
            Get
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

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

        {/* Search */}
        <div className="mx-auto flex max-w-2xl gap-2">
          <Input
            placeholder="Search servers by name, tag, or functionality..."
            className="h-12 text-lg"
          />
          <Button size="lg" className="px-8">
            Search
          </Button>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto mb-8 px-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm text-slate-500">Filter by:</span>
          <Badge variant="default" className="cursor-pointer hover:bg-slate-700">
            All
          </Badge>
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={`cursor-pointer hover:bg-slate-50 ${TAG_COLORS[tag] || ''}`}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      {/* Server Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      </section>

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
