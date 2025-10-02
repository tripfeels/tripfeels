'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { TravellersList } from '@/components/travellers/TravellersList'
import { TravellerForm } from '@/components/travellers/TravellerForm'

// Mock data for partner's own travellers
const mockTravellers = [
  {
    id: '1',
    ptc: 'Adult',
    givenName: 'Michael',
    surname: 'Brown',
    gender: 'Male',
    birthdate: '1985-11-10',
    nationality: 'CA',
    phoneNumber: '4161234567',
    countryDialingCode: '1',
    emailAddress: 'michael.brown@example.com',
    documentType: 'Passport',
    documentId: 'CA123456',
    documentExpiryDate: '2030-11-10',
    ssrCodes: ['WCHR', 'FQTV'],
    ssrRemarks: {
      'WCHR': 'Wheelchair assistance required',
      'FQTV': 'Aeroplan member'
    },
    loyaltyAirlineCode: 'AC',
    loyaltyAccountNumber: '9876543',
    createdBy: 'Partner',
    createdAt: '2024-01-14',
    lastModified: '2024-01-14'
  }
]

export default function PartnerTravellersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [travellers, setTravellers] = useState(mockTravellers)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTraveller, setEditingTraveller] = useState<any>(null)

  // Redirect if not authenticated or not Partner
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'Partner') {
      router.push('/auth')
      return
    }
  }, [session, status, router])

  const handleAddTraveller = () => {
    setShowAddForm(true)
  }

  const handleEditTraveller = (id: string) => {
    const travellerToEdit = travellers.find(t => t.id === id)
    if (travellerToEdit) {
      setEditingTraveller(travellerToEdit)
      setShowAddForm(true)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      setIsLoading(true)
      
      if (editingTraveller) {
        // Update existing traveller
        const response = await fetch(`/api/travellers/${editingTraveller.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (response.ok) {
          setTravellers(prev => prev.map(t => 
            t.id === editingTraveller.id ? { ...t, ...formData } : t
          ))
        }
      } else {
        // Create new traveller
        const response = await fetch('/api/travellers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (response.ok) {
          setTravellers(prev => [...prev, {
            id: Date.now().toString(),
            ...formData,
            createdBy: 'Partner',
            createdAt: new Date().toISOString().split('T')[0],
            lastModified: new Date().toISOString().split('T')[0]
          }])
        }
      }
      
      setShowAddForm(false)
      setEditingTraveller(null)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshTravellers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/travellers')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.travellers) {
          setTravellers(data.travellers)
        }
      }
    } catch (error) {
      console.error('Error fetching travellers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'Partner') {
    return null
  }

  return (
    <>
      <TravellersList
        travellers={travellers}
        role="Partner"
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
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingTraveller ? 'Edit Traveller' : 'Add New Traveller'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingTraveller(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl p-1"
                >
                  ×
                </button>
              </div>
              
              <TravellerForm
                initialData={editingTraveller}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowAddForm(false)
                  setEditingTraveller(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
