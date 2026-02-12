'use client'

import { useState } from 'react'

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('kling-1.6')
  const [seconds, setSeconds] = useState(5)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [requestData, setRequestData] = useState<any>(null)
  const [apiInfo, setApiInfo] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('video')

  const handleGenerate = async () => {
    setLoading(true)
    setVideoUrl(null)
    setTaskId(null)

    const body = { prompt, model, seconds, aspect_ratio: aspectRatio }
    setRequestData(body)

    try {
      const startTime = Date.now()
      const res = await fetch('/api/videos/text2video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const responseTime = Date.now() - startTime
      const data = await res.json()

      setApiResponse(data)
      setApiInfo({
        status: res.status,
        statusText: res.ok ? 'Success' : 'Error',
        responseTime: `${responseTime}ms`,
        url: '/api/videos/text2video'
      })

      if (data.id) {
        setTaskId(data.id)
        pollTaskStatus(data.id)
      }

      if (data.video_url) {
        setVideoUrl(data.video_url)
        setLoading(false)
      }
    } catch (error: any) {
      setApiResponse({ error: error.message })
      setApiInfo({ status: 500, statusText: 'Error', url: '/api/videos/text2video' })
      setLoading(false)
    }
  }

  const pollTaskStatus = async (id: string) => {
    let attempts = 0
    const maxAttempts = 60

    const interval = setInterval(async () => {
      attempts++

      try {
        const res = await fetch(`/api/videos/tasks/${id}`)
        const data = await res.json()

        if (data.status === 'completed' && data.video_url) {
          setVideoUrl(data.video_url)
          setApiResponse(data)
          setLoading(false)
          clearInterval(interval)
        } else if (data.status === 'failed') {
          setLoading(false)
          clearInterval(interval)
        } else if (attempts >= maxAttempts) {
          setLoading(false)
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 5000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左側：輸入 */}
      <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">生成參數</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">提示詞</label>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想生成的影片..."
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">模型</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="kling-1.6">Kling 1.6</option>
                <option value="kling-1.5">Kling 1.5</option>
                <option value="default">Default</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">時長 (秒)</label>
              <input
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
                min={3}
                max={10}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">畫面比例</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="16:9">16:9 (橫屏)</option>
              <option value="9:16">9:16 (豎屏)</option>
              <option value="1:1">1:1 (方形)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中...
              </span>
            ) : (
              '生成影片'
            )}
          </button>
        </div>
      </div>

      {/* 右側：輸出 */}
      <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">輸出結果</h2>

        <div className="mb-4">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 w-full">
            {[
              { key: 'video', label: '影片' },
              { key: 'api', label: 'API 資訊' },
              { key: 'request', label: '請求' },
              { key: 'response', label: '響應' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all flex-1 ${
                  activeTab === tab.key ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {activeTab === 'video' && (
            <div>
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="animate-spin h-12 w-12 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">影片生成中，請稍候...</p>
                  {taskId && <p className="text-sm text-gray-500 mt-2">任務 ID: {taskId}</p>}
                </div>
              )}

              {videoUrl && (
                <div className="space-y-3">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(videoUrl, '_blank')}
                      className="flex-1 border px-4 py-2 rounded-md hover:bg-gray-50 flex items-center justify-center text-sm"
                    >
                      ⬇ 下載
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(videoUrl)}
                      className="flex-1 border px-4 py-2 rounded-md hover:bg-gray-50 flex items-center justify-center text-sm"
                    >
                      📋 複製連結
                    </button>
                  </div>
                </div>
              )}

              {!loading && !videoUrl && (
                <p className="text-center text-gray-500 py-12">
                  輸入提示詞並點擊生成按鈕
                </p>
              )}
            </div>
          )}

          {activeTab === 'api' && apiInfo && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">狀態碼:</span>
                <span className={apiInfo.status === 200 ? 'text-green-600' : 'text-red-600'}>
                  {apiInfo.status} {apiInfo.statusText}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">響應時間:</span>
                <span>{apiInfo.responseTime}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">端點:</span>
                <span className="text-xs break-all">{apiInfo.url}</span>
              </div>
            </div>
          )}

          {activeTab === 'request' && requestData && (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(requestData, null, 2)}
            </pre>
          )}

          {activeTab === 'response' && apiResponse && (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}