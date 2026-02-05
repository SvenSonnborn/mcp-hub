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

const toSafeName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'mcp-server'

const toServerEntry = (installation: InstallationWithServer): ServerEntry => {
  const config = (installation.config ?? {}) as Record<string, unknown>

  if (config.type === 'remote' && config.url) {
    return {
      name: toSafeName(installation.server.name),
      command: '',
      args: [],
      env: {},
      transport: 'http',
      url: config.url as string,
    }
  }

  const installUrl = installation.server.installUrl || ''
  const npmPackage = installUrl.replace(/^npm:/, '') || '@modelcontextprotocol/server-filesystem'

  const configArgs: string[] = []
  const env: Record<string, string> = {}

  if (config.paths && Array.isArray(config.paths)) {
    configArgs.push(...config.paths.filter((path): path is string => typeof path === 'string'))
  }

  if (config.dbPath && typeof config.dbPath === 'string') {
    configArgs.push(config.dbPath)
  }

  if (config.connectionString && typeof config.connectionString === 'string') {
    configArgs.push(config.connectionString)
  }

  if (config.repositoryPath && typeof config.repositoryPath === 'string') {
    configArgs.push(config.repositoryPath)
  }

  if (config.token && typeof config.token === 'string') {
    env.GITHUB_TOKEN = config.token
  }

  if (config.apiKey && typeof config.apiKey === 'string') {
    env.BRAVE_API_KEY = config.apiKey
  }

  if (
    config.token &&
    typeof config.token === 'string' &&
    installation.server.name.toLowerCase().includes('postgres')
  ) {
    env.DATABASE_URL =
      (config.connectionString as string | undefined) ||
      (typeof config.connectionString === 'string' ? config.connectionString : '')
  }

  return {
    name: toSafeName(installation.server.name),
    command: 'npx',
    args: ['-y', npmPackage, ...configArgs],
    env,
    transport: 'stdio',
    url: installUrl,
  }
}

export function generateConfig(tool: string, installations: InstallationWithServer[]) {
  const servers = installations.map(toServerEntry)
  const normalized = normalizeTool(tool)
  const toServerConfig = (server: ServerEntry) =>
    server.transport === 'http'
      ? { url: server.url }
      : { command: server.command, args: server.args, env: server.env }

  switch (normalized) {
    case 'claude':
      return {
        mcpServers: Object.fromEntries(
          servers.map((server) => [server.name, toServerConfig(server)])
        ),
      }
    case 'cursor':
      return {
        mcpServers: servers.map((server) => ({
          name: server.name,
          ...toServerConfig(server),
        })),
      }
    case 'windsurf':
      return {
        mcp: {
          servers: servers.map((server) => ({
            id: server.name,
            ...toServerConfig(server),
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
          ...toServerConfig(server),
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
