'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQueryState } from 'nuqs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Server, ServerTag } from '@/lib/schemas'

const TAG_COLORS: Record<ServerTag | string, string> = {
  official: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  filesystem: 'bg-sky-500/15 text-sky-200 border-sky-500/40',
  github: 'bg-violet-500/15 text-violet-200 border-violet-500/40',
  database: 'bg-amber-400/15 text-amber-200 border-amber-400/40',
  search: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40',
  browser: 'bg-pink-500/15 text-pink-200 border-pink-500/40',
  api: 'bg-indigo-500/15 text-indigo-200 border-indigo-500/40',
  postgres: 'bg-amber-400/15 text-amber-200 border-amber-400/40',
  sqlite: 'bg-amber-400/15 text-amber-200 border-amber-400/40',
  web: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40',
  automation: 'bg-pink-500/15 text-pink-200 border-pink-500/40',
  ai: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40',
  tools: 'bg-slate-500/15 text-slate-200 border-slate-500/30',
  cloud: 'bg-sky-500/15 text-sky-200 border-sky-500/40',
}

function ServerCard({ server }: { server: Server }) {
  return (
    <Card className="group flex h-full flex-col transition-all duration-200 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <Link href={`/servers/${server.id}`} className="hover:text-white hover:underline">
              <CardTitle className="text-lg text-slate-100">{server.name}</CardTitle>
            </Link>
            <CardDescription className="text-sm text-slate-400">
              by{' '}
              <a
                href={server.authorUrl || server.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline"
              >
                {server.author}
              </a>
            </CardDescription>
          </div>
          <span className="text-xs text-slate-400">{server.downloads}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="mb-4 flex-1 text-sm text-slate-300">{server.description}</p>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {server.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={TAG_COLORS[tag] || 'border-white/10 bg-white/5 text-slate-300'}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" asChild>
            <a href={server.githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Button>
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/servers/${server.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface ServerGridProps {
  initialServers: Server[]
  allTags: string[]
}

export function ServerGrid({ initialServers, allTags }: ServerGridProps) {
  const [searchQuery, setSearchQuery] = useQueryState('q', {
    defaultValue: '',
    throttleMs: 100,
  })
  const [selectedTag, setSelectedTag] = useQueryState('tag', {
    defaultValue: '',
    throttleMs: 100,
  })

  const filteredServers = useMemo(() => {
    let result = initialServers

    if (selectedTag) {
      result = result.filter((s) => s.tags.includes(selectedTag as ServerTag))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    return result
  }, [initialServers, selectedTag, searchQuery])

  const activeFiltersCount = (selectedTag ? 1 : 0) + (searchQuery ? 1 : 0)

  return (
    <>
      {/* Search */}
      <section className="container mx-auto px-4">
        <div className="mx-auto flex max-w-2xl gap-2 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-2xl">
          <Input
            placeholder="Search servers by name, tag, or functionality..."
            className="h-12 border-transparent bg-transparent text-lg text-slate-100 placeholder:text-slate-500 focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            size="lg"
            className="px-8"
            disabled={!searchQuery.trim()}
            onClick={() => setSearchQuery('')}
          >
            {searchQuery ? 'Clear' : 'Search'}
          </Button>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto mb-8 px-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm text-slate-400">Filter by:</span>
          <Badge
            variant={selectedTag === '' ? 'default' : 'outline'}
            className={`cursor-pointer ${selectedTag === '' ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200' : 'hover:bg-white/10'}`}
            onClick={() => setSelectedTag('')}
          >
            All
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              className={`cursor-pointer ${TAG_COLORS[tag] || ''} ${selectedTag === tag ? '' : 'hover:bg-white/10'}`}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        {activeFiltersCount > 0 && (
          <p className="mt-3 text-sm text-slate-400">
            Showing {filteredServers.length} of {initialServers.length} servers
            {selectedTag && (
              <button
                onClick={() => {
                  setSelectedTag('')
                  setSearchQuery('')
                }}
                className="ml-3 text-cyan-300 hover:text-cyan-200 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </p>
        )}
      </section>

      {/* Server Grid */}
      <section className="container mx-auto px-4 pb-20">
        {filteredServers.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-slate-400">No servers match your search</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                setSelectedTag('')
                setSearchQuery('')
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
