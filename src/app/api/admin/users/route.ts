import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'
import { withCache, cacheKeys, cacheTTL } from '@/lib/cache'
import { validatePaginationParams, PAGINATION_LIMITS } from '@/lib/pagination'
import { logApiError } from '@/lib/error-monitoring'
import { rateLimiters } from '@/lib/middleware/rate-limit-middleware'

export async function GET(request: NextRequest) {
  // Apply rate limiting for admin endpoints
  return rateLimiters.admin(request, async (req: NextRequest) => {
    // Parse pagination parameters from query string (outside try block for error logging)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || PAGINATION_LIMITS.USERS.toString())
    const roleFilter = searchParams.get('role') || 'all'
    const search = searchParams.get('search') || ''
    const { page: validPage, limit: validLimit } = validatePaginationParams({ page, limit })

    try {
    // Check Firebase Admin configuration
    if (!adminDb) {
      console.error('Firebase Admin not initialized')
      return NextResponse.json({
        error: 'Server configuration error: Firebase Admin not configured'
      }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    const role = session?.user?.role as string | undefined

    if (!session || !role || (role !== 'SuperAdmin' && role !== 'Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create cache key based on parameters
    const cacheKey = cacheKeys.users(validLimit, `${roleFilter}:${search}`)

    // Use cache with fallback to database
    const result = await withCache(
      cacheKey,
      async () => {
        let query: any = adminDb!.collection('users')
        
        // Apply role filter if specified
        if (roleFilter !== 'all') {
          query = query.where('role', '==', roleFilter)
        }
        
        // Apply search filter if specified
        if (search) {
          // Note: Firestore doesn't support full-text search, so we'll filter client-side
          // For better performance, consider using Algolia or similar search service
        }
        
        // Get total count for pagination (limited to avoid performance issues)
        const countSnapshot = await query.limit(1000).get()
        const total = countSnapshot.size
        
        // Apply pagination
        const offset = (validPage - 1) * validLimit
        const snapshot = await query
          .orderBy('metadata.createdAt', 'desc')
          .offset(offset)
          .limit(validLimit)
          .get()
        
        const users = snapshot.docs.map((d: any) => {
          const data = d.data()
          // Ensure timestamps are properly serialized
          if (data.metadata?.createdAt) {
            data.metadata.createdAt = {
              seconds: data.metadata.createdAt.seconds,
              nanoseconds: data.metadata.createdAt.nanoseconds
            }
          }
          if (data.metadata?.lastLoginAt) {
            data.metadata.lastLoginAt = {
              seconds: data.metadata.lastLoginAt.seconds,
              nanoseconds: data.metadata.lastLoginAt.nanoseconds
            }
          }
          return { uid: d.id, ...data }
        })

        // Apply client-side search filter if needed
        const filteredUsers = search 
          ? users.filter((user: any) => {
              const searchLower = search.toLowerCase()
              const name = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.toLowerCase()
              return (
                user.email.toLowerCase().includes(searchLower) ||
                name.includes(searchLower) ||
                user.role.toLowerCase().includes(searchLower)
              )
            })
          : users

        return {
          users: filteredUsers,
          total: Math.min(total, 1000), // Cap total at 1000 for performance
          page: validPage,
          limit: validLimit
        }
      },
      cacheTTL.users
    )
    
    return NextResponse.json({
      users: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasNext: result.users.length === validLimit && (result.page * validLimit) < result.total,
        hasPrev: result.page > 1
      }
    })
  } catch (err) {
    console.error('Error fetching users:', err)
    
    // Log error with context
    logApiError(
      '/api/admin/users',
      'GET',
      500,
      err as Error,
      { page: validPage, limit: validLimit, roleFilter, search }
    )
    
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : String(err)) : undefined
    }, { status: 500 })
    }
  })
}


