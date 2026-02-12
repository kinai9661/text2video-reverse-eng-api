import VideoGenerator from '@/components/VideoGenerator'
import './globals.css'

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Text2Video API 逆向工程
          </h1>
          <p className="text-white/90">OpenAI Compatible | 實時 API 分析</p>
        </div>
        <VideoGenerator />
      </div>
    </main>
  )
}