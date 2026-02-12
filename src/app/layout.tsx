import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Text2Video API - OpenAI Compatible',
  description: 'Text to Video Generation with API Analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}