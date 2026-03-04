import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'WorkHub',
  description: 'Plataforma de gestion de trabajos academicos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            containerStyle={{ zIndex: 9999 }}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                background: 'var(--card-bg)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
              success: {
                iconTheme: { primary: 'var(--success)', secondary: 'white' },
              },
              error: {
                iconTheme: { primary: 'var(--danger)', secondary: 'white' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
