import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Poppins } from 'next/font/google'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ThemeProvider as CustomThemeProvider } from '@/contexts/theme-context'
import './globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: {
    default: 'TripFeels - Role-Based Dashboard',
    template: '%s | TripFeels'
  },
  description: 'A comprehensive role-based dashboard system for managing users, staff, partners, and agents. Secure, scalable, and user-friendly platform for travel management.',
  keywords: ['dashboard', 'role-based', 'travel management', 'user management', 'admin panel', 'tripfeels'],
  authors: [{ name: 'TripFeels Team' }],
  creator: 'TripFeels',
  publisher: 'TripFeels',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tripfeels.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TripFeels - Role-Based Dashboard',
    description: 'A comprehensive role-based dashboard system for managing users, staff, partners, and agents.',
    url: 'https://tripfeels.com',
    siteName: 'TripFeels',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripFeels - Role-Based Dashboard',
    description: 'A comprehensive role-based dashboard system for managing users, staff, partners, and agents.',
    creator: '@tripfeels',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Trusted Types support
              if (window.trustedTypes && window.trustedTypes.createPolicy) {
                window.trustedTypes.createPolicy('default', {
                  createHTML: (string) => string,
                  createScript: (string) => string,
                  createScriptURL: (string) => string,
                });
              }
              
              try {
                const theme = localStorage.getItem('tripfeels-theme') || 'system';
                const root = document.documentElement;
                root.classList.remove('light', 'dark');
                
                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              } catch (e) {
                // Fallback to system theme if localStorage is not available
                const root = document.documentElement;
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
              }
            `,
          }}
        />
      </head>
      <body className={`${GeistSans.className} ${poppins.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "TripFeels",
              "description": "A comprehensive role-based dashboard system for managing users, staff, partners, and agents. Secure, scalable, and user-friendly platform for travel management.",
              "url": "https://tripfeels.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "TripFeels Team"
              },
              "publisher": {
                "@type": "Organization",
                "name": "TripFeels"
              }
            })
          }}
        />
        <ThemeProvider
          defaultTheme="system"
          storageKey="tripfeels-theme"
        >
          <CustomThemeProvider>
            <AuthSessionProvider>
              {children}
            </AuthSessionProvider>
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
