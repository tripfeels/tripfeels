import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { getTravellers, createTraveller, searchTravellers } from '@/lib/db/travellers'
import { withCache, cacheKeys, cacheTTL } from '@/lib/cache'
import { validatePaginationParams, PAGINATION_LIMITS } from '@/lib/pagination'
import { rateLimiters } from '@/lib/middleware/rate-limit-middleware'

// GET /api/travellers - Get all travellers with optional search and filters
export async function GET(request: NextRequest) {
  // Apply rate limiting for API endpoints
  return rateLimiters.api(request, async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const ptc = searchParams.get('ptc') || 'All'
    const nationality = searchParams.get('nationality') || 'All'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || PAGINATION_LIMITS.TRAVELLERS.toString())

    const { page: validPage, limit: validLimit } = validatePaginationParams({ page, limit })

    // Create cache key based on parameters
    const cacheKey = cacheKeys.travellers(
      session.user.id, 
      `${session.user.role}:${search}:${ptc}:${nationality}:${validPage}:${validLimit}`
    )

    // Use cache with fallback to database
    const result = await withCache(
      cacheKey,
      async () => {
        let travellers

        if (search || ptc !== 'All' || nationality !== 'All') {
          // Use search function with filters
          travellers = await searchTravellers(
            search,
            session.user.role,
            session.user.id,
            { ptc: ptc !== 'All' ? ptc : undefined, nationality: nationality !== 'All' ? nationality : undefined }
          )
        } else {
          // Get all travellers
          travellers = await getTravellers(session.user.role, session.user.id)
        }

        // Apply pagination
        const total = travellers.length
        const startIndex = (validPage - 1) * validLimit
        const endIndex = startIndex + validLimit
        const paginatedTravellers = travellers.slice(startIndex, endIndex)

        return {
          travellers: paginatedTravellers,
          total,
          page: validPage,
          limit: validLimit
        }
      },
      cacheTTL.travellers
    )

    return NextResponse.json({
      success: true,
      travellers: result.travellers,
      count: result.travellers.length,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasNext: result.travellers.length === validLimit && (result.page * validLimit) < result.total,
        hasPrev: result.page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching travellers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch travellers' },
      { status: 500 }
    )
    }
  })
}

// POST /api/travellers - Create new traveller
export async function POST(request: NextRequest) {
  // Apply rate limiting for API endpoints
  return rateLimiters.api(request, async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields - only givenName, surname, and phoneNumber are required
    const requiredFields = ['givenName', 'surname', 'phoneNumber']
    
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Helper function to convert empty strings to null for date fields
    const processDateField = (dateValue: any) => {
      if (!dateValue || dateValue === '' || dateValue === 'undefined') {
        return null
      }
      return dateValue
    }

    // Process SSR codes - convert from objects to strings and create remarks object
    const ssrCodes = (body.ssrCodes || []).map((ssr: any) => ssr.code || ssr)
    const ssrRemarks: Record<string, string> = {}
    if (body.ssrCodes && Array.isArray(body.ssrCodes)) {
      body.ssrCodes.forEach((ssr: any) => {
        if (ssr.code && ssr.remark) {
          ssrRemarks[ssr.code] = ssr.remark
        }
      })
    }

    // Create traveller with optional fields
    const traveller = await createTraveller({
      ptc: body.ptc || 'Adult',
      givenName: body.givenName,
      surname: body.surname,
      gender: body.gender || 'Other',
      birthdate: processDateField(body.birthdate),
      nationality: body.nationality || null,
      phoneNumber: body.phoneNumber,
      countryDialingCode: body.countryDialingCode || null,
      emailAddress: body.emailAddress || null,
      documentType: body.documentType || null,
      documentId: body.documentId || null,
      documentExpiryDate: processDateField(body.documentExpiryDate),
      ssrCodes: ssrCodes,
      ssrRemarks: ssrRemarks,
      loyaltyAirlineCode: body.loyaltyAirlineCode || null,
      loyaltyAccountNumber: body.loyaltyAccountNumber || null,
      createdBy: session.user.role,
      createdByUserId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      traveller
    })
  } catch (error) {
    console.error('Error creating traveller:', error)
    return NextResponse.json(
      { error: 'Failed to create traveller' },
      { status: 500 }
    )
    }
  })
}
