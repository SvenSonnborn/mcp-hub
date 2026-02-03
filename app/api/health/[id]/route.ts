import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildHealthMetrics } from '@/lib/health'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const installation = await prisma.mCPInstallation.findUnique({
    where: { id },
  })

  if (!installation) {
    return NextResponse.json({ error: 'Installation not found' }, { status: 404 })
  }

  const metrics = buildHealthMetrics(installation)
  return NextResponse.json({ metrics })
}
