import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { rateLimiter, RATE_LIMIT_CONFIGS, getClientIP, KEY_GENERATORS } from '@/lib/rate-limiting'

/**
 * GET /api/rate-limit/status
 * Check rate limit status for current user/IP
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const ip = getClientIP(request)
    
    // Only allow authenticated users or in development
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session?.user?.id
    const userRole = session?.user?.role || 'anonymous'

    // Check status for different rate limit types
    const statuses = {
      ip: rateLimiter.getStatus(KEY_GENERATORS.IP(ip), RATE_LIMIT_CONFIGS.API),
      user: userId ? rateLimiter.getStatus(KEY_GENERATORS.USER(userId), RATE_LIMIT_CONFIGS.API) : null,
      auth: rateLimiter.getStatus(KEY_GENERATORS.IP(ip), RATE_LIMIT_CONFIGS.AUTH),
      admin: session?.user?.role === 'SuperAdmin' || session?.user?.role === 'Admin' 
        ? rateLimiter.getStatus(KEY_GENERATORS.USER(userId!), RATE_LIMIT_CONFIGS.ADMIN)
        : null
    }

    return NextResponse.json({
      success: true,
      ip,
      userId,
      userRole,
      statuses,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error checking rate limit status:', error)
    return NextResponse.json(
      { error: 'Failed to check rate limit status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rate-limit/status
 * Reset rate limits (SuperAdmin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only SuperAdmin can reset rate limits
    if (!session || session.user.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { targetUserId, targetIp, limitType } = await request.json()
    
    if (!targetUserId && !targetIp) {
      return NextResponse.json({ error: 'Must provide targetUserId or targetIp' }, { status: 400 })
    }

    const config = RATE_LIMIT_CONFIGS[limitType as keyof typeof RATE_LIMIT_CONFIGS] || RATE_LIMIT_CONFIGS.API

    // Reset rate limits
    if (targetUserId) {
      rateLimiter.reset(KEY_GENERATORS.USER(targetUserId), config)
    }
    
    if (targetIp) {
      rateLimiter.reset(KEY_GENERATORS.IP(targetIp), config)
    }

    return NextResponse.json({
      success: true,
      message: 'Rate limits reset successfully',
      resetFor: { targetUserId, targetIp, limitType }
    })

  } catch (error) {
    console.error('Error resetting rate limits:', error)
    return NextResponse.json(
      { error: 'Failed to reset rate limits' },
      { status: 500 }
    )
  }
}
