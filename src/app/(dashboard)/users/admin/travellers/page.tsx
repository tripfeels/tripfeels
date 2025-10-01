'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  FileText,
  Award,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SimpleDropdown } from '@/components/ui/simple-dropdown'
import { TravellerForm } from '@/components/travellers/TravellerForm'

// Mock data for travellers (Admin can see all)
const mockTravellers = [
  {
    id: '1',
    ptc: 'Adult',
    givenName: 'Shajedul',
    surname: 'Islam',
    gender: 'Male',
    birthdate: '1992-01-21',
    nationality: 'BD',
    phoneNumber: '1234567890',
    countryDialingCode: '880',
    emailAddress: 'shajedul@bdfare.com',
    documentType: 'Passport',
    documentId: 'BH345678',
    documentExpiryDate: '2035-01-01',
    ssrCodes: ['WCHR', 'VVIP', 'MAAS', 'FQTV'],
    ssrRemarks: {
      'WCHR': 'Testing Wheelchair',
      'VVIP': 'Testing vvip',
      'MAAS': 'Testing Maas',
      'FQTV': ''
    },
    loyaltyAirlineCode: 'BG',
    loyaltyAccountNumber: '1234567',
    createdBy: 'SuperAdmin',
    createdAt: '2024-01-15',
    lastModified: '2024-01-20'
  },
  {
    id: '2',
    ptc: 'Adult',
    givenName: 'John',
    surname: 'Doe',
    gender: 'Male',
    birthdate: '1985-05-15',
    nationality: 'US',
    phoneNumber: '9876543210',
    countryDialingCode: '1',
    emailAddress: 'john.doe@example.com',
    documentType: 'Passport',
    documentId: 'US123456',
    documentExpiryDate: '2030-05-15',
    ssrCodes: ['FQTV'],
    ssrRemarks: {
      'FQTV': 'Frequent flyer member'
    },
    loyaltyAirlineCode: 'AA',
    loyaltyAccountNumber: '9876543',
    createdBy: 'Admin',
    createdAt: '2024-01-10',
    lastModified: '2024-01-18'
  }
]

export default function AdminTravellersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [travellers, setTravellers] = useState(mockTravellers)
  const [search, setSearch] = useState('')
  const [ptcFilter, setPtcFilter] = useState('All')
  const [nationalityFilter, setNationalityFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingTraveller, setEditingTraveller] = useState<any>(null)

  // Redirect if not authenticated or not Admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'Admin') {
      router.push('/auth')
      return
    }
  }, [session, status, router])

  // Load travellers on component mount
  useEffect(() => {
    if (session?.user?.role === 'Admin') {
      refreshTravellers()
    }
  }, [session])

  const filteredTravellers = travellers.filter(traveller => {
    const matchesSearch = 
      traveller.givenName.toLowerCase().includes(search.toLowerCase()) ||
      traveller.surname.toLowerCase().includes(search.toLowerCase()) ||
      traveller.emailAddress.toLowerCase().includes(search.toLowerCase()) ||
      traveller.documentId.toLowerCase().includes(search.toLowerCase())
    
    const matchesPtc = ptcFilter === 'All' || traveller.ptc === ptcFilter
    const matchesNationality = nationalityFilter === 'All' || traveller.nationality === nationalityFilter
    
    return matchesSearch && matchesPtc && matchesNationality
  })

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

  if (!session || session.user.role !== 'Admin') {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Travellers Management</h1>
          <button
            onClick={refreshTravellers}
            disabled={isLoading}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 transition-colors duration-200 disabled:opacity-50"
            title="Refresh travellers data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <Button
          onClick={handleAddTraveller}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Traveller
        </Button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Manage all travellers in the system. You can view, add, and edit any traveller.
      </p>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name, email, or document ID"
            className="pl-10 h-9 w-full rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-32">
          <SimpleDropdown
            id="ptc-filter"
            value={ptcFilter}
            options={[
              { value: 'All', label: 'All PTC' },
              { value: 'Adult', label: 'Adult' },
              { value: 'Child', label: 'Child' },
              { value: 'Infant', label: 'Infant' }
            ]}
            onChange={(value) => setPtcFilter(value)}
          />
        </div>
        <div className="w-full sm:w-32">
          <SimpleDropdown
            id="nationality-filter"
            value={nationalityFilter}
            options={[
              { value: 'All', label: 'All Countries' },
              { value: 'BD', label: 'Bangladesh' },
              { value: 'US', label: 'United States' },
              { value: 'CA', label: 'Canada' },
              { value: 'UK', label: 'United Kingdom' }
            ]}
            onChange={(value) => setNationalityFilter(value)}
          />
        </div>
      </div>

      {/* Travellers List */}
      <div className="grid gap-4">
        {filteredTravellers.length === 0 ? (
          <Card className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No travellers found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {search || ptcFilter !== 'All' || nationalityFilter !== 'All' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first traveller'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTravellers.map((traveller) => (
            <Card key={traveller.id} className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Traveller Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {traveller.givenName} {traveller.surname}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Badge variant="secondary" className="text-xs">
                            {traveller.ptc}
                          </Badge>
                          <span>•</span>
                          <span>{traveller.gender}</span>
                          <span>•</span>
                          <span>{traveller.nationality}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Born: {traveller.birthdate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        <span>+{traveller.countryDialingCode} {traveller.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4" />
                        <span>{traveller.emailAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FileText className="h-4 w-4" />
                        <span>{traveller.documentType}: {traveller.documentId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>Expires: {traveller.documentExpiryDate}</span>
                      </div>
                      {traveller.loyaltyAirlineCode && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Award className="h-4 w-4" />
                          <span>{traveller.loyaltyAirlineCode} - {traveller.loyaltyAccountNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* SSR Codes */}
                    {traveller.ssrCodes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {traveller.ssrCodes.map((code) => (
                          <Badge key={code} variant="outline" className="text-xs">
                            {code}
                            {traveller.ssrRemarks[code as keyof typeof traveller.ssrRemarks] && `: ${traveller.ssrRemarks[code as keyof typeof traveller.ssrRemarks]}`}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Created by {traveller.createdBy} on {traveller.createdAt}
                      {traveller.lastModified !== traveller.createdAt && (
                        <span> • Last modified: {traveller.lastModified}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTraveller(traveller.id)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Traveller Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[75vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Traveller</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  ×
                </Button>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingTraveller(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  ×
                </Button>
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
    </div>
  )
}
