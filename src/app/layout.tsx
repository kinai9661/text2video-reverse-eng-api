import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Text2Video 2026 - AI 視頻生成',
  description: '使用最新 2026 AI 模型生成高質量視頻 | 支持 12+ 頂級模型',
  keywords: 'AI video, text to video, Kling 2.6, Runway Gen-4.5, Sora 2, 視頻生成',
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