import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get all users from Firestore with raw timestamp data
    const usersSnapshot = await adminDb.collection('users').get()
    const users = []

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      users.push({
        uid: doc.id,
        email: userData.email,
        role: userData.role,
        metadata: {
          createdAt: userData.metadata?.createdAt,
          lastLoginAt: userData.metadata?.lastLoginAt,
          isActive: userData.metadata?.isActive,
          emailVerified: userData.metadata?.emailVerified
        },
        // Raw timestamp data for debugging
        rawTimestamps: {
          createdAt: userData.metadata?.createdAt ? {
            seconds: userData.metadata.createdAt.seconds,
            nanoseconds: userData.metadata.createdAt.nanoseconds,
            toDate: userData.metadata.createdAt.toDate ? userData.metadata.createdAt.toDate().toISOString() : 'No toDate method'
          } : null,
          lastLoginAt: userData.metadata?.lastLoginAt ? {
            seconds: userData.metadata.lastLoginAt.seconds,
            nanoseconds: userData.metadata.lastLoginAt.nanoseconds,
            toDate: userData.metadata.lastLoginAt.toDate ? userData.metadata.lastLoginAt.toDate().toISOString() : 'No toDate method'
          } : null
        }
      })
    }

    return NextResponse.json({
      success: true,
      users,
      summary: {
        total: users.length,
        withLastLoginAt: users.filter(u => u.metadata.lastLoginAt).length,
        withoutLastLoginAt: users.filter(u => !u.metadata.lastLoginAt).length
      }
    })

  } catch (error) {
    console.error('Error getting timestamp debug data:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
