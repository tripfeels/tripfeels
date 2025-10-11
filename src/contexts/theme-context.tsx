'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getTheme, saveTheme } from '@/lib/firebase/theme'

interface ThemeContextType {
  logoType: 'text' | 'image'
  textLogo: string
  logoImage: string | null
  colorTheme: string
  bgStyle: 'solid' | 'gradient' | 'animated'
  solidColor: string
  gradientFrom: string
  gradientVia: string
  gradientTo: string
  setLogoType: (type: 'text' | 'image') => void
  setTextLogo: (text: string) => void
  setLogoImage: (image: string | null) => void
  setColorTheme: (theme: string) => void
  setBgStyle: (style: 'solid' | 'gradient' | 'animated') => void
  setSolidColor: (hex: string) => void
  setGradientFrom: (hex: string) => void
  setGradientVia: (hex: string) => void
  setGradientTo: (hex: string) => void
  saveThemeSettings: () => void
  loadThemeSettings: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [logoType, setLogoType] = useState<'text' | 'image'>('text')
  const [textLogo, setTextLogo] = useState('tripfeels')
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const [colorTheme, setColorTheme] = useState('slate')
  // Background controls
  const [bgStyle, setBgStyle] = useState<'solid' | 'gradient' | 'animated'>('animated')
  const [solidColor, setSolidColor] = useState<string>('#e8f5e9')
  const [gradientFrom, setGradientFrom] = useState<string>('#ecfdf5')
  const [gradientVia, setGradientVia] = useState<string>('#d1fae5')
  const [gradientTo, setGradientTo] = useState<string>('#064e3b')

  const loadThemeSettings = useCallback(async () => {
    try {
      // Try Firestore first
      const remote = await getTheme()
      if (remote) {
        setColorTheme(remote.colorTheme || 'slate')
        setBgStyle(remote.bgStyle || 'animated')
        setSolidColor(remote.solidColor || '#e8f5e9')
        setGradientFrom(remote.gradientFrom || '#ecfdf5')
        setGradientVia(remote.gradientVia || '#d1fae5')
        setGradientTo(remote.gradientTo || '#064e3b')
        // hydrate local cache as well
        localStorage.setItem('tripfeels-theme-settings', JSON.stringify(remote))
      } else {
        const saved = localStorage.getItem('tripfeels-theme-settings')
        if (saved) {
          const settings = JSON.parse(saved)
          setLogoType(settings.logoType || 'text')
          setTextLogo(settings.textLogo || 'tripfeels')
          setLogoImage(settings.logoImage || null)
          setColorTheme(settings.colorTheme || 'slate')
          setBgStyle(settings.bgStyle || 'animated')
          setSolidColor(settings.solidColor || '#e8f5e9')
          setGradientFrom(settings.gradientFrom || '#ecfdf5')
          setGradientVia(settings.gradientVia || '#d1fae5')
          setGradientTo(settings.gradientTo || '#064e3b')
        } else {
          // defaults
          setColorTheme('slate')
          setLogoType('text')
          setTextLogo('tripfeels')
          setLogoImage(null)
          setBgStyle('animated')
          setSolidColor('#e8f5e9')
          setGradientFrom('#ecfdf5')
          setGradientVia('#d1fae5')
          setGradientTo('#064e3b')
        }
      }
    } catch (error) {
      console.error('Error loading theme settings:', error)
      // Set default theme on error
      setColorTheme('slate')
      setLogoType('text')
      setTextLogo('tripfeels')
      setLogoImage(null)
      setBgStyle('animated')
      setSolidColor('#e8f5e9')
      setGradientFrom('#ecfdf5')
      setGradientVia('#d1fae5')
      setGradientTo('#064e3b')
    }
  }, [])

  const saveThemeSettings = useCallback(async () => {
    try {
      const settings = {
        logoType,
        textLogo,
        logoImage,
        colorTheme,
        bgStyle,
        solidColor,
        gradientFrom,
        gradientVia,
        gradientTo
      }
      // Save to Firestore (global)
      await saveTheme({
        colorTheme,
        bgStyle,
        solidColor,
        gradientFrom,
        gradientVia,
        gradientTo,
      })
      // Cache locally as well
      localStorage.setItem('tripfeels-theme-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving theme settings:', error)
    }
  }, [logoType, textLogo, logoImage, colorTheme, bgStyle, solidColor, gradientFrom, gradientVia, gradientTo])

  // Load theme settings from localStorage on mount
  useEffect(() => {
    loadThemeSettings()
  }, [loadThemeSettings])

  // Removed auto-save to prevent permission errors for non-admin users.
  // Saving now occurs only via explicit calls (e.g., SuperAdmin action button).

  return (
    <ThemeContext.Provider
      value={{
        logoType,
        textLogo,
        logoImage,
        colorTheme,
        bgStyle,
        solidColor,
        gradientFrom,
        gradientVia,
        gradientTo,
        setLogoType,
        setTextLogo,
        setLogoImage,
        setColorTheme,
        setBgStyle,
        setSolidColor,
        setGradientFrom,
        setGradientVia,
        setGradientTo,
        saveThemeSettings,
        loadThemeSettings
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
