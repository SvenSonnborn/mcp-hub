import { NextResponse } from 'next/server'
import { ServerStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { stopLifecycleSimulation } from '@/lib/lifecycle-simulator'

export const dynamic = 'force-dynamic'

const isServerStatus = (value: unknown): value is ServerStatus =>
  Object.values(ServerStatus).includes(value as ServerStatus)

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const data: Record<string, unknown> = {}

  if (body?.status !== undefined) {
    if (!isServerStatus(body.status)) {
      return NextResponse.json({ error: 'Invalid status update' }, { status: 400 })
    }
    data.status = body.status
    if (body.status === ServerStatus.RUNNING) {
      data.lastPing = new Date()
    }
  }

  if (body?.config !== undefined) {
    data.config = body.config ?? {}
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  try {
    const updated = await prisma.mCPInstallation.update({
      where: { id },
      data,
      include: {
        server: {
          select: {
            id: true,
            name: true,
            version: true,
          },
        },
      },
    })

    if (body?.status === ServerStatus.ERROR || body?.status === ServerStatus.STOPPED) {
      stopLifecycleSimulation(id)
    }

    return NextResponse.json({
      installation: {
        id: updated.id,
        status: updated.status,
        lastPing: updated.lastPing ? updated.lastPing.toISOString() : null,
        errorLog: updated.errorLog,
        server: updated.server,
        config: updated.config ?? {},
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Installation not found' }, { status: 404 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    stopLifecycleSimulation(id)
    await prisma.mCPInstallation.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Installation not found' }, { status: 404 })
  }
}
