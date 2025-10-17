'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DynamicButton } from '@/components/ui/dynamic-theme-components'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Type, Image, Save, Eye, Plus, Trash2 } from 'lucide-react'
import { addSlide, deleteSlide, listSlides } from '@/lib/firebase/slides'
import { useTheme } from '@/contexts/theme-context'
import { useThemeSystem } from '@/components/theme-provider'
import ThemeSelector from '@/components/theme-selector'
import SlideshowManager from './SlideshowManager'

export default function SuperAdminThemePage() {
  const {
    logoType,
    textLogo,
    logoImage,
    setLogoType,
    setTextLogo,
    setLogoImage,
  } = useTheme()
  const { color, mode, setColor, setMode } = useThemeSystem()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
        setLogoImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colorTheme: color,
          mode,
        })
      })
      if (!res.ok) throw new Error('Failed to save theme')
      // Optionally rehydrate local cache by reloading or calling loadThemeSettings
      // loadThemeSettings?.()
    } catch (err) {
      console.error('Save theme error:', err)
    }
  }

  const handlePreview = () => {
    window.open('/theme-demo', '_blank')
  }

  if (!mounted) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-7 w-48 rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
        <div className="h-32 w-full rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-6 glass-card rounded-xl border border-white/30 dark:border-white/20 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Theme Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Customize your application&apos;s appearance, logo, and branding.
        </p>
      </div>

      <Tabs defaultValue="logo" className="space-y-6">
        <TabsList className="!flex !w-full !flex-wrap !gap-1 !h-auto !p-2 glass-tabs">
          <TabsTrigger value="logo" className="!text-xs md:!text-sm !flex-1 !min-w-[calc(50%-0.125rem)] md:!min-w-0 !px-2 !py-2">Logo Settings</TabsTrigger>
          <TabsTrigger value="colors" className="!text-xs md:!text-sm !flex-1 !min-w-[calc(50%-0.125rem)] md:!min-w-0 !px-2 !py-2">Appearance</TabsTrigger>
          <TabsTrigger value="slideshow" className="!text-xs md:!text-sm !flex-1 !min-w-[calc(50%-0.125rem)] md:!min-w-0 !px-2 !py-2">Slideshow</TabsTrigger>
          <TabsTrigger value="preview" className="!text-xs md:!text-sm !flex-1 !min-w-[calc(50%-0.125rem)] md:!min-w-0 !px-2 !py-2">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="space-y-6">
          <div className="glass-card">
            <div className="p-6 border-b glass-border">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Type className="h-5 w-5" />
                Logo Configuration
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose between text or image logo for header and sidebar
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Logo Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Logo Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      logoType === 'text'
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setLogoType('text')}
                  >
                    <div className="flex items-center gap-3">
                      <Type className="h-6 w-6" />
                      <div>
                        <h3 className="font-medium">Text Logo</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Use custom text as logo
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      logoType === 'image'
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setLogoType('image')}
                  >
                    <div className="flex items-center gap-3">
                      <Image className="h-6 w-6" />
                      <div>
                        <h3 className="font-medium">Image Logo</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Upload SVG logo (64px × 28px)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background controls removed – background follows selected theme automatically */}

              {/* Text Logo Configuration */}
              {logoType === 'text' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="textLogo">Logo Text</Label>
                    <Input
                      id="textLogo"
                      value={textLogo}
                      onChange={(e) => setTextLogo(e.target.value)}
                      placeholder="Enter logo text"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      This text will appear in both header and sidebar
                    </p>
                  </div>
                  
                  {/* Text Logo Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-semibold font-logo text-gray-900 dark:text-gray-100">
                          {textLogo}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Header Preview
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Logo Configuration */}
              {logoType === 'image' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logoFile">Upload Logo</Label>
                    <div className="mt-1">
                      <Input
                        id="logoFile"
                        type="file"
                        accept=".svg"
                        onChange={handleFileUpload}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Upload SVG file with dimensions 64px wide × 28px height
                    </p>
                  </div>

                  {/* Image Logo Preview */}
                  {logoPreview && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-7 flex items-center justify-center">
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Header Preview (64px × 28px)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <DynamicButton variant="primary" onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </DynamicButton>
                <DynamicButton variant="outline" onClick={handlePreview} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </DynamicButton>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <div className="glass-card">
            <div className="p-6 border-b glass-border">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select a theme name and mode. Background colors adjust automatically.</p>
            </div>
            <div className="p-6 space-y-6">
              <ThemeSelector />
            </div>
          
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <DynamicButton variant="primary" onClick={handleSave} className="flex items-center gap-2 flex-1 min-w-[calc(50%-0.375rem)] sm:flex-none sm:min-w-0">
                <Save className="h-4 w-4" />
                Apply Theme
              </DynamicButton>
              <DynamicButton variant="outline" onClick={handlePreview} className="flex items-center gap-2 flex-1 min-w-[calc(50%-0.375rem)] sm:flex-none sm:min-w-0">
                <Eye className="h-4 w-4" />
                Preview Changes
              </DynamicButton>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="slideshow" className="space-y-6">
          <div className="glass-card">
            <div className="p-6 border-b glass-border">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Auth Slideshow</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage images for the left-side slideshow on the auth page</p>
            </div>
            <div className="p-6 space-y-6">
              <SlideshowManager />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="glass-card">
            <div className="p-6 border-b glass-border">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Theme Preview</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Preview your theme changes before applying
              </p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400">
                Theme preview will be implemented here.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
