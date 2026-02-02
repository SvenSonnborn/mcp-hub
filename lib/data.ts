import { readFileSync } from 'fs'
import { join } from 'path'
import { ServersDataSchema, type ServersData, type Server } from '@/lib/schemas'

const DATA_PATH = join(process.cwd(), 'data', 'servers.json')

export function getServersData(): ServersData {
  const raw = readFileSync(DATA_PATH, 'utf-8')
  const parsed = JSON.parse(raw)
  return ServersDataSchema.parse(parsed)
}

export function getAllServers(): Server[] {
  return getServersData().servers
}

export function getServerById(id: string): Server | undefined {
  return getServersData().servers.find((s) => s.id === id)
}

export function getAllTags(): string[] {
  const servers = getServersData().servers
  const tags = new Set<string>()
  servers.forEach((s) => s.tags.forEach((t) => tags.add(t)))
  return Array.from(tags).sort()
}

export function getServersByTag(tag: string): Server[] {
  return getServersData().servers.filter((s) => s.tags.includes(tag as Server['tags'][number]))
}

export function searchServers(query: string): Server[] {
  const normalized = query.toLowerCase()
  return getServersData().servers.filter(
    (s) =>
      s.name.toLowerCase().includes(normalized) ||
      s.description.toLowerCase().includes(normalized) ||
      s.tags.some((t) => t.toLowerCase().includes(normalized))
  )
}
