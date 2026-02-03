import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [totalServers, totalInstallations, recentInstallations] = await Promise.all([
      prisma.mCPServer.count(),
      prisma.mCPInstallation.count(),
      prisma.mCPInstallation.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    const servers = await prisma.mCPServer.findMany({
      take: 6,
      orderBy: { downloadCount: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        isOfficial: true,
      },
    })

    return NextResponse.json({
      stats: {
        totalServers,
        totalInstallations,
        recentInstallations,
      },
      servers,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
