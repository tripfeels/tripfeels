import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { getTravellers, createTraveller, searchTravellers, getTravellersPaged } from '@/lib/db/travellers'
import { withCache, cacheKeys, cacheTTL } from '@/lib/cache'
import { validatePaginationParams, PAGINATION_LIMITS } from '@/lib/pagination'
import { rateLimiters } from '@/lib/middleware/rate-limit-middleware'
import { z } from 'zod'

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
        const { rows, total } = await getTravellersPaged(
          session.user.role,
          session.user.id,
          {
            search: search || undefined,
            filters: {
              ptc: ptc !== 'All' ? ptc : undefined,
              nationality: nationality !== 'All' ? nationality : undefined,
            },
            page: validPage,
            limit: validLimit,
          }
        )

        return { travellers: rows, total, page: validPage, limit: validLimit }
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
        hasNext: (result.page * result.limit) < result.total,
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

    const travellerCreateSchema = z.object({
      ptc: z.string().optional(),
      givenName: z.string().min(1),
      surname: z.string().min(1),
      gender: z.string().optional(),
      birthdate: z.union([z.string().min(1), z.null(), z.undefined()]).optional(),
      nationality: z.string().max(3).optional(),
      phoneNumber: z.string().min(1),
      countryDialingCode: z.string().optional(),
      emailAddress: z.string().email().optional(),
      documentType: z.string().optional(),
      documentId: z.string().optional(),
      documentExpiryDate: z.union([z.string().min(1), z.null(), z.undefined()]).optional(),
      ssrCodes: z.array(z.union([z.string(), z.object({ code: z.string(), remark: z.string().optional() })])).optional(),
      loyaltyAirlineCode: z.string().optional(),
      loyaltyAccountNumber: z.string().optional(),
    })

    const parsed = travellerCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Helper function to convert empty strings to null for date fields
    const processDateField = (dateValue: any) => {
      if (!dateValue || dateValue === '' || dateValue === 'undefined') {
        return null
      }
      return dateValue
    }

    // Process SSR codes - convert from objects to strings and create remarks object
    const ssrCodes = (data.ssrCodes || []).map((ssr: any) => ssr.code || ssr)
    const ssrRemarks: Record<string, string> = {}
    if (data.ssrCodes && Array.isArray(data.ssrCodes)) {
      data.ssrCodes.forEach((ssr: any) => {
        if (ssr.code && ssr.remark) {
          ssrRemarks[ssr.code] = ssr.remark
        }
      })
    }

    // Create traveller with optional fields
    const traveller = await createTraveller({
      ptc: data.ptc || 'Adult',
      givenName: data.givenName,
      surname: data.surname,
      gender: data.gender || 'Other',
      birthdate: processDateField(data.birthdate),
      nationality: data.nationality || null,
      phoneNumber: data.phoneNumber,
      countryDialingCode: data.countryDialingCode || null,
      emailAddress: data.emailAddress || null,
      documentType: data.documentType || null,
      documentId: data.documentId || null,
      documentExpiryDate: processDateField(data.documentExpiryDate),
      ssrCodes: ssrCodes,
      ssrRemarks: ssrRemarks,
      loyaltyAirlineCode: data.loyaltyAirlineCode || null,
      loyaltyAccountNumber: data.loyaltyAccountNumber || null,
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
