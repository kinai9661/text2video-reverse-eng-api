'use client'

import { useState } from 'react'
import { Upload, X, AlertCircle, Sparkles, Info } from 'lucide-react'

interface ModelOption {
  id: string
  name: string
  description: string
  maxDuration: number
  supportsImage: boolean
  badge?: string
  category: string
}

const VIDEO_MODELS: ModelOption[] = [
  // 🏆 頂級模型 (2026)
  { id: 'kling-2.6', name: 'Kling 2.6', description: '最佳動畫和對話', maxDuration: 10, supportsImage: true, badge: '🏆 TOP', category: 'premium' },
  { id: 'runway-gen4.5', name: 'Runway Gen-4.5', description: '頂級專業控制', maxDuration: 10, supportsImage: true, badge: '🏆 TOP', category: 'premium' },
  { id: 'veo-3.1', name: 'Google Veo 3.1', description: '最佳真實感', maxDuration: 8, supportsImage: true, badge: '🏆 TOP', category: 'premium' },
  { id: 'sora-2', name: 'Sora 2', description: '最佳動態場景', maxDuration: 10, supportsImage: true, badge: '🔥 NEW', category: 'premium' },

  // ⚡ 快速模型
  { id: 'seedance-1.5-pro', name: 'Seedance 1.5 Pro', description: '極速生成', maxDuration: 6, supportsImage: true, badge: '⚡', category: 'fast' },
  { id: 'wan-2.6', name: 'Wan 2.6', description: '高性價比', maxDuration: 8, supportsImage: true, category: 'fast' },
  { id: 'hailuo-2.3', name: 'Hailuo 2.3', description: '快速低成本', maxDuration: 6, supportsImage: false, category: 'fast' },

  // 🎨 特色模型
  { id: 'luma-ray3', name: 'Luma Ray 3', description: '電影級HDR', maxDuration: 5, supportsImage: true, badge: '🎬', category: 'special' },
  { id: 'kling-2.5', name: 'Kling 2.5', description: '動漫風格', maxDuration: 10, supportsImage: true, category: 'special' },
  { id: 'runway-gen4', name: 'Runway Gen-4', description: '4K超清', maxDuration: 10, supportsImage: true, category: 'special' },

  // 📱 入門模型
  { id: 'pika-v1.5', name: 'Pika v1.5', description: '易用入門', maxDuration: 5, supportsImage: true, category: 'entry' },
  { id: 'minimax-video-01', name: 'MiniMax', description: '基礎款', maxDuration: 6, supportsImage: false, category: 'entry' },
]

const MODEL_CATEGORIES = [
  { key: 'all', label: '全部模型', icon: '🎬' },
  { key: 'premium', label: '頂級', icon: '🏆' },
  { key: 'fast', label: '快速', icon: '⚡' },
  { key: 'special', label: '特色', icon: '🎨' },
  { key: 'entry', label: '入門', icon: '📱' }
]

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('kling-2.6')
  const [seconds, setSeconds] = useState(5)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [requestData, setRequestData] = useState<any>(null)
  const [apiInfo, setApiInfo] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('video')
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const selectedModel = VIDEO_MODELS.find(m => m.id === model)
  const maxDuration = selectedModel?.maxDuration || 10
  const supportsImage = selectedModel?.supportsImage || false

  const filteredModels = categoryFilter === 'all' 
    ? VIDEO_MODELS 
    : VIDEO_MODELS.filter(m => m.category === categoryFilter)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('⚠️ 圖片大小不能超過 10MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => setUploadedImage(null)

  const handleGenerate = async () => {
    setLoading(true)
    setVideoUrl(null)
    setTaskId(null)
    setProgress(0)
    setErrorDetails(null)
    setStatusMessage('正在提交請求...')

    const body: any = { 
      prompt, 
      model, 
      seconds: Math.min(seconds, maxDuration), 
      aspect_ratio: aspectRatio 
    }

    if (uploadedImage && supportsImage) {
      body.image = uploadedImage
    }

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
        url: '/api/videos/text2video',
        model: body.model,
        mode: uploadedImage ? 'Image2Video' : 'Text2Video'
      })

      if (!res.ok || data.error) {
        setStatusMessage(`❌ ${data.error?.message || '未知錯誤'}`)
        setErrorDetails(JSON.stringify(data, null, 2))
        setLoading(false)
        setActiveTab('response')
        return
      }

      if (data.id) {
        setTaskId(data.id)
        setStatusMessage('任務已提交')
        setProgress(10)
        pollTaskStatus(data.id)
      } else if (data.video_url) {
        setVideoUrl(data.video_url)
        setProgress(100)
        setStatusMessage('✅ 完成！')
        setLoading(false)
      }
    } catch (error: any) {
      setStatusMessage(`❌ ${error.message}`)
      setErrorDetails(error.stack)
      setLoading(false)
      setActiveTab('response')
    }
  }

  const pollTaskStatus = async (id: string) => {
    let attempts = 0
    const maxAttempts = 120
    let pollInterval: NodeJS.Timeout | null = null

    pollInterval = setInterval(async () => {
      attempts++
      const progressPercent = Math.min(10 + (attempts * 0.7), 95)
      setProgress(Math.floor(progressPercent))

      try {
        const res = await fetch(`/api/videos/tasks/${id}`)
        const data = await res.json()

        setApiResponse(data)

        if (data.status === 'not_found' || data.status === 'error') {
          setStatusMessage(`❌ ${data.error}`)
          setErrorDetails(JSON.stringify(data, null, 2))
          setLoading(false)
          setActiveTab('response')
          if (pollInterval) clearInterval(pollInterval)
          return
        }

        const statusStr = String(data.status || '').toLowerCase()
        const isCompleted = ['completed', 'succeeded', 'success', 'done'].includes(statusStr)
        const videoUrl = data.video_url

        if (isCompleted && videoUrl) {
          setVideoUrl(videoUrl)
          setProgress(100)
          setStatusMessage('✅ 完成！')
          setLoading(false)
          if (pollInterval) clearInterval(pollInterval)
        } else if (['failed', 'error'].includes(statusStr)) {
          setStatusMessage(`❌ 失敗`)
          setLoading(false)
          if (pollInterval) clearInterval(pollInterval)
        } else {
          setStatusMessage(`⏳ 生成中 ${Math.floor(progressPercent)}%`)
        }

        if (attempts >= maxAttempts) {
          setStatusMessage('⏱ 超時')
          setLoading(false)
          if (pollInterval) clearInterval(pollInterval)
        }
      } catch (error: any) {
        setStatusMessage(`輪詢錯誤: ${error.message}`)
      }
    }, 5000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white/95 backdrop-blur rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">生成參數</h2>
          <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            2026
          </span>
        </div>

        {errorDetails && !loading && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">{statusMessage}</p>
                <details className="text-xs mt-2">
                  <summary className="cursor-pointer text-red-600 hover:underline">查看詳情</summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40 text-[10px]">{errorDetails}</pre>
                </details>
                <button onClick={() => setErrorDetails(null)} className="mt-2 text-xs text-red-600 hover:underline">
                  關閉
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {supportsImage && (
            <div>
              <label className="block text-sm font-medium mb-2">
                🖼 首幀圖片 <span className="text-gray-500">(可選)</span>
              </label>
              {!uploadedImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition cursor-pointer"
                     onClick={() => document.getElementById('img-up')?.click()}>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">點擊上傳圖片</p>
                  <p className="text-xs text-gray-400">支持 PNG, JPG, WebP，最大 10MB</p>
                  <input id="img-up" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              ) : (
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded" className="w-full rounded-lg border-2 border-purple-400" />
                  <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    ✓ 已上傳
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              提示詞 {uploadedImage && <span className="text-purple-600">(描述運動)</span>}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={uploadedImage ? "描述圖片中的運動效果..." : "描述你想生成的影片場景..."}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent min-h-[100px] resize-y transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 提示: 詳細描述能獲得更好的效果
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">AI 模型</label>

            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
              {MODEL_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    categoryFilter === cat.key 
                      ? 'bg-purple-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            <select 
              value={model} 
              onChange={(e) => {
                setModel(e.target.value)
                const newModel = VIDEO_MODELS.find(m => m.id === e.target.value)
                if (newModel && seconds > newModel.maxDuration) {
                  setSeconds(newModel.maxDuration)
                }
              }} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              {filteredModels.map(m => (
                <option key={m.id} value={m.id}>
                  {m.badge ? `${m.badge} ` : ''}{m.name} - {m.description}
                </option>
              ))}
            </select>

            {selectedModel && (
              <div className="mt-2 text-xs bg-gradient-to-r from-gray-50 to-purple-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-700">最大時長: </span>
                    <span className="text-purple-600 font-semibold">{selectedModel.maxDuration}秒</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedModel.supportsImage ? (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">🖼 支持圖片</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">📝 僅文字</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">時長 (秒)</label>
              <input 
                type="number" 
                value={seconds} 
                onChange={(e) => setSeconds(Math.min(Number(e.target.value), maxDuration))}
                min={3} 
                max={maxDuration} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">畫面比例</label>
              <select 
                value={aspectRatio} 
                onChange={(e) => setAspectRatio(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="16:9">16:9 橫屏</option>
                <option value="9:16">9:16 豎屏</option>
                <option value="1:1">1:1 方形</option>
                <option value="21:9">21:9 超寬</option>
                <option value="4:3">4:3 標準</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={loading || !prompt}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {statusMessage}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {uploadedImage ? '🖼➡🎬' : '🎬'} 生成影片
              </span>
            )}
          </button>

          {loading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
                <span>{progress}%</span>
                {taskId && <span className="font-mono">ID: {taskId.substring(0, 8)}...</span>}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-purple-500 p-4 text-xs rounded-r-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900 mb-2">💡 2026 最佳推薦</p>
                <ul className="space-y-1 text-gray-700">
                  <li><strong>🏆 Kling 2.6</strong>: 動畫對話最佳，Elo 1247+</li>
                  <li><strong>🎬 Runway 4.5</strong>: 專業級控制和運鏡</li>
                  <li><strong>👤 Veo 3.1</strong>: 真實人物和光影</li>
                  <li><strong>⚡ Seedance</strong>: 極速生成原型</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">輸出結果</h2>

        <div className="mb-4">
          <div className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 w-full">
            {[
              { key: 'video', label: '影片', icon: '🎥' },
              { key: 'api', label: 'API', icon: '📊' },
              { key: 'request', label: '請求', icon: '📤' },
              { key: 'response', label: '響應', icon: '📥' }
            ].map((tab) => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.key 
                    ? 'bg-white shadow-md text-purple-600 scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {activeTab === 'video' && (
            <div>
              {videoUrl ? (
                <div className="space-y-3">
                  <video 
                    key={videoUrl} 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full rounded-lg border-2 border-purple-200 shadow-lg" 
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(videoUrl, '_blank')} 
                      className="flex-1 bg-purple-600 text-white px-4 py-2.5 rounded-md hover:bg-purple-700 transition font-medium"
                    >
                      ⬇ 下載影片
                    </button>
                    <button 
                      onClick={() => { 
                        navigator.clipboard.writeText(videoUrl)
                        alert('✅ 鏈接已複製到剪貼板')
                      }}
                      className="flex-1 border-2 border-gray-300 px-4 py-2.5 rounded-md hover:bg-gray-50 transition font-medium"
                    >
                      📋 複製鏈接
                    </button>
                  </div>
                  <div className="text-xs text-center bg-green-50 border border-green-200 py-2 rounded">
                    ✨ 由 <strong>{selectedModel?.name}</strong> 生成 | {apiInfo?.mode || 'Text2Video'}
                  </div>
                </div>
              ) : loading ? (
                <div className="text-center py-16">
                  <div className="relative inline-block">
                    <div className="animate-spin h-16 w-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
                    </div>
                  </div>
                  <p className="font-semibold text-lg text-gray-800">{selectedModel?.name}</p>
                  <p className="text-sm text-gray-600 mt-2">{statusMessage}</p>
                  {taskId && (
                    <div className="mt-3 inline-block bg-gray-100 px-3 py-1 rounded-full">
                      <code className="text-xs text-gray-700">任務 ID: {taskId.substring(0, 12)}...</code>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-7xl mb-4 opacity-50">🎬</div>
                  <p className="text-lg font-medium">準備開始生成</p>
                  <p className="text-sm mt-2">輸入提示詞開始創作</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && apiInfo && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">API 響應信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-600">HTTP 狀態:</span>
                    <span className={`font-bold ${apiInfo.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                      {apiInfo.status} {apiInfo.statusText}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-600">使用模型:</span>
                    <span className="font-mono text-purple-600 font-semibold">{selectedModel?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-600">響應時間:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{apiInfo.responseTime}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-gray-600">生成模式:</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                      {apiInfo.mode}
                    </span>
                  </div>
                </div>
              </div>
              {taskId && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">任務 ID:</p>
                  <code className="text-xs bg-white px-2 py-1 rounded border block break-all">{taskId}</code>
                </div>
              )}
            </div>
          )}

          {activeTab === 'request' && requestData && (
            <div>
              <div className="mb-2 text-xs flex justify-between items-center">
                <span className="font-mono text-gray-600">POST /api/videos/text2video</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(requestData, null, 2))
                    alert('✅ 已複製到剪貼板')
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  📋 複製
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96 border border-gray-700">
{JSON.stringify(requestData, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'response' && apiResponse && (
            <div>
              <div className="mb-2 text-xs flex justify-between items-center">
                <span className="font-mono text-gray-600">API Response</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2))
                    alert('✅ 已複製到剪貼板')
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  📋 複製
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96 border border-gray-700">
{JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}