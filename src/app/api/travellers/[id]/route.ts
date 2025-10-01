import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { getTravellerById, updateTraveller, deleteTraveller } from '@/lib/db/travellers'

// GET /api/travellers/[id] - Get traveller by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}

// PUT /api/travellers/[id] - Update traveller
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
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
    
    // Update traveller
    const { id } = await params
    const traveller = await updateTraveller(
      id,
      {
        ptc: body.ptc,
        givenName: body.givenName,
        surname: body.surname,
        gender: body.gender,
        birthdate: body.birthdate,
        nationality: body.nationality,
        phoneNumber: body.phoneNumber,
        countryDialingCode: body.countryDialingCode,
        emailAddress: body.emailAddress,
        documentType: body.documentType,
        documentId: body.documentId,
        documentExpiryDate: body.documentExpiryDate,
        ssrCodes: ssrCodes,
        ssrRemarks: ssrRemarks,
        loyaltyAirlineCode: body.loyaltyAirlineCode,
        loyaltyAccountNumber: body.loyaltyAccountNumber,
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
}

// DELETE /api/travellers/[id] - Delete traveller (SuperAdmin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}
