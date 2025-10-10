'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { Footer } from '@/components/layout/footer'

export function HomePageClient() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <AuthSessionProvider>
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
        
        {/* Main content with sidebar for logged-in users */}
        <div className="flex pt-14 relative z-10">
          {/* Desktop Sidebar */}
          <div className="hidden md:block h-[calc(100vh-3.5rem)] flex">
            <Sidebar onCollapseChange={setIsSidebarCollapsed} />
          </div>
          
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
          
          <main className="flex-1 overflow-auto p-6 pb-20">
            {/* Your page content goes here */}
            <div className="space-y-6">
              {/* Welcome Section with Glassmorphism */}
              <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome to TripFeels</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Your personalized dashboard and travel management platform.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-300">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Access your personalized dashboard with all your travel information.
                  </p>
                </div>
                
                <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-300">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Travel Plans</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your travel itineraries and bookings in one place.
                  </p>
                </div>
                
                <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-300">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Profile</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update your profile information and preferences.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Fixed Footer matching dashboard style */}
        <div className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ${isSidebarCollapsed ? 'md:left-20' : 'md:left-64'}`}>
          <Footer />
        </div>
      </div>
    </AuthSessionProvider>
  )
}
