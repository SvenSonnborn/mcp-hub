import { describe, expect, it, vi } from 'vitest'
import { ServerStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { GET, POST } from '@/app/api/installations/route'
import { startLifecycleSimulation } from '@/lib/lifecycle-simulator'

vi.mock('@/lib/lifecycle-simulator', () => ({
  startLifecycleSimulation: vi.fn(),
}))

const prismaMock = prisma as unknown as {
  mCPServer: {
    findFirst: ReturnType<typeof vi.fn>
  }
  mCPInstallation: {
    findMany: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
  }
}

const startLifecycleSimulationMock = startLifecycleSimulation as unknown as ReturnType<typeof vi.fn>

describe('GET /api/installations', () => {
  it('returns installations array', async () => {
    prismaMock.mCPInstallation.findMany.mockResolvedValue([
      {
        id: 'install-1',
        status: 'RUNNING',
        lastPing: null,
        errorLog: null,
        server: { id: 'server-1', name: 'Server One', version: '1.0.0' },
      },
    ])

    const response = await GET(new Request('http://localhost/api/installations'))
    const payload = await response.json()

    expect(payload.installations).toHaveLength(1)
    expect(payload.installations[0].id).toBe('install-1')
  })

  it('filters by serverId when provided', async () => {
    prismaMock.mCPServer.findFirst.mockResolvedValue({ id: 'server-2' })
    prismaMock.mCPInstallation.findMany.mockResolvedValue([
      {
        id: 'install-2',
        status: 'RUNNING',
        lastPing: null,
        errorLog: null,
        server: { id: 'server-2', name: 'Server Two', version: '2.0.0' },
      },
    ])

    const response = await GET(new Request('http://localhost/api/installations?serverId=server-2'))
    const payload = await response.json()

    expect(payload.installations).toHaveLength(1)
    expect(payload.installations[0].server.id).toBe('server-2')
  })
})

describe('POST /api/installations', () => {
  it('creates installation', async () => {
    prismaMock.mCPServer.findFirst.mockResolvedValue({
      id: 'server-3',
      name: 'Server Three',
      version: '1.0.0',
    })
    prismaMock.mCPInstallation.findFirst.mockResolvedValue(null)
    prismaMock.mCPInstallation.create.mockResolvedValue({
      id: 'install-3',
      status: ServerStatus.PENDING,
      lastPing: null,
      errorLog: null,
      server: { id: 'server-3', name: 'Server Three', version: '1.0.0' },
    })

    const response = await POST(
      new Request('http://localhost/api/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: 'server-3' }),
      })
    )

    const payload = await response.json()

    expect(payload.alreadyInstalled).toBe(false)
    expect(payload.installation.id).toBe('install-3')
    expect(startLifecycleSimulationMock).toHaveBeenCalledWith('install-3')
  })

  it('returns 400 if serverId missing', async () => {
    const response = await POST(
      new Request('http://localhost/api/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    )

    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toBe('Missing serverId')
  })

  it('returns 404 if server not found', async () => {
    prismaMock.mCPServer.findFirst.mockResolvedValue(null)

    const response = await POST(
      new Request('http://localhost/api/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: 'missing' }),
      })
    )

    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error).toBe('Server not found')
  })

  it('returns alreadyInstalled when installation exists', async () => {
    prismaMock.mCPServer.findFirst.mockResolvedValue({
      id: 'server-4',
      name: 'Server Four',
      version: '1.0.0',
    })
    prismaMock.mCPInstallation.findFirst.mockResolvedValue({
      id: 'install-4',
      status: 'RUNNING',
      lastPing: null,
      errorLog: null,
      server: { id: 'server-4', name: 'Server Four', version: '1.0.0' },
    })

    const response = await POST(
      new Request('http://localhost/api/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: 'server-4' }),
      })
    )

    const payload = await response.json()

    expect(payload.alreadyInstalled).toBe(true)
    expect(payload.installation.id).toBe('install-4')
  })
})
