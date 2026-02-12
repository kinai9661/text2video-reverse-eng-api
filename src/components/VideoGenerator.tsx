'use client'
import { useState } from 'react'
import { Upload, X } from 'lucide-react'

const MODELS = [
  { id: 'kling-2.6', name: 'Kling 2.6 🏆', max: 10 },
  { id: 'runway-gen4.5', name: 'Runway 4.5 🚀', max: 10 },
  { id: 'veo-3.1', name: 'Veo 3.1 👤', max: 8 },
]

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('kling-2.6')
  const [seconds, setSeconds] = useState(5)
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setVideoUrl(null)
    setError(null)

    try {
      const res = await fetch('/api/videos/text2video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, seconds, aspect_ratio: '16:9' })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error?.message || '未知錯誤')
        if (data.error?.troubleshooting?.suggestion) {
          setError(prev => prev + '\n💡 ' + data.error.troubleshooting.suggestion)
        }
        setLoading(false)
        return
      }

      if (data.id) pollTask(data.id)
      else { setVideoUrl(data.video_url); setLoading(false) }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const pollTask = (id: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/videos/tasks/${id}`)
      const data = await res.json()
      if (data.video_url) {
        setVideoUrl(data.video_url)
        setLoading(false)
        clearInterval(interval)
      } else if (data.status === 'error') {
        setError('生成失敗')
        setLoading(false)
        clearInterval(interval)
      }
    }, 5000)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white/95 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">生成參數</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">提示詞</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
              placeholder="描述你想生成的影片..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">模型</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-3 py-2 border rounded-md">
              {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">時長: {seconds}秒</label>
            <input
              type="range"
              min={3}
              max={10}
              value={seconds}
              onChange={(e) => setSeconds(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-purple-600 text-white font-medium py-3 rounded-md disabled:opacity-50 hover:bg-purple-700"
          >
            {loading ? '⏳ 生成中...' : '🎬 生成影片'}
          </button>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-xs">
            <p className="font-semibold">🔧 遇到 404 錯誤？</p>
            <p className="mt-1">編輯 src/app/api/videos/text2video/route.ts</p>
            <p>設置: <code className="bg-white px-1">USE_BASIC_MODELS = true</code></p>
          </div>
        </div>
      </div>

      <div className="bg-white/95 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">結果</h2>
        {videoUrl ? (
          <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg" />
        ) : loading ? (
          <div className="text-center py-20">
            <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>生成中...</p>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-7xl mb-4">🎬</div>
            <p>準備開始</p>
          </div>
        )}
      </div>
    </div>
  )
}