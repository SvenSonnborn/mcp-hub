import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllServers, getServerById } from '@/lib/data'
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

export default function ServerPage({ params }: { params: { id: string } }) {
  const server = getServerById(params.id)

  if (!server) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <span className="text-sm font-bold text-white">MCP</span>
            </div>
            <span className="text-lg font-semibold">MCP Hub</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Back to Servers
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900 hover:underline">
            Servers
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{server.name}</span>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="mb-4 flex flex-wrap items-center gap-3">
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
          <h1 className="mb-4 text-4xl font-bold text-slate-900">{server.name}</h1>
          <p className="max-w-3xl text-xl text-slate-600">{server.description}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {server.npmPackage && (
                  <div>
                    <p className="mb-2 text-sm text-slate-500">NPM Package</p>
                    <code className="block rounded-lg bg-slate-100 p-3 font-mono text-sm text-slate-700">
                      npx {server.npmPackage}
                    </code>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <a href={server.githubUrl} target="_blank" rel="noopener noreferrer">
                      View on GitHub
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tools */}
            {server.tools && server.tools.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Tools ({server.tools.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {server.tools.map((tool) => (
                      <div
                        key={tool.name}
                        className="rounded-lg border p-4 transition-colors hover:bg-slate-50"
                      >
                        <code className="mb-1 block text-sm font-semibold text-slate-900">
                          {tool.name}
                        </code>
                        <p className="text-sm text-slate-600">{tool.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Author</p>
                  <a
                    href={server.authorUrl || server.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-900 hover:underline"
                  >
                    {server.author}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Version</p>
                  <p className="text-slate-900">{server.version}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">License</p>
                  <p className="text-slate-900">{server.license}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Downloads</p>
                  <p className="text-slate-900">{server.downloads}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <a href={server.githubUrl} target="_blank" rel="noopener noreferrer">
                    GitHub Repository
                  </a>
                </Button>
                {server.npmPackage && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`https://www.npmjs.com/package/${server.npmPackage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      NPM Package
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900">
                <span className="text-xs font-bold text-white">MCP</span>
              </div>
              <span className="text-sm text-slate-600">MCP Hub</span>
            </div>
            <div className="text-xs text-slate-400">
              Not affiliated with Anthropic. MCP is a trademark of Anthropic.
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
