'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SimpleDropdown } from '@/components/ui/simple-dropdown'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

interface SSRCode {
  code: string
  remark: string
}

interface TravellerFormData {
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
  ssrCodes: SSRCode[]
  loyaltyAirlineCode: string
  loyaltyAccountNumber: string
}

interface TravellerFormProps {
  onSubmit: (data: TravellerFormData) => void
  onCancel: () => void
  initialData?: Partial<TravellerFormData>
  isEditing?: boolean
}

const PTC_OPTIONS = [
  { value: 'Adult', label: 'Adult' },
  { value: 'Child', label: 'Child' },
  { value: 'Infant', label: 'Infant' }
]

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
]

const NATIONALITY_OPTIONS = [
  { value: 'BD', label: 'Bangladesh' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'IN', label: 'India' },
  { value: 'CN', label: 'China' }
]

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'Passport', label: 'Passport' },
  { value: 'National ID', label: 'National ID' },
  { value: 'Driver License', label: 'Driver License' },
  { value: 'Other', label: 'Other' }
]

const COUNTRY_DIALING_CODES = [
  { value: '880', label: '+880 (Bangladesh)' },
  { value: '1', label: '+1 (US/Canada)' },
  { value: '44', label: '+44 (UK)' },
  { value: '61', label: '+61 (Australia)' },
  { value: '49', label: '+49 (Germany)' },
  { value: '33', label: '+33 (France)' },
  { value: '81', label: '+81 (Japan)' },
  { value: '91', label: '+91 (India)' },
  { value: '86', label: '+86 (China)' }
]

const SSR_CODE_OPTIONS = [
  { value: 'WCHR', label: 'WCHR - Wheelchair' },
  { value: 'VVIP', label: 'VVIP - Very Very Important Person' },
  { value: 'MAAS', label: 'MAAS - Meet and Assist' },
  { value: 'FQTV', label: 'FQTV - Frequent Traveler' },
  { value: 'BLND', label: 'BLND - Blind Passenger' },
  { value: 'DEAF', label: 'DEAF - Deaf Passenger' },
  { value: 'DPNA', label: 'DPNA - Disabled Passenger' },
  { value: 'MEDA', label: 'MEDA - Medical Assistance' }
]

const AIRLINE_CODES = [
  { value: 'BG', label: 'BG - Biman Bangladesh' },
  { value: 'AA', label: 'AA - American Airlines' },
  { value: 'DL', label: 'DL - Delta Air Lines' },
  { value: 'UA', label: 'UA - United Airlines' },
  { value: 'BA', label: 'BA - British Airways' },
  { value: 'AC', label: 'AC - Air Canada' },
  { value: 'VA', label: 'VA - Virgin Australia' },
  { value: 'LH', label: 'LH - Lufthansa' },
  { value: 'AF', label: 'AF - Air France' },
  { value: 'JL', label: 'JL - Japan Airlines' }
]

export function TravellerForm({ onSubmit, onCancel, initialData, isEditing = false }: TravellerFormProps) {
  const [formData, setFormData] = useState<TravellerFormData>({
    ptc: initialData?.ptc || 'Adult',
    givenName: initialData?.givenName || '',
    surname: initialData?.surname || '',
    gender: initialData?.gender || 'Male',
    birthdate: initialData?.birthdate || '',
    nationality: initialData?.nationality || 'BD',
    phoneNumber: initialData?.phoneNumber || '',
    countryDialingCode: initialData?.countryDialingCode || '880',
    emailAddress: initialData?.emailAddress || '',
    documentType: initialData?.documentType || 'Passport',
    documentId: initialData?.documentId || '',
    documentExpiryDate: initialData?.documentExpiryDate || '',
    ssrCodes: initialData?.ssrCodes || [],
    loyaltyAirlineCode: initialData?.loyaltyAirlineCode || '',
    loyaltyAccountNumber: initialData?.loyaltyAccountNumber || ''
  })

  const [newSSRCode, setNewSSRCode] = useState('')
  const [newSSRRemark, setNewSSRRemark] = useState('')

  const handleInputChange = (field: keyof TravellerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSSRCode = () => {
    if (newSSRCode && !formData.ssrCodes.find(ssr => ssr.code === newSSRCode)) {
      setFormData(prev => ({
        ...prev,
        ssrCodes: [...prev.ssrCodes, { code: newSSRCode, remark: newSSRRemark }]
      }))
      setNewSSRCode('')
      setNewSSRRemark('')
    }
  }

  const handleRemoveSSRCode = (code: string) => {
    setFormData(prev => ({
      ...prev,
      ssrCodes: prev.ssrCodes.filter(ssr => ssr.code !== code)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">PTC</Label>
              <SimpleDropdown
                id="ptc"
                value={formData.ptc}
                options={PTC_OPTIONS}
                onChange={(value) => handleInputChange('ptc', value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Given Name</Label>
              <Input
                type="text"
                value={formData.givenName}
                onChange={(e) => handleInputChange('givenName', e.target.value)}
                className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Surname</Label>
              <Input
                type="text"
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Gender</Label>
              <SimpleDropdown
                id="gender"
                value={formData.gender}
                options={GENDER_OPTIONS}
                onChange={(value) => handleInputChange('gender', value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Birthdate</Label>
              <Input
                type="date"
                value={formData.birthdate}
                onChange={(e) => handleInputChange('birthdate', e.target.value)}
                className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Nationality</Label>
              <SimpleDropdown
                id="nationality"
                value={formData.nationality}
                options={NATIONALITY_OPTIONS}
                onChange={(value) => handleInputChange('nationality', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Country Dialing Code</Label>
              <SimpleDropdown
                id="countryDialingCode"
                value={formData.countryDialingCode}
                options={COUNTRY_DIALING_CODES}
                onChange={(value) => handleInputChange('countryDialingCode', value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Phone Number</Label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100"
                placeholder="1234567890"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-gray-900 dark:text-gray-100">Email Address</Label>
              <Input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity Document */}
      <Card className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Identity Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Type</Label>
              <SimpleDropdown
                id="documentType"
                value={formData.documentType}
                options={DOCUMENT_TYPE_OPTIONS}
                onChange={(value) => handleInputChange('documentType', value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">ID</Label>
              <Input
                type="text"
                value={formData.documentId}
                onChange={(e) => handleInputChange('documentId', e.target.value)}
                className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100"
                placeholder="BH345678"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Expiry Date</Label>
              <Input
                type="date"
                value={formData.documentExpiryDate}
                onChange={(e) => handleInputChange('documentExpiryDate', e.target.value)}
                className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Service Requests (SSR) */}
      <Card className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Special Service Requests (SSR)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Existing SSR Codes */}
          {formData.ssrCodes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Current SSR Codes</Label>
              <div className="flex flex-wrap gap-2">
                {formData.ssrCodes.map((ssr) => (
                  <Badge key={ssr.code} variant="outline" className="flex items-center gap-1">
                    {ssr.code}
                    {ssr.remark && `: ${ssr.remark}`}
                    <button
                      type="button"
                      onClick={() => handleRemoveSSRCode(ssr.code)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add New SSR Code */}
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-gray-100">Add SSR Code</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-2">
                <SimpleDropdown
                  id="newSSRCode"
                  value={newSSRCode}
                  options={SSR_CODE_OPTIONS}
                  onChange={(value) => setNewSSRCode(value)}
                  placeholder="Select SSR Code"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  value={newSSRRemark}
                  onChange={(e) => setNewSSRRemark(e.target.value)}
                  className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100"
                  placeholder="Remark (optional)"
                />
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={handleAddSSRCode}
                  disabled={!newSSRCode}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add SSR
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Program */}
      <Card className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Loyalty Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Airline Code</Label>
              <SimpleDropdown
                id="loyaltyAirlineCode"
                value={formData.loyaltyAirlineCode}
                options={AIRLINE_CODES}
                onChange={(value) => handleInputChange('loyaltyAirlineCode', value)}
                placeholder="Select Airline"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Loyalty Account Number</Label>
              <Input
                type="text"
                value={formData.loyaltyAccountNumber}
                onChange={(e) => handleInputChange('loyaltyAccountNumber', e.target.value)}
                className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100"
                placeholder="1234567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isEditing ? 'Update Traveller' : 'Add Traveller'}
        </Button>
      </div>
    </form>
  )
}
