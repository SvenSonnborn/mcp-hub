import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CreateServerSchema } from '@/lib/validators/servers'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const parsed = CreateServerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid payload',
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 }
    )
  }

  try {
    const created = await prisma.mCPServer.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        publisher: parsed.data.publisher,
        githubUrl: parsed.data.githubUrl,
        installUrl: parsed.data.installUrl,
        version: parsed.data.version,
        category: parsed.data.category,
        tags: parsed.data.tags,
        isOfficial: false,
        isVerified: false,
        downloadCount: 0,
        rating: 0,
      },
    })

    return NextResponse.json({ server: created }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A server with this name already exists.' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json({ error: 'Unable to create server' }, { status: 500 })
  }
}
