import { describe, expect, it, vi } from 'vitest'
import { buildHealthMetrics } from '@/lib/health'
import { prisma } from '@/lib/prisma'
import { GET } from '@/app/api/health/[id]/route'

vi.mock('@/lib/health', () => ({
  buildHealthMetrics: vi.fn(),
}))

const prismaMock = prisma as unknown as {
  mCPInstallation: {
    findUnique: ReturnType<typeof vi.fn>
  }
}

describe('GET /api/health/[id]', () => {
  it('returns health metrics for existing installation', async () => {
    const mockInstallation = {
      id: 'install-1',
      status: 'RUNNING',
      lastPing: new Date(),
      errorLog: null,
    }

    prismaMock.mCPInstallation.findUnique.mockResolvedValue(mockInstallation)
    const buildHealthMetricsMock = buildHealthMetrics as unknown as ReturnType<typeof vi.fn>
    buildHealthMetricsMock.mockReturnValue({
      installationId: 'install-1',
      status: 'HEALTHY',
      uptimeSeconds: 3600,
      avgResponseMs: 120,
      requestsPerMin: 45,
      errorRate: 0.01,
      lastPing: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const response = await GET(new Request('http://localhost/api/health/install-1'), {
      params: Promise.resolve({ id: 'install-1' }),
    })

    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.metrics.installationId).toBe('install-1')
    expect(payload.metrics.status).toBe('HEALTHY')
  })

  it('returns 404 for non-existent installation', async () => {
    prismaMock.mCPInstallation.findUnique.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/api/health/missing'), {
      params: Promise.resolve({ id: 'missing' }),
    })

    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error).toBe('Installation not found')
  })
})
