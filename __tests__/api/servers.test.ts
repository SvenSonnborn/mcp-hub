import { describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { POST } from '@/app/api/servers/route'

const prismaMock = prisma as unknown as {
  mCPServer: {
    create: ReturnType<typeof vi.fn>
  }
}

const validPayload = {
  name: 'Acme MCP',
  description: 'A helpful MCP server for testing purposes.',
  publisher: 'Acme Labs',
  githubUrl: 'https://github.com/acme/mcp',
  installUrl: 'https://npmjs.com/package/acme-mcp',
  version: '1.2.3',
  category: 'API',
  tags: ['api'],
}

describe('POST /api/servers', () => {
  it('creates server with valid data', async () => {
    prismaMock.mCPServer.create.mockResolvedValue({
      id: 'server-1',
      ...validPayload,
      isOfficial: false,
      isVerified: false,
      downloadCount: 0,
      rating: 0,
    })

    const response = await POST(
      new Request('http://localhost/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      })
    )

    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(payload.server.name).toBe(validPayload.name)
  })

  it('returns 400 for invalid data', async () => {
    const response = await POST(
      new Request('http://localhost/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      })
    )

    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toBe('Invalid payload')
  })

  it('returns 409 for duplicate name', async () => {
    prismaMock.mCPServer.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '6.2.1',
      })
    )

    const response = await POST(
      new Request('http://localhost/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      })
    )

    const payload = await response.json()

    expect(response.status).toBe(409)
    expect(payload.error).toContain('already exists')
  })

  it('sets default values', async () => {
    prismaMock.mCPServer.create.mockImplementation(({ data }) => data)

    const response = await POST(
      new Request('http://localhost/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      })
    )

    const payload = await response.json()

    expect(payload.server.isOfficial).toBe(false)
    expect(payload.server.isVerified).toBe(false)
    expect(payload.server.downloadCount).toBe(0)
    expect(payload.server.rating).toBe(0)
  })
})
