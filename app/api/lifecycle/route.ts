import { NextResponse } from 'next/server'
import { getActiveSimulations } from '@/lib/lifecycle-simulator'

export const dynamic = 'force-dynamic'

export async function GET() {
  const activeSimulations = getActiveSimulations()

  return NextResponse.json({
    count: activeSimulations.length,
    installations: activeSimulations,
  })
}
