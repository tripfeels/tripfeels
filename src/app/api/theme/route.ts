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
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (session.user as any)?.role || 'User'
    if (role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { colorTheme, mode } = body || {}

    const allowed = ['default','red','rose','orange','yellow','green','blue','violet','teal','slate']
    const themeName = typeof colorTheme === 'string' && allowed.includes(colorTheme) ? colorTheme : 'slate'
    const themeMode = mode === 'dark' ? 'dark' : 'light'

    const payload = {
      colorTheme: themeName,
      mode: themeMode,
      updatedAt: new Date(),
      updatedBy: (session.user as any).id,
    }

    await adminDb!.collection('themes').doc('global').set(payload, { merge: true })

    return NextResponse.json({ ok: true, theme: payload })
  } catch (error: any) {
    console.error('POST /api/theme error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
