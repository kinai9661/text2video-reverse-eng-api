import VideoGenerator from '@/components/VideoGenerator'

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Text2Video API - Image Support
          </h1>
          <p className="text-white/90">支援文字與圖片生成 | 10+ AI 模型</p>
        </div>
        <VideoGenerator />
      </div>
    </main>
  )
}