import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Find Ashif Babu's user document
    const ashifEmail = 'asif.java.dev@gmail.com'
    const usersSnapshot = await adminDb.collection('users').where('email', '==', ashifEmail).get()
    
    if (usersSnapshot.empty) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userDoc = usersSnapshot.docs[0]
    const userData = userDoc.data()
    const userId = userDoc.id

    console.log('Current user data:', {
      uid: userId,
      email: userData.email,
      role: userData.role,
      profileRole: userData.profile?.role
    })

    // Check if role is in profile object but not at root level
    if (userData.profile?.role && !userData.role) {
      console.log(`Moving role from profile to root level: ${userData.profile.role}`)
      
      // Update the document to move role from profile to root level
      await adminDb.collection('users').doc(userId).update({
        role: userData.profile.role,
        'profile.role': FieldValue.delete()
      })

      return NextResponse.json({
        success: true,
        message: `Successfully moved role from profile to root level`,
        user: {
          uid: userId,
          email: userData.email,
          newRole: userData.profile.role
        }
      })
    } else if (userData.role) {
      return NextResponse.json({
        success: true,
        message: 'Role is already at root level',
        user: {
          uid: userId,
          email: userData.email,
          role: userData.role
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No role found in either location',
        user: {
          uid: userId,
          email: userData.email
        }
      })
    }

  } catch (error) {
    console.error('Error fixing Ashif role:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
