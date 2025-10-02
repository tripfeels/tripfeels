import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST() {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Fix endpoints are only available in development' }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get all users from Firestore
    const usersSnapshot = await adminDb.collection('users').get()
    const fixedUsers = []
    const errors = []

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      const userId = doc.id
      
      // Check if role is incorrectly stored in profile object
      if (userData.profile && userData.profile.role && !userData.role) {
        try {
          // Move role from profile to root level
          await adminDb.collection('users').doc(userId).update({
            role: userData.profile.role,
            'profile.role': FieldValue.delete()
          })
          
          fixedUsers.push({
            uid: userId,
            email: userData.email,
            oldRole: userData.profile.role,
            newRole: userData.profile.role
          })
        } catch (error) {
          errors.push({
            uid: userId,
            email: userData.email,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedUsers.length} users`,
      fixedUsers,
      errors
    })

  } catch (error) {
    console.error('Error fixing user roles:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
