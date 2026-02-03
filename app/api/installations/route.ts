import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const installations = await prisma.mCPInstallation.findMany({
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

  const payload = installations.map((installation) => ({
    id: installation.id,
    status: installation.status,
    lastPing: installation.lastPing ? installation.lastPing.toISOString() : null,
    errorLog: installation.errorLog,
    server: installation.server,
  }))

  return NextResponse.json({ installations: payload })
}
