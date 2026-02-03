import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const actionToStatus = (action: string | undefined) => {
  switch (action) {
    case 'start':
      return 'RUNNING'
    case 'stop':
      return 'STOPPED'
    case 'restart':
      return 'RUNNING'
    default:
      return null
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const nextStatus = body?.status ?? actionToStatus(body?.action)

  if (!nextStatus) {
    return NextResponse.json({ error: 'Invalid status update' }, { status: 400 })
  }

  try {
    const updated = await prisma.mCPInstallation.update({
      where: { id },
      data: {
        status: nextStatus,
        lastPing: nextStatus === 'RUNNING' ? new Date() : undefined,
      },
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

    return NextResponse.json({
      installation: {
        id: updated.id,
        status: updated.status,
        lastPing: updated.lastPing ? updated.lastPing.toISOString() : null,
        errorLog: updated.errorLog,
        server: updated.server,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Installation not found' }, { status: 404 })
  }
}
