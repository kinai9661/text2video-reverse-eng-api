import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Text2Video API - 圖片上傳支持',
  description: 'Text/Image to Video Generation with 10+ AI Models',
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