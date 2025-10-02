import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'

export async function GET() {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Debug endpoints are only available in development' }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get all users from Firestore
    const usersSnapshot = await adminDb.collection('users').get()
    const users = []

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      users.push({
        uid: doc.id,
        email: userData.email,
        role: userData.role,
        profileRole: userData.profile?.role,
        hasRoleInProfile: !!userData.profile?.role,
        hasRoleAtRoot: !!userData.role
      })
    }

    return NextResponse.json({
      success: true,
      users,
      summary: {
        total: users.length,
        withRoleAtRoot: users.filter(u => u.hasRoleAtRoot).length,
        withRoleInProfile: users.filter(u => u.hasRoleInProfile).length,
        missingRole: users.filter(u => !u.hasRoleAtRoot && !u.hasRoleInProfile).length
      }
    })

  } catch (error) {
    console.error('Error getting user data:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
