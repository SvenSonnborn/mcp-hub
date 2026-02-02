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
            <Link href={`/servers/${server.id}`} className="hover:underline">
              <CardTitle className="text-lg">{server.name}</CardTitle>
            </Link>
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
        <div className="mx-auto flex max-w-2xl gap-2">
          <Input
            placeholder="Search servers by name, tag, or functionality..."
            className="h-12 text-lg"
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
          <span className="mr-2 text-sm text-slate-500">Filter by:</span>
          <Badge
            variant={selectedTag === '' ? 'default' : 'outline'}
            className={`cursor-pointer ${selectedTag === '' ? '' : 'hover:bg-slate-50'}`}
            onClick={() => setSelectedTag('')}
          >
            All
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              className={`cursor-pointer ${TAG_COLORS[tag] || ''} ${selectedTag === tag ? '' : 'hover:bg-slate-50'}`}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        {activeFiltersCount > 0 && (
          <p className="mt-3 text-sm text-slate-500">
            Showing {filteredServers.length} of {initialServers.length} servers
            {selectedTag && (
              <button
                onClick={() => {
                  setSelectedTag('')
                  setSearchQuery('')
                }}
                className="ml-3 text-blue-600 hover:underline"
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
            <p className="text-xl text-slate-500">No servers match your search</p>
            <Button
              variant="outline"
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
