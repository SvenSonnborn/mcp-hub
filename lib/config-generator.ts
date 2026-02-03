import type { MCPInstallation, MCPServer } from '@prisma/client'

export type ToolId = 'claude' | 'cursor' | 'windsurf' | 'generic'

export type InstallationWithServer = MCPInstallation & { server: MCPServer }

type ServerEntry = {
  name: string
  command: string
  args: string[]
  env: Record<string, string>
  transport: 'stdio' | 'http'
  url?: string
}

const FALLBACK_COMMAND = 'node'

const toSafeName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'mcp-server'

const toServerEntry = (installation: InstallationWithServer): ServerEntry => {
  const config = (installation.config ?? {}) as Record<string, unknown>
  const command = typeof config.command === 'string' ? config.command : FALLBACK_COMMAND
  const args = Array.isArray(config.args)
    ? config.args.filter((arg) => typeof arg === 'string')
    : []
  const env: Record<string, string> =
    config.env && typeof config.env === 'object' && !Array.isArray(config.env)
      ? Object.fromEntries(
          Object.entries(config.env as Record<string, unknown>).filter(
            ([, value]) => typeof value === 'string'
          ) as [string, string][]
        )
      : {}

  const transport =
    config.transport === 'http' || config.transport === 'stdio' ? config.transport : 'stdio'
  const url = typeof config.url === 'string' ? config.url : installation.server.installUrl

  return {
    name: toSafeName(installation.server.name),
    command,
    args,
    env,
    transport,
    url,
  }
}

export function generateConfig(tool: string, installations: InstallationWithServer[]) {
  const servers = installations.map(toServerEntry)
  const normalized = normalizeTool(tool)

  switch (normalized) {
    case 'claude':
      return {
        mcpServers: Object.fromEntries(
          servers.map((server) => [
            server.name,
            {
              command: server.command,
              args: server.args,
              env: server.env,
              transport: server.transport,
              url: server.url,
            },
          ])
        ),
      }
    case 'cursor':
      return {
        mcpServers: servers.map((server) => ({
          name: server.name,
          command: server.command,
          args: server.args,
          env: server.env,
          transport: server.transport,
          url: server.url,
        })),
      }
    case 'windsurf':
      return {
        mcp: {
          servers: servers.map((server) => ({
            id: server.name,
            command: server.command,
            args: server.args,
            env: server.env,
            transport: server.transport,
            url: server.url,
            enabled: true,
          })),
        },
      }
    case 'generic':
    default:
      return {
        version: 1,
        servers: servers.map((server) => ({
          name: server.name,
          command: server.command,
          args: server.args,
          env: server.env,
          transport: server.transport,
          url: server.url,
        })),
      }
  }
}

export function validateConfig(tool: string, config: unknown) {
  const normalized = normalizeTool(tool)
  if (!config || typeof config !== 'object') return false

  switch (normalized) {
    case 'claude':
      return typeof (config as { mcpServers?: unknown }).mcpServers === 'object'
    case 'cursor':
      return Array.isArray((config as { mcpServers?: unknown }).mcpServers)
    case 'windsurf':
      return Array.isArray((config as { mcp?: { servers?: unknown } }).mcp?.servers)
    case 'generic':
      return Array.isArray((config as { servers?: unknown }).servers)
    default:
      return false
  }
}

export function normalizeTool(tool: string): ToolId {
  const lowered = tool.toLowerCase()
  if (lowered === 'claude') return 'claude'
  if (lowered === 'cursor') return 'cursor'
  if (lowered === 'windsurf') return 'windsurf'
  return 'generic'
}
