import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

function isValidHex(str: unknown) {
  return typeof str === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(str)
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (session.user as any)?.role || 'User'
    if (role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      bgStyle,
      solidColor,
      gradientFrom,
      gradientVia,
      gradientTo,
      colorTheme,
    } = body || {}

    if (!['solid', 'gradient', 'animated'].includes(bgStyle)) {
      return NextResponse.json({ error: 'Invalid bgStyle' }, { status: 400 })
    }

    if (bgStyle === 'solid' && !isValidHex(solidColor)) {
      return NextResponse.json({ error: 'Invalid solidColor' }, { status: 400 })
    }

    if ((bgStyle === 'gradient' || bgStyle === 'animated')) {
      if (!isValidHex(gradientFrom) || !isValidHex(gradientVia) || !isValidHex(gradientTo)) {
        return NextResponse.json({ error: 'Invalid gradient colors' }, { status: 400 })
      }
    }

    const payload = {
      bgStyle,
      solidColor,
      gradientFrom,
      gradientVia,
      gradientTo,
      colorTheme: typeof colorTheme === 'string' ? colorTheme : 'slate',
      updatedAt: new Date(),
      updatedBy: session.user.id,
    }

    await adminDb.collection('themes').doc('global').set(payload, { merge: true })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('POST /api/theme error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
