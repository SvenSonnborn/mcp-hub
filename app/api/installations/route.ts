import { NextResponse } from 'next/server'
import { ServerStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { startLifecycleSimulation } from '@/lib/lifecycle-simulator'
import { getServerById } from '@/lib/data'

export const dynamic = 'force-dynamic'

const formatInstallation = (installation: {
  id: string
  status: string
  lastPing: Date | null
  errorLog: string | null
  server: { id: string; name: string; version: string }
}) => ({
  id: installation.id,
  status: installation.status,
  lastPing: installation.lastPing ? installation.lastPing.toISOString() : null,
  errorLog: installation.errorLog,
  server: installation.server,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const serverId = searchParams.get('serverId')
  let serverFilter: { serverId?: string } = {}

  if (serverId) {
    const server = await prisma.mCPServer.findFirst({
      where: {
        OR: [{ id: serverId }, { name: serverId }],
      },
      select: { id: true },
    })
    if (!server) {
      return NextResponse.json({ installations: [] })
    }
    serverFilter = { serverId: server.id }
  }

  const installations = await prisma.mCPInstallation.findMany({
    where: serverFilter,
    include: {
      server: {
        select: {
          id: true,
          name: true,
          version: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const payload = installations.map(formatInstallation)

  return NextResponse.json({ installations: payload })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const serverId = typeof body?.serverId === 'string' ? body.serverId : null
  const config =
    body?.config && typeof body.config === 'object' && !Array.isArray(body.config)
      ? (body.config as Record<string, unknown>)
      : undefined

  if (!serverId) {
    return NextResponse.json({ error: 'Missing serverId' }, { status: 400 })
  }

  // Try to find server in database first
  let server = await prisma.mCPServer.findFirst({
    where: {
      OR: [{ id: serverId }, { name: serverId }],
    },
    select: { id: true, name: true, version: true },
  })

  // If not in DB, try to find in JSON data and create in DB
  if (!server) {
    const jsonServer = getServerById(serverId)
    if (jsonServer) {
      // Create server in database
      server = await prisma.mCPServer.create({
        data: {
          name: jsonServer.name,
          description: jsonServer.description,
          publisher: jsonServer.author,
          githubUrl: jsonServer.githubUrl,
          installUrl: jsonServer.npmPackage || '',
          version: jsonServer.version,
          category: 'OTHER',
          tags: jsonServer.tags,
          configSchema: jsonServer.configSchema || {},
        },
        select: { id: true, name: true, version: true },
      })
    }
  }

  if (!server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const existing = await prisma.mCPInstallation.findFirst({
    where: { serverId: server.id },
    include: { server: true },
  })

  if (existing) {
    return NextResponse.json({
      alreadyInstalled: true,
      installation: formatInstallation(existing),
    })
  }

  const created = await prisma.mCPInstallation.create({
    data: {
      serverId: server.id,
      status: ServerStatus.PENDING,
      config: config ? { ...config, type: 'local' } : { type: 'local' },
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

  startLifecycleSimulation(created.id)

  return NextResponse.json({
    alreadyInstalled: false,
    installation: formatInstallation(created),
  })
}
