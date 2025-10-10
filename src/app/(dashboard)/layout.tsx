'use client'

import { useState } from 'react'
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

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-800 dark:from-green-900 dark:via-green-800 dark:to-green-950 animated-gradient">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-green-200/30 dark:bg-green-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-green-400/30 dark:bg-green-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-green-300/30 dark:bg-green-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>
      
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
