'use client'

import { useEffect, useMemo, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useTheme } from '@/contexts/theme-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const { bgStyle, solidColor, gradientFrom, gradientVia, gradientTo } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const wrapper = useMemo(() => {
    if (!mounted) {
      return { className: 'min-h-screen', style: {} as React.CSSProperties }
    }
    if (bgStyle === 'solid') {
      return {
        className: 'min-h-screen',
        style: { background: solidColor },
      }
    }
    const gradient = `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientVia} 50%, ${gradientTo} 100%)`
    return {
      className: `min-h-screen ${bgStyle === 'animated' ? 'animated-gradient' : ''}`.trim(),
      style: { backgroundImage: gradient, backgroundSize: '200% 200%' },
    }
  }, [mounted, bgStyle, solidColor, gradientFrom, gradientVia, gradientTo])

  const toRgba = (hex: string, alpha: number) => {
    // supports #RRGGBB or rgb/rgba strings
    if (!hex) return `rgba(0,0,0,${alpha})`
    if (hex.startsWith('rgb')) {
      return hex.replace(/rgba?\(([^)]+)\)/, (_m, inner) => `rgba(${inner.split(',').slice(0,3).join(',')}, ${alpha})`)
    }
    const h = hex.replace('#', '')
    const bigint = parseInt(h, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className={wrapper.className} style={wrapper.style}>
      {/* Animated background elements */}
      {mounted && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"
            style={{ backgroundColor: toRgba(gradientFrom, 0.3) }}
          />
          <div
            className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
            style={{ backgroundColor: toRgba(gradientTo, 0.3) }}
          />
          <div
            className="absolute top-40 left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"
            style={{ backgroundColor: toRgba(gradientVia, 0.3) }}
          />
        </div>
      )}
      
      <Header 
        showNavigation={false} 
        showUserActions={true} 
        onMobileMenuToggle={toggleMobileSidebar}
      />
      <div className="flex relative z-10 h-screen">
        {/* Desktop Sidebar (fixed) */}
        <div className="hidden md:block">
          <div className="fixed top-14 bottom-0 left-0 z-30">
            <Sidebar onCollapseChange={setIsSidebarCollapsed} className="h-full" />
          </div>
        </div>
        {/* Sidebar spacer to keep layout aligned with fixed sidebar */}
        <div className={`hidden md:block ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}></div>
        
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 z-50 md:hidden"
            onClick={closeMobileSidebar}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            {/* Sidebar */}
            <div className="relative h-full w-64">
              <Sidebar 
                isMobile={true}
                onClose={closeMobileSidebar}
                className="h-full"
              />
            </div>
          </div>
        )}
        
        <main className="flex-1 overflow-auto p-6 pt-24 pb-20">
          {children}
        </main>
      </div>
      <div className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ${isSidebarCollapsed ? 'md:left-20' : 'md:left-64'}`}>
        <Footer />
      </div>
    </div>
  )
}
