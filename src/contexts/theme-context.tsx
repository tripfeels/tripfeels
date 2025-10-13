'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useLayoutEffect } from 'react'
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
  solidContrast: string
  isSolidDark: boolean
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
  // Synchronous local initialization to prevent first-paint flash
  const initialSettings = typeof window !== 'undefined'
    ? (() => {
        try {
          const raw = localStorage.getItem('tripfeels-theme-settings')
          return raw ? JSON.parse(raw) : null
        } catch {
          return null
        }
      })()
    : null

  const [logoType, setLogoType] = useState<'text' | 'image'>(initialSettings?.logoType || 'text')
  const [textLogo, setTextLogo] = useState(initialSettings?.textLogo || 'tripfeels')
  const [logoImage, setLogoImage] = useState<string | null>(initialSettings?.logoImage ?? null)
  const [colorTheme, setColorTheme] = useState(initialSettings?.colorTheme || 'slate')
  // Background controls
  const [bgStyle, setBgStyle] = useState<'solid' | 'gradient' | 'animated'>(initialSettings?.bgStyle || 'animated')
  const [solidColor, setSolidColor] = useState<string>(initialSettings?.solidColor || '#e8f5e9')
  const [gradientFrom, setGradientFrom] = useState<string>(initialSettings?.gradientFrom || '#ecfdf5')
  const [gradientVia, setGradientVia] = useState<string>(initialSettings?.gradientVia || '#d1fae5')
  const [gradientTo, setGradientTo] = useState<string>(initialSettings?.gradientTo || '#064e3b')

  // Contrast calculation helpers
  const parseHex = (hex: string) => {
    const h = (hex || '').replace('#', '')
    if (h.length === 3) {
      const r = h[0]; const g = h[1]; const b = h[2]
      return `#${r}${r}${g}${g}${b}${b}`
    }
    return `#${h.padEnd(6, '0').slice(0,6)}`
  }
  const hexToRgb = (hex: string) => {
    const p = parseHex(hex).replace('#','')
    const r = parseInt(p.slice(0,2), 16)
    const g = parseInt(p.slice(2,4), 16)
    const b = parseInt(p.slice(4,6), 16)
    return { r, g, b }
  }
  const relLuminance = ({r,g,b}:{r:number,g:number,b:number}) => {
    const srgb = [r,g,b].map(v => {
      const c = v/255
      return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4)
    })
    return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2]
  }
  const getContrastFor = (bg: string) => {
    const L = relLuminance(hexToRgb(bg))
    // If dark background (luminance < ~0.5), use light text, else dark text
    return L < 0.5 ? '#F9FAFB' : '#0F172A'
  }
  const isDark = (bg: string) => relLuminance(hexToRgb(bg)) < 0.5
  const solidContrast = getContrastFor(solidColor)
  const isSolidDark = isDark(solidColor)

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

  // Hydrate from remote/local as early as possible to minimize visual flash
  useLayoutEffect(() => {
    loadThemeSettings()
  }, [loadThemeSettings])

  // Apply CSS variables for background and contrast so global UI can consume without prop drilling
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.style.setProperty('--tf-bg-solid', solidColor)
    root.style.setProperty('--tf-bg-contrast', solidContrast)
    root.classList.toggle('tf-solid-dark', isSolidDark)
    // Mark when solid background mode is active so global CSS can apply contrast universally
    root.classList.toggle('tf-bg-solid-mode', bgStyle === 'solid')
  }, [solidColor, solidContrast, isSolidDark, bgStyle])

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
        solidContrast,
        isSolidDark,
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
