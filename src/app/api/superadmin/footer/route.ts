import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { rateLimiters } from '@/lib/middleware/rate-limit-middleware'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

const schema = z.object({
  social: z
    .object({
      facebook: z.string().url().nullable().optional(),
      instagram: z.string().url().nullable().optional(),
      community: z.string().url().nullable().optional(),
    })
    .partial()
    .optional(),
  privacyContent: z.string().nullable().optional(),
  termsContent: z.string().nullable().optional(),
})

const COL = 'footer'
const DOC = 'global'

export async function GET(request: NextRequest) {
  return rateLimiters.api(request, async () => {
    const snap = await adminDb!.collection(COL).doc(DOC).get()
    if (!snap.exists) {
      return NextResponse.json({ settings: null })
    }
    return NextResponse.json({ settings: snap.data() })
  })
}

export async function PUT(request: NextRequest) {
  return rateLimiters.admin(request, async () => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const json = await request.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    await adminDb!.collection(COL).doc(DOC).set(
      {
        ...data,
        updatedAt: new Date(),
        updatedBy: session.user.id || null,
      },
      { merge: true }
    )

    const snap = await adminDb!.collection(COL).doc(DOC).get()
    return NextResponse.json({ settings: snap.data() })
  })
}
