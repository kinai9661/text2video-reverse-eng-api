import VideoGenerator from '@/components/VideoGenerator'
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-8">Text2Video 2026 🔧 Fixed</h1>
        <VideoGenerator />
      </div>
    </main>
  )
}