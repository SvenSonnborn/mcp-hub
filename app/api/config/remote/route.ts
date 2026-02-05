import { NextResponse } from 'next/server'
import { ServerStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const serverId = typeof body?.serverId === 'string' ? body.serverId : null
  const remoteUrl = typeof body?.remoteUrl === 'string' ? body.remoteUrl : null

  if (!serverId || !remoteUrl) {
    return NextResponse.json({ error: 'Missing serverId or remoteUrl' }, { status: 400 })
  }

  const server = await prisma.mCPServer.findFirst({
    where: {
      OR: [{ id: serverId }, { name: serverId }],
    },
    select: { id: true, name: true },
  })

  if (!server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const existing = await prisma.mCPInstallation.findFirst({
    where: { serverId: server.id },
  })

  if (existing) {
    return NextResponse.json({
      alreadyAdded: true,
      installation: existing,
    })
  }

  const created = await prisma.mCPInstallation.create({
    data: {
      serverId: server.id,
      status: ServerStatus.RUNNING,
      config: { url: remoteUrl, type: 'remote' },
    },
    include: {
      server: {
        select: { id: true, name: true, version: true },
      },
    },
  })

  return NextResponse.json({
    alreadyAdded: false,
    installation: created,
  })
}
