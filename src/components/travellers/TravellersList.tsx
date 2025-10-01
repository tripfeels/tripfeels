'use client'

import { useState } from 'react'
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

interface Traveller {
  id: string
  ptc: string
  givenName: string
  surname: string
  gender: string
  birthdate: string
  nationality: string
  phoneNumber: string
  countryDialingCode: string
  emailAddress: string
  documentType: string
  documentId: string
  documentExpiryDate: string
  ssrCodes: string[]
  ssrRemarks: Record<string, string | undefined>
  loyaltyAirlineCode: string
  loyaltyAccountNumber: string
  createdBy: string
  createdAt: string
  lastModified: string
}

interface TravellersListProps {
  travellers: Traveller[]
  role: string
  canDelete?: boolean
  onAddTraveller: () => void
  onEditTraveller: (id: string) => void
  onDeleteTraveller?: (id: string) => void
  onRefresh: () => void
  isLoading: boolean
  showEditForm?: boolean
  setShowEditForm?: (show: boolean) => void
  editingTraveller?: Traveller | null
  setEditingTraveller?: (traveller: Traveller | null) => void
}

export function TravellersList({
  travellers,
  role,
  canDelete = false,
  onAddTraveller,
  onEditTraveller,
  onDeleteTraveller,
  onRefresh,
  isLoading,
  showEditForm,
  setShowEditForm,
  editingTraveller,
  setEditingTraveller
}: TravellersListProps) {
  const [search, setSearch] = useState('')
  const [ptcFilter, setPtcFilter] = useState('All')
  const [nationalityFilter, setNationalityFilter] = useState('All')

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

  const getRoleDescription = () => {
    switch (role) {
      case 'SuperAdmin':
        return 'Manage all travellers in the system. You can view, add, edit, and delete any traveller.'
      case 'Admin':
        return 'Manage all travellers in the system. You can view, add, and edit any traveller.'
      case 'Staff':
      case 'Agent':
      case 'Partner':
      case 'User':
        return 'Manage your travellers. You can view, add, and edit only the travellers you have created.'
      default:
        return 'Manage travellers.'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Travellers Management</h1>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 transition-colors duration-200 disabled:opacity-50"
            title="Refresh travellers data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <Button
          onClick={onAddTraveller}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Traveller
        </Button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        {getRoleDescription()}
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
                      onClick={() => onEditTraveller(traveller.id)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    {canDelete && onDeleteTraveller && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteTraveller(traveller.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
