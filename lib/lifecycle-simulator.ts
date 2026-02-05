import { ServerStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const activeSimulations = new Map<string, NodeJS.Timeout>()

const RANDOM_DELAY_MS = 2000
const PENDING_DELAY_MS = 5000
const INSTALLING_DELAY_MS = 10000

const terminalStatuses = new Set<ServerStatus>([
  ServerStatus.RUNNING,
  ServerStatus.ERROR,
  ServerStatus.STOPPED,
])

const randomDelay = () => Math.floor(Math.random() * (RANDOM_DELAY_MS + 1))

const clearTimer = (installationId: string) => {
  const existing = activeSimulations.get(installationId)
  if (existing) {
    clearTimeout(existing)
  }
  activeSimulations.delete(installationId)
}

const scheduleNext = (installationId: string, timeoutId: NodeJS.Timeout) => {
  activeSimulations.set(installationId, timeoutId)
}

const updateStatusIfCurrent = async (
  installationId: string,
  expectedStatus: ServerStatus,
  nextStatus: ServerStatus
) => {
  const current = await prisma.mCPInstallation.findUnique({
    where: { id: installationId },
    select: { status: true },
  })

  if (!current) {
    clearTimer(installationId)
    return false
  }

  if (terminalStatuses.has(current.status)) {
    clearTimer(installationId)
    return false
  }

  if (current.status !== expectedStatus) {
    clearTimer(installationId)
    return false
  }

  await prisma.mCPInstallation.update({
    where: { id: installationId },
    data: { status: nextStatus },
  })

  if (terminalStatuses.has(nextStatus)) {
    clearTimer(installationId)
    return false
  }

  return true
}

const scheduleInstallStep = (installationId: string) => {
  const timeoutId = setTimeout(async () => {
    try {
      const updated = await updateStatusIfCurrent(
        installationId,
        ServerStatus.INSTALLING,
        ServerStatus.RUNNING
      )
      if (!updated) return
    } catch (error) {
      clearTimer(installationId)
    }
  }, INSTALLING_DELAY_MS + randomDelay())

  scheduleNext(installationId, timeoutId)
}

const schedulePendingStep = (installationId: string) => {
  const timeoutId = setTimeout(async () => {
    try {
      const updated = await updateStatusIfCurrent(
        installationId,
        ServerStatus.PENDING,
        ServerStatus.INSTALLING
      )
      if (!updated) return
      scheduleInstallStep(installationId)
    } catch (error) {
      clearTimer(installationId)
    }
  }, PENDING_DELAY_MS + randomDelay())

  scheduleNext(installationId, timeoutId)
}

/**
 * Start a status lifecycle simulation for a given installation.
 */
export const startLifecycleSimulation = (installationId: string) => {
  clearTimer(installationId)
  schedulePendingStep(installationId)
}

/**
 * Stop a status lifecycle simulation for a given installation.
 */
export const stopLifecycleSimulation = (installationId: string) => {
  clearTimer(installationId)
}

/**
 * Get the list of installation IDs with active simulations.
 */
export const getActiveSimulations = () => Array.from(activeSimulations.keys())
