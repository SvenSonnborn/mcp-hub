import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const FEATURED_SERVERS = [
  {
    id: 1,
    name: "Filesystem MCP",
    description: "Read and write files, search directories, and manage file system operations",
    author: "anthropic",
    tags: ["filesystem", "official"],
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    downloads: "50k+",
  },
  {
    id: 2,
    name: "GitHub MCP",
    description: "Repository management, file operations, and GitHub API integration",
    author: "anthropic",
    tags: ["github", "api", "official"],
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    downloads: "45k+",
  },
  {
    id: 3,
    name: "PostgreSQL MCP",
    description: "Read-only database access with schema inspection capabilities",
    author: "anthropic",
    tags: ["database", "postgres", "official"],
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    downloads: "30k+",
  },
  {
    id: 4,
    name: "Brave Search MCP",
    description: "Web search capabilities using Brave's Search API",
    author: "anthropic",
    tags: ["search", "web", "official"],
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    downloads: "25k+",
  },
  {
    id: 5,
    name: "Puppeteer MCP",
    description: "Browser automation and web scraping with Puppeteer",
    author: "anthropic",
    tags: ["browser", "automation", "official"],
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    downloads: "20k+",
  },
  {
    id: 6,
    name: "SQLite MCP",
    description: "SQLite database operations with built-in analysis features",
    author: "anthropic",
    tags: ["database", "sqlite", "official"],
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite",
    downloads: "18k+",
  },
]

const TAG_COLORS: Record<string, string> = {
  official: "bg-green-100 text-green-800",
  filesystem: "bg-blue-100 text-blue-800",
  github: "bg-purple-100 text-purple-800",
  database: "bg-orange-100 text-orange-800",
  search: "bg-yellow-100 text-yellow-800",
  browser: "bg-pink-100 text-pink-800",
  api: "bg-indigo-100 text-indigo-800",
  postgres: "bg-orange-100 text-orange-800",
  sqlite: "bg-orange-100 text-orange-800",
  web: "bg-yellow-100 text-yellow-800",
  automation: "bg-pink-100 text-pink-800",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MCP</span>
            </div>
            <span className="font-semibold text-lg">MCP Hub</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Servers</Button>
            <Button variant="ghost" size="sm">Documentation</Button>
            <Button variant="ghost" size="sm">Community</Button>
            <Button size="sm">Submit Server</Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm mb-6">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          {FEATURED_SERVERS.length} official servers available
        </div>
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          Discover MCP Servers
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Your gateway to the Model Context Protocol ecosystem. Find, evaluate, and integrate MCP servers for your AI applications.
        </p>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto flex gap-2">
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
      <section className="container mx-auto px-4 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-500 mr-2">Filter by:</span>
          {["All", "Official", "Filesystem", "Database", "Search", "Browser"].map((filter) => (
            <Badge 
              key={filter} 
              variant={filter === "All" ? "default" : "outline"}
              className="cursor-pointer hover:bg-slate-100"
            >
              {filter}
            </Badge>
          ))}
        </div>
      </section>

      {/* Server Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_SERVERS.map((server) => (
            <Card key={server.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      by {server.author}
                    </CardDescription>
                  </div>
                  <span className="text-xs text-slate-400">{server.downloads}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  {server.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {server.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline"
                      className={TAG_COLORS[tag] || "bg-slate-100 text-slate-700"}
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
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">MCP</span>
              </div>
              <span className="text-sm text-slate-600">MCP Hub</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-900">About</a>
              <a href="#" className="hover:text-slate-900">Documentation</a>
              <a href="#" className="hover:text-slate-900">GitHub</a>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400 text-center">
            Not affiliated with Anthropic. MCP is a trademark of Anthropic.
          </div>
        </div>
      </footer>
    </main>
  )
}
