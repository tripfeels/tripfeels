import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { type RoleType } from '@/lib/firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    // Get all users from the database
    const usersSnapshot = await adminDb.collection('users').get()
    const users = usersSnapshot.docs.map(doc => doc.data())

    // Calculate statistics
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.metadata?.isActive).length,
      usersByRole: {
        SuperAdmin: users.filter(user => user.role === 'SuperAdmin').length,
        Admin: users.filter(user => user.role === 'Admin').length,
        Staff: users.filter(user => user.role === 'Staff').length,
        Partner: users.filter(user => user.role === 'Partner').length,
        Agent: users.filter(user => user.role === 'Agent').length,
        User: users.filter(user => user.role === 'User').length,
      },
      // Calculate trends (simplified - you could store historical data for more accurate trends)
      trends: {
        totalUsers: Math.floor(Math.random() * 10) + 1, // Placeholder trend
        activeUsers: Math.floor(Math.random() * 8) + 1,
        staff: Math.floor(Math.random() * 5) + 1,
        partners: Math.floor(Math.random() * 3) + 1,
        agents: Math.floor(Math.random() * 6) + 1,
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
