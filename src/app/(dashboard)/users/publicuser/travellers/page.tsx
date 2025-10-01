'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { TravellersList } from '@/components/travellers/TravellersList'
import { TravellerForm } from '@/components/travellers/TravellerForm'

// Mock data for user's own travellers
const mockTravellers = [
  {
    id: '1',
    ptc: 'Adult',
    givenName: 'Alex',
    surname: 'Smith',
    gender: 'Male',
    birthdate: '1987-04-18',
    nationality: 'AU',
    phoneNumber: '0412345678',
    countryDialingCode: '61',
    emailAddress: 'alex.smith@example.com',
    documentType: 'Passport',
    documentId: 'AU123456',
    documentExpiryDate: '2030-04-18',
    ssrCodes: ['FQTV'],
    ssrRemarks: {
      'FQTV': 'Velocity member'
    },
    loyaltyAirlineCode: 'VA',
    loyaltyAccountNumber: '1234567',
    createdBy: 'User',
    createdAt: '2024-01-18',
    lastModified: '2024-01-18'
  },
  {
    id: '2',
    ptc: 'Adult',
    givenName: 'Maria',
    surname: 'Smith',
    gender: 'Female',
    birthdate: '1989-12-03',
    nationality: 'AU',
    phoneNumber: '0412345678',
    countryDialingCode: '61',
    emailAddress: 'maria.smith@example.com',
    documentType: 'Passport',
    documentId: 'AU123457',
    documentExpiryDate: '2030-12-03',
    ssrCodes: ['FQTV'],
    ssrRemarks: {
      'FQTV': 'Velocity member'
    },
    loyaltyAirlineCode: 'VA',
    loyaltyAccountNumber: '1234568',
    createdBy: 'User',
    createdAt: '2024-01-18',
    lastModified: '2024-01-18'
  }
]

export default function UserTravellersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [travellers, setTravellers] = useState(mockTravellers)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Redirect if not authenticated or not User
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'User') {
      router.push('/auth')
      return
    }
  }, [session, status, router])

  const handleAddTraveller = () => {
    setShowAddForm(true)
  }

  const handleEditTraveller = (id: string) => {
    // TODO: Implement edit functionality
    console.log('Edit traveller:', id)
  }

  const handleFormSubmit = (formData: any) => {
    // TODO: Implement form submission
    console.log('Form submitted:', formData)
    setShowAddForm(false)
    // Add new traveller to list
    const newTraveller = {
      id: Date.now().toString(),
      ...formData,
      createdBy: 'User',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    }
    setTravellers(prev => [...prev, newTraveller])
  }

  const refreshTravellers = () => {
    setIsLoading(true)
    // TODO: Implement actual data fetching
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'User') {
    return null
  }

  return (
    <>
      <TravellersList
        travellers={travellers}
        role="User"
        canDelete={false}
        onAddTraveller={handleAddTraveller}
        onEditTraveller={handleEditTraveller}
        onRefresh={refreshTravellers}
        isLoading={isLoading}
      />

      {/* Add Traveller Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[75vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Traveller</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl p-1"
                >
                  ×
                </button>
              </div>
              
              <TravellerForm
                onSubmit={handleFormSubmit}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
