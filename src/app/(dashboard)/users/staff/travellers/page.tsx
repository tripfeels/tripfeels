'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { TravellersList } from '@/components/travellers/TravellersList'
import { TravellerForm } from '@/components/travellers/TravellerForm'

// Mock data for staff's own travellers
const mockTravellers = [
  {
    id: '1',
    ptc: 'Adult',
    givenName: 'Sarah',
    surname: 'Johnson',
    gender: 'Female',
    birthdate: '1988-03-15',
    nationality: 'US',
    phoneNumber: '5551234567',
    countryDialingCode: '1',
    emailAddress: 'sarah.johnson@example.com',
    documentType: 'Passport',
    documentId: 'US789012',
    documentExpiryDate: '2030-03-15',
    ssrCodes: ['FQTV'],
    ssrRemarks: {
      'FQTV': 'Gold member'
    },
    loyaltyAirlineCode: 'DL',
    loyaltyAccountNumber: '1234567',
    createdBy: 'Staff',
    createdAt: '2024-01-12',
    lastModified: '2024-01-12'
  },
  {
    id: '2',
    ptc: 'Child',
    givenName: 'Emma',
    surname: 'Johnson',
    gender: 'Female',
    birthdate: '2015-07-20',
    nationality: 'US',
    phoneNumber: '5551234567',
    countryDialingCode: '1',
    emailAddress: 'emma.johnson@example.com',
    documentType: 'Passport',
    documentId: 'US789013',
    documentExpiryDate: '2028-07-20',
    ssrCodes: [],
    ssrRemarks: {},
    loyaltyAirlineCode: '',
    loyaltyAccountNumber: '',
    createdBy: 'Staff',
    createdAt: '2024-01-12',
    lastModified: '2024-01-12'
  }
]

export default function StaffTravellersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [travellers, setTravellers] = useState(mockTravellers)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingTraveller, setEditingTraveller] = useState<any>(null)

  // Redirect if not authenticated or not Staff
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'Staff') {
      router.push('/auth')
      return
    }
  }, [session, status, router])

  // Load travellers on component mount
  useEffect(() => {
    if (session?.user?.role === 'Staff') {
      refreshTravellers()
    }
  }, [session])

  const handleAddTraveller = () => {
    setShowAddForm(true)
  }

  const handleEditTraveller = (id: string) => {
    const traveller = travellers.find(t => t.id === id)
    if (traveller) {
      setEditingTraveller(traveller)
      setShowEditForm(true)
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
          const updatedTraveller = await response.json()
          setTravellers(prev => prev.map(t => 
            t.id === editingTraveller.id ? updatedTraveller.traveller : t
          ))
          setShowEditForm(false)
          setEditingTraveller(null)
          alert('Traveller updated successfully!')
        } else {
          const error = await response.json()
          alert(`Error updating traveller: ${error.error}`)
        }
      } else {
        // Create new traveller
        const response = await fetch('/api/travellers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const newTraveller = await response.json()
          setTravellers(prev => [...prev, newTraveller.traveller])
          setShowAddForm(false)
          alert('Traveller created successfully!')
        } else {
          const error = await response.json()
          alert(`Error creating traveller: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to save traveller. Please try again.')
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
        setTravellers(data.travellers)
      } else {
        console.error('Failed to fetch travellers')
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

  if (!session || session.user.role !== 'Staff') {
    return null
  }

  return (
    <>
      <TravellersList
        travellers={travellers}
        role="Staff"
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

      {/* Edit Traveller Form Modal */}
      {showEditForm && editingTraveller && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[75vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Traveller</h2>
                <button
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingTraveller(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl p-1"
                >
                  ×
                </button>
              </div>
              
              <TravellerForm
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowEditForm(false)
                  setEditingTraveller(null)
                }}
                initialData={editingTraveller}
                isEditing={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
