'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Facebook, Instagram, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear()
  const [settings, setSettings] = useState<{ social?: any } | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tripfeels-footer-settings')
      if (raw) setSettings(JSON.parse(raw))
    } catch (e) {
      console.error('footer localStorage error:', e)
    }
  }, [])

  return (
    <footer className={cn('', className)}>
      <div className="w-full border-t border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 backdrop-blur-md shadow-lg">
        <div className="px-4 py-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center">
            {/* Left: Social icons */}
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              {settings?.social?.facebook && (
                <Link href={settings.social.facebook} aria-label="Facebook" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </Link>
              )}
              {settings?.social?.instagram && (
                <Link href={settings.social.instagram} aria-label="Instagram" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </Link>
              )}
              {settings?.social?.community && (
                <Link href={settings.social.community} aria-label="Community" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Users className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* Center: Links */}
            <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Privacy Policy</Link>
              <span className="text-gray-500/60 dark:text-gray-400/60">•</span>
              <Link href="/terms" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Terms & Conditions</Link>
            </div>

            {/* Right: Copyright */}
            <div className="flex items-center justify-end text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
              © {year} tripfeels. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


