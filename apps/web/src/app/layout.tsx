import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'H0RN3T — Cybersecurity Intelligence Platform',
  description: 'AI-powered deepfake detection, threat intelligence, and cybersecurity analysis.',
  keywords: ['cybersecurity', 'deepfake detection', 'threat intelligence', 'AI security'],
  openGraph: {
    title: 'H0RN3T',
    description: 'AI-powered cybersecurity intelligence platform',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
