import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { getTravellerById, updateTraveller, deleteTraveller } from '@/lib/db/travellers'
import { rateLimiters } from '@/lib/middleware/rate-limit-middleware'
import { z } from 'zod'

// GET /api/travellers/[id] - Get traveller by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return rateLimiters.api(request, async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const traveller = await getTravellerById(id, session.user.role, session.user.id)
    
    if (!traveller) {
      return NextResponse.json({ error: 'Traveller not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      traveller
    })
  } catch (error) {
    console.error('Error fetching traveller:', error)
    return NextResponse.json(
      { error: 'Failed to fetch traveller' },
      { status: 500 }
    )
  }
  })
}

// PUT /api/travellers/[id] - Update traveller
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return rateLimiters.api(request, async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const travellerUpdateSchema = z.object({
      ptc: z.string().optional(),
      givenName: z.string().min(1).optional(),
      surname: z.string().min(1).optional(),
      gender: z.string().optional(),
      birthdate: z.union([z.string().min(1), z.null(), z.undefined()]).optional(),
      nationality: z.string().max(3).nullable().optional(),
      phoneNumber: z.string().min(1).optional(),
      countryDialingCode: z.string().nullable().optional(),
      emailAddress: z.string().email().nullable().optional(),
      documentType: z.string().nullable().optional(),
      documentId: z.string().nullable().optional(),
      documentExpiryDate: z.union([z.string().min(1), z.null(), z.undefined()]).optional(),
      ssrCodes: z.array(z.union([z.string(), z.object({ code: z.string(), remark: z.string().optional() })])).optional(),
      loyaltyAirlineCode: z.string().nullable().optional(),
      loyaltyAccountNumber: z.string().nullable().optional(),
    })

    const parsed = travellerUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data
    
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
    
    // Helper function to convert empty strings to null for date fields
    const processDateField = (dateValue: any) => {
      if (!dateValue || dateValue === '' || dateValue === 'undefined') {
        return null
      }
      return dateValue
    }

    // Update traveller
    const { id } = await params
    const traveller = await updateTraveller(
      id,
      {
        ptc: data.ptc,
        givenName: data.givenName,
        surname: data.surname,
        gender: data.gender,
        birthdate: processDateField(data.birthdate),
        nationality: data.nationality as any,
        phoneNumber: data.phoneNumber,
        countryDialingCode: data.countryDialingCode as any,
        emailAddress: data.emailAddress as any,
        documentType: data.documentType as any,
        documentId: data.documentId as any,
        documentExpiryDate: processDateField(data.documentExpiryDate),
        ssrCodes: ssrCodes,
        ssrRemarks: ssrRemarks,
        loyaltyAirlineCode: data.loyaltyAirlineCode as any,
        loyaltyAccountNumber: data.loyaltyAccountNumber as any,
      },
      session.user.role,
      session.user.id
    )

    if (!traveller) {
      return NextResponse.json({ error: 'Traveller not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      traveller
    })
  } catch (error) {
    console.error('Error updating traveller:', error)
    return NextResponse.json(
      { error: 'Failed to update traveller' },
      { status: 500 }
    )
  }
  })
}

// DELETE /api/travellers/[id] - Delete traveller (SuperAdmin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return rateLimiters.api(request, async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const traveller = await deleteTraveller(id, session.user.role, session.user.id)
    
    if (!traveller) {
      return NextResponse.json({ error: 'Traveller not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Traveller deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting traveller:', error)
    return NextResponse.json(
      { error: 'Failed to delete traveller' },
      { status: 500 }
    )
  }
  })
}
