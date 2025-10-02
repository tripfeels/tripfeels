import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb, adminAuth } from '@/lib/firebase/admin'

export async function GET() {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Debug endpoints are only available in development' }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get all users from Firestore
    const snapshot = await adminDb.collection('users').get()
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
    
    // Also check Firebase Auth users
    const authUsers = await adminAuth.listUsers()
    
    return NextResponse.json({ 
      firestoreUsers: users.length,
      authUsers: authUsers.users.length,
      users: users.slice(0, 5), // Return first 5 users for debugging
      authUserEmails: authUsers.users.map(u => u.email).slice(0, 5)
    })
  } catch (err) {
    console.error('Debug error:', err)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 })
  }
}
