import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ServerStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  getActiveSimulations,
  startLifecycleSimulation,
  stopLifecycleSimulation,
} from '@/lib/lifecycle-simulator'

type PrismaMock = {
  mCPInstallation: {
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
}

const prismaMock = prisma as unknown as PrismaMock

const setupStatusStore = () => {
  const statusById = new Map<string, ServerStatus>()

  prismaMock.mCPInstallation.findUnique.mockImplementation(({ where }) => {
    const status = statusById.get(where.id)
    return status ? { status } : null
  })

  prismaMock.mCPInstallation.update.mockImplementation(({ where, data }) => {
    statusById.set(where.id, data.status)
    return { id: where.id, status: data.status }
  })

  return {
    setStatus: (id: string, status: ServerStatus) => statusById.set(id, status),
    getStatus: (id: string) => statusById.get(id),
  }
}

describe('lifecycle-simulator', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    getActiveSimulations().forEach(stopLifecycleSimulation)
    vi.useRealTimers()
    randomSpy.mockRestore()
  })

  it('startLifecycleSimulation should schedule pending step', () => {
    setupStatusStore().setStatus('install-1', ServerStatus.PENDING)
    startLifecycleSimulation('install-1')

    expect(getActiveSimulations()).toContain('install-1')
  })

  it('should transition PENDING to INSTALLING after ~5s', async () => {
    const store = setupStatusStore()
    store.setStatus('install-2', ServerStatus.PENDING)

    startLifecycleSimulation('install-2')
    await vi.advanceTimersByTimeAsync(5000)

    expect(store.getStatus('install-2')).toBe(ServerStatus.INSTALLING)
  })

  it('should transition INSTALLING to RUNNING after ~10s', async () => {
    const store = setupStatusStore()
    store.setStatus('install-3', ServerStatus.PENDING)

    startLifecycleSimulation('install-3')
    await vi.advanceTimersByTimeAsync(5000)
    await vi.advanceTimersByTimeAsync(10000)

    expect(store.getStatus('install-3')).toBe(ServerStatus.RUNNING)
  })

  it('stopLifecycleSimulation should clear timers', () => {
    setupStatusStore().setStatus('install-4', ServerStatus.PENDING)

    startLifecycleSimulation('install-4')
    stopLifecycleSimulation('install-4')

    expect(getActiveSimulations()).not.toContain('install-4')
  })

  it('getActiveSimulations should return active installation IDs', () => {
    const store = setupStatusStore()
    store.setStatus('install-5', ServerStatus.PENDING)
    store.setStatus('install-6', ServerStatus.PENDING)

    startLifecycleSimulation('install-5')
    startLifecycleSimulation('install-6')

    expect(getActiveSimulations()).toEqual(expect.arrayContaining(['install-5', 'install-6']))
  })

  it('should stop simulation when terminal status reached', async () => {
    const store = setupStatusStore()
    store.setStatus('install-7', ServerStatus.RUNNING)

    startLifecycleSimulation('install-7')
    await vi.advanceTimersByTimeAsync(5000)

    expect(prismaMock.mCPInstallation.update).not.toHaveBeenCalled()
    expect(getActiveSimulations()).not.toContain('install-7')
  })

  it('multiple simulations should work independently', async () => {
    const store = setupStatusStore()
    store.setStatus('install-8', ServerStatus.PENDING)
    store.setStatus('install-9', ServerStatus.PENDING)

    startLifecycleSimulation('install-8')
    startLifecycleSimulation('install-9')
    await vi.advanceTimersByTimeAsync(5000)

    expect(store.getStatus('install-8')).toBe(ServerStatus.INSTALLING)
    expect(store.getStatus('install-9')).toBe(ServerStatus.INSTALLING)
  })

  it('clears timers when database update fails', async () => {
    const store = setupStatusStore()
    store.setStatus('install-10', ServerStatus.PENDING)

    prismaMock.mCPInstallation.update.mockImplementation(() => {
      throw new Error('DB error')
    })

    startLifecycleSimulation('install-10')
    await vi.advanceTimersByTimeAsync(5000)

    expect(getActiveSimulations()).not.toContain('install-10')
  })
})
