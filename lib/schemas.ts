import { z } from 'zod'

export const ServerTagSchema = z.enum([
  'official',
  'filesystem',
  'github',
  'database',
  'postgres',
  'sqlite',
  'search',
  'web',
  'browser',
  'automation',
  'api',
  'ai',
  'tools',
  'cloud',
  'remote',
  'local',
])

export const ServerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().min(10),
  author: z.string().min(1),
  authorUrl: z.string().url().optional(),
  tags: z.array(ServerTagSchema),
  githubUrl: z.string().url(),
  type: z.enum(['local', 'remote']),
  remoteUrl: z.string().url().optional(),
  npmPackage: z.string().optional(),
  downloads: z.string(),
  version: z.string().default('1.0.0'),
  lastUpdated: z.string().datetime().optional(),
  license: z.string().default('MIT'),
  tools: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    )
    .optional(),
})

export const ServersDataSchema = z.object({
  version: z.string(),
  lastUpdated: z.string().datetime(),
  servers: z.array(ServerSchema),
})

export type ServerTag = z.infer<typeof ServerTagSchema>
export type Server = z.infer<typeof ServerSchema>
export type ServersData = z.infer<typeof ServersDataSchema>
