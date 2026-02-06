import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateConfig, normalizeTool, validateConfig } from '@/lib/config-generator'
import { ServerStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tool = normalizeTool(searchParams.get('tool') ?? 'claude')
  const includeStopped = searchParams.get('includeStopped') === '1'
  const serverId = searchParams.get('serverId')

  if (serverId) {
    const server = await prisma.mCPServer.findFirst({
      where: {
        OR: [{ id: serverId }, { name: serverId }],
      },
      select: { id: true },
    })

    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }

    const installations = await prisma.mCPInstallation.findMany({
      where: { serverId: server.id },
      include: { server: true },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    const config = generateConfig(tool, installations)
    const valid = validateConfig(tool, config)

    return NextResponse.json({
      tool,
      includeStopped,
      count: installations.length,
      valid,
      config,
    })
  }

  const statuses = includeStopped
    ? [ServerStatus.RUNNING, ServerStatus.STOPPED]
    : [ServerStatus.RUNNING]

  const installations = await prisma.mCPInstallation.findMany({
    where: {
      status: {
        in: statuses,
      },
    },
    include: {
      server: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const config = generateConfig(tool, installations)
  const valid = validateConfig(tool, config)

  return NextResponse.json({
    tool,
    includeStopped,
    count: installations.length,
    valid,
    config,
  })
}
