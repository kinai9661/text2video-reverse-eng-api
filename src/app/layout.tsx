import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Text2Video API - 10+ AI 模型',
  description: 'Text to Video Generation with 10+ AI Models | OpenAI Compatible',
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