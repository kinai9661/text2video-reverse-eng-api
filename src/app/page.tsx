import VideoGenerator from '@/components/VideoGenerator'

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 animate-pulse-slow">
            Text2Video 2026
          </h1>
          <p className="text-white/90 text-lg mb-2">
            ✨ 12+ 最新 AI 模型 | 🏆 頂級質量 | ⚡ 極速生成
          </p>
          <div className="flex justify-center gap-3 text-sm text-white/80">
            <span>🎬 Kling 2.6</span>
            <span>•</span>
            <span>🚀 Runway 4.5</span>
            <span>•</span>
            <span>👤 Veo 3.1</span>
            <span>•</span>
            <span>🔥 Sora 2</span>
          </div>
        </div>
        <VideoGenerator />
      </div>
    </main>
  )
}