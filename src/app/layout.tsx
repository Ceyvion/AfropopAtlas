import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Afropop Network | Exploring the Future of African Music',
  description: 'Discover the interconnected world of Afropop through an immersive network of artists, genres, and musical influences. Experience the future of African music visualization.',
  keywords: [
    'afropop',
    'african music',
    'music network',
    'artist visualization',
    'genre exploration',
    'musical connections',
    'afrofuturism',
    'interactive music',
    'african artists'
  ],
  authors: [{ name: 'Afropop Network' }],
  openGraph: {
    title: 'Afropop Network | Exploring the Future of African Music',
    description: 'Discover the interconnected world of Afropop through an immersive network of artists, genres, and musical influences.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Afropop Network',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Afropop Network - Interactive Music Visualization'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afropop Network | Exploring the Future of African Music',
    description: 'Discover the interconnected world of Afropop through an immersive network of artists, genres, and musical influences.',
    images: ['/og-image.png']
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#0A0A0A',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link
          rel="preload"
          href="/fonts/GeistVF.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/GeistMonoVF.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <style>{`
          @font-face {
            font-family: 'Geist';
            src: url('/fonts/GeistVF.woff') format('woff');
            font-weight: 100 900;
            font-display: swap;
            font-style: normal;
            font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          }

          @font-face {
            font-family: 'Geist Mono';
            src: url('/fonts/GeistMonoVF.woff') format('woff');
            font-weight: 100 900;
            font-display: swap;
            font-style: normal;
            font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          }
        `}</style>
      </head>
      <body suppressHydrationWarning={true}>
        {/* Background Elements */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 pointer-events-none" />
        
        {/* Content */}
        <main className="relative z-10">
          {children}
        </main>

        {/* Noise Texture */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            transform: 'translate3d(0, 0, 0)'
          }}
        />
      </body>
    </html>
  )
}
