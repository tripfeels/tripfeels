import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { getTravellers, createTraveller, searchTravellers } from '@/lib/db/travellers'

// GET /api/travellers - Get all travellers with optional search and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const ptc = searchParams.get('ptc') || 'All'
    const nationality = searchParams.get('nationality') || 'All'

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

    return NextResponse.json({
      success: true,
      travellers,
      count: travellers.length
    })
  } catch (error) {
    console.error('Error fetching travellers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch travellers' },
      { status: 500 }
    )
  }
}

// POST /api/travellers - Create new traveller
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'ptc', 'givenName', 'surname', 'gender', 'birthdate', 'nationality',
      'phoneNumber', 'countryDialingCode', 'emailAddress',
      'documentType', 'documentId', 'documentExpiryDate'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
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

    // Create traveller
    const traveller = await createTraveller({
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
      loyaltyAirlineCode: body.loyaltyAirlineCode || '',
      loyaltyAccountNumber: body.loyaltyAccountNumber || '',
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
}
