/**
 * Dynamic Theme Colors System
 * Automatically changes button and component colors based on selected theme
 */

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/theme-context'
import { useThemeSystem } from '@/components/theme-provider'

// Theme color mappings
export const themeColorMap = {
  default: {
    primary: 'bg-blue-600/90 dark:bg-blue-500/90',
    primaryHover: 'hover:bg-blue-700/90 dark:hover:bg-blue-600/90',
    primaryBorder: 'border-blue-500/40 dark:border-blue-400/40',
    primaryText: 'text-blue-600 dark:text-blue-400',
    primaryRing: 'focus:ring-blue-500/50',
  },
  blue: {
    primary: 'bg-blue-600/90 dark:bg-blue-500/90',
    primaryHover: 'hover:bg-blue-700/90 dark:hover:bg-blue-600/90',
    primaryBorder: 'border-blue-500/40 dark:border-blue-400/40',
    primaryText: 'text-blue-600 dark:text-blue-400',
    primaryRing: 'focus:ring-blue-500/50',
  },
  rose: {
    primary: 'bg-rose-600/90 dark:bg-rose-500/90',
    primaryHover: 'hover:bg-rose-700/90 dark:hover:bg-rose-600/90',
    primaryBorder: 'border-rose-500/40 dark:border-rose-400/40',
    primaryText: 'text-rose-600 dark:text-rose-400',
    primaryRing: 'focus:ring-rose-500/50',
  },
  red: {
    primary: 'bg-red-600/90 dark:bg-red-500/90',
    primaryHover: 'hover:bg-red-700/90 dark:hover:bg-red-600/90',
    primaryBorder: 'border-red-500/40 dark:border-red-400/40',
    primaryText: 'text-red-600 dark:text-red-400',
    primaryRing: 'focus:ring-red-500/50',
  },
  green: {
    primary: 'bg-emerald-600/90 dark:bg-emerald-500/90',
    primaryHover: 'hover:bg-emerald-700/90 dark:hover:bg-emerald-600/90',
    primaryBorder: 'border-emerald-500/40 dark:border-emerald-400/40',
    primaryText: 'text-emerald-600 dark:text-emerald-400',
    primaryRing: 'focus:ring-emerald-500/50',
  },
  slate: {
    primary: 'bg-slate-600/90 dark:bg-slate-500/90',
    primaryHover: 'hover:bg-slate-700/90 dark:hover:bg-slate-600/90',
    primaryBorder: 'border-slate-500/40 dark:border-slate-400/40',
    primaryText: 'text-slate-600 dark:text-slate-400',
    primaryRing: 'focus:ring-slate-500/50',
  },
  orange: {
    primary: 'bg-orange-600/90 dark:bg-orange-500/90',
    primaryHover: 'hover:bg-orange-700/90 dark:hover:bg-orange-600/90',
    primaryBorder: 'border-orange-500/40 dark:border-orange-400/40',
    primaryText: 'text-orange-600 dark:text-orange-400',
    primaryRing: 'focus:ring-orange-500/50',
  },
  yellow: {
    primary: 'bg-yellow-500/90 dark:bg-yellow-400/90',
    primaryHover: 'hover:bg-yellow-600/90 dark:hover:bg-yellow-500/90',
    primaryBorder: 'border-yellow-500/40 dark:border-yellow-400/40',
    primaryText: 'text-yellow-600 dark:text-yellow-400',
    primaryRing: 'focus:ring-yellow-500/50',
  },
  teal: {
    primary: 'bg-teal-600/90 dark:bg-teal-500/90',
    primaryHover: 'hover:bg-teal-700/90 dark:hover:bg-teal-600/90',
    primaryBorder: 'border-teal-500/40 dark:border-teal-400/40',
    primaryText: 'text-teal-600 dark:text-teal-400',
    primaryRing: 'focus:ring-teal-500/50',
  },
  violet: {
    primary: 'bg-violet-600/90 dark:bg-violet-500/90',
    primaryHover: 'hover:bg-violet-700/90 dark:hover:bg-violet-600/90',
    primaryBorder: 'border-violet-500/40 dark:border-violet-400/40',
    primaryText: 'text-violet-600 dark:text-violet-400',
    primaryRing: 'focus:ring-violet-500/50',
  },
} as const

// Default theme (when no theme is selected or system mode)
export const defaultThemeColors = {
  light: {
    primary: 'bg-gray-900 dark:bg-gray-100',
    primaryHover: 'hover:bg-gray-800 dark:hover:bg-gray-200',
    primaryBorder: 'border-gray-900 dark:border-gray-100',
    primaryText: 'text-gray-900 dark:text-gray-100',
    primaryRing: 'focus:ring-gray-500/50',
  },
  dark: {
    primary: 'bg-gray-100 dark:bg-gray-900',
    primaryHover: 'hover:bg-gray-200 dark:hover:bg-gray-800',
    primaryBorder: 'border-gray-100 dark:border-gray-900',
    primaryText: 'text-gray-100 dark:text-gray-900',
    primaryRing: 'focus:ring-gray-500/50',
  },
}

// Get current theme colors based on selected theme and system mode
export function getThemeColors(themeName: string, isDarkMode: boolean = false) {
  // If no theme is selected or it's 'default', use system-based colors
  if (!themeName || themeName === 'default') {
    return isDarkMode ? defaultThemeColors.dark : defaultThemeColors.light
  }
  
  // Return the theme colors or fallback to slate if theme not found
  return themeColorMap[themeName as keyof typeof themeColorMap] || themeColorMap.slate
}

// Hook to get dynamic theme colors
export function useDynamicThemeColors() {
  // Prefer new theme system; fall back to legacy context
  let themeName: string | undefined
  try {
    const sys = useThemeSystem()
    themeName = sys.color
  } catch {
    // noop: provider might not be mounted in older pages
  }
  if (!themeName) {
    try {
      const legacy = useTheme()
      themeName = legacy.colorTheme
    } catch {}
  }
  const colorTheme = themeName || 'slate'
  
  // Get system theme (light/dark)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])
  
  return getThemeColors(colorTheme, isDarkMode)
}

// Dynamic button component that changes color based on theme
export function createDynamicButton(variant: 'primary' | 'secondary' | 'ghost' | 'outline' = 'primary', className?: string) {
  // This function will be used with the useDynamicThemeColors hook
  return `${className || ''}`
}

// Dynamic input component that changes focus ring based on theme
export function createDynamicInput(variant: 'default' | 'subtle' = 'default', className?: string) {
  // This function will be used with the useDynamicThemeColors hook
  return `${className || ''}`
}

// Export theme color names for easy access
export const availableThemes = Object.keys(themeColorMap) as Array<keyof typeof themeColorMap>

// Helper function to get theme display name
export function getThemeDisplayName(themeName: string): string {
  const displayNames: Record<string, string> = {
    blue: 'Blue',
    rose: 'Rose',
    emerald: 'Emerald',
    slate: 'Slate',
    orange: 'Orange',
    gold: 'Gold',
    purple: 'Purple',
    indigo: 'Indigo',
    cyan: 'Cyan',
    pink: 'Pink',
  }
  
  return displayNames[themeName] || 'Slate'
}

// Helper function to get theme description
export function getThemeDescription(themeName: string): string {
  const descriptions: Record<string, string> = {
    blue: 'Trustworthy blue for reliability and professionalism',
    rose: 'Elegant rose tones for a sophisticated and warm look',
    emerald: 'Fresh emerald greens for a natural and calming feel',
    slate: 'Professional slate grays for business and corporate use',
    orange: 'Vibrant orange for energy, creativity, and enthusiasm',
    gold: 'Luxurious gold for premium branding and elegance',
    purple: 'Creative purple for innovation and artistic expression',
    indigo: 'Deep indigo for wisdom and spiritual connection',
    cyan: 'Modern cyan for technology and digital experiences',
    pink: 'Playful pink for creativity and friendly interactions',
  }
  
  return descriptions[themeName] || 'A beautiful color theme for your application'
}
