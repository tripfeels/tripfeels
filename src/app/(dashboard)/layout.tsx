'use client'

import { useEffect, useMemo, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const wrapper = useMemo(() => {
    if (!mounted) return { className: 'min-h-screen bg-white dark:bg-black', style: {} as React.CSSProperties }
    return {
      className: 'min-h-screen bg-white dark:bg-black',
      style: {},
    }
  }, [mounted])

  // Colors for floating blobs use theme background triplet via CSS vars

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className={wrapper.className} style={wrapper.style}>
      {/* Animated background elements */}
      {/* flat background for readability */}
      
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
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${isSidebarCollapsed ? 'md:left-20' : 'md:left-64'}`}>
        <Footer />
      </div>
    </div>
  )
}
