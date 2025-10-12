import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'
import { rateLimiters } from '@/lib/middleware/rate-limit-middleware'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return rateLimiters.admin(request as any, async () => {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { src, alt } = await request.json()
    if (!src || typeof src !== 'string') {
      return NextResponse.json({ error: 'src required' }, { status: 400 })
    }
    const doc = await adminDb.collection('auth_slides').add({ src, alt: alt ?? '', createdAt: new Date() })
    return NextResponse.json({ id: doc.id })
  })
}


