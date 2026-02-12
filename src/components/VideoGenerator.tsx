'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'

interface ModelOption {
  id: string
  name: string
  description: string
  maxDuration: number
  supportsImage: boolean
}

const VIDEO_MODELS: ModelOption[] = [
  { id: 'kling-1.6', name: 'Kling 1.6', description: '高質量中文視頻生成', maxDuration: 10, supportsImage: true },
  { id: 'kling-1.5', name: 'Kling 1.5', description: '穩定快速生成', maxDuration: 10, supportsImage: true },
  { id: 'minimax-video-01', name: 'MiniMax Video 01', description: '快速低成本', maxDuration: 6, supportsImage: false },
  { id: 'runway-gen3', name: 'Runway Gen-3', description: '電影級質量', maxDuration: 10, supportsImage: true },
  { id: 'runway-gen4', name: 'Runway Gen-4', description: '最新旗艦模型 4K', maxDuration: 10, supportsImage: true },
  { id: 'luma-ray3', name: 'Luma Ray 3', description: '流暢運鏡控制', maxDuration: 5, supportsImage: true },
  { id: 'pika-v1', name: 'Pika v1', description: '高性價比', maxDuration: 3, supportsImage: false },
  { id: 'veo-3', name: 'Google Veo 3', description: '自帶音頻生成', maxDuration: 8, supportsImage: true },
  { id: 'veo-3.1', name: 'Google Veo 3.1', description: '最新版本', maxDuration: 8, supportsImage: true },
  { id: 'default', name: 'Default', description: '默認模型', maxDuration: 5, supportsImage: false }
]

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
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')

  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const selectedModel = VIDEO_MODELS.find(m => m.id === model)
  const maxDuration = selectedModel?.maxDuration || 10
  const supportsImage = selectedModel?.supportsImage || false

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('⚠️ 圖片大小不能超過 10MB')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImageFile(null)
  }

  const handleGenerate = async () => {
    setLoading(true)
    setVideoUrl(null)
    setTaskId(null)
    setProgress(0)
    setStatusMessage('正在提交請求...')

    const body: any = { 
      prompt, 
      model, 
      seconds: Math.min(seconds, maxDuration), 
      aspect_ratio: aspectRatio 
    }

    if (uploadedImage && supportsImage) {
      body.image = uploadedImage
      body.generation_mode = 'image2video'
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

      if (res.ok && data.id) {
        setTaskId(data.id)
        setStatusMessage('任務已提交，開始生成...')
        setProgress(10)
        pollTaskStatus(data.id)
      } else if (data.video_url) {
        setVideoUrl(data.video_url)
        setProgress(100)
        setStatusMessage('✅ 生成完成！')
        setLoading(false)
      } else {
        setStatusMessage(`錯誤: ${data.error?.message || '未知錯誤'}`)
        setLoading(false)
      }
    } catch (error: any) {
      setApiResponse({ error: error.message })
      setApiInfo({ status: 500, statusText: 'Error', url: '/api/videos/text2video' })
      setStatusMessage(`請求失敗: ${error.message}`)
      setLoading(false)
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

        if (!res.ok) {
          console.error('Status check failed:', res.status)
          setStatusMessage(`查詢狀態失敗 (HTTP ${res.status})`)
          return
        }

        const data = await res.json()
        console.log('📊 Task status:', data)

        setApiResponse(data)

        const statusStr = String(data.status || '').toLowerCase()
        const isCompleted = ['completed', 'succeeded', 'success', 'done', 'finished'].includes(statusStr)

        const videoUrl = data.video_url || 
                        data.result?.video_url || 
                        data.output?.video_url ||
                        data.data?.video_url ||
                        data.metadata?.video_url ||
                        data.video ||
                        data.result?.video ||
                        data.output?.video

        if (isCompleted && videoUrl) {
          setVideoUrl(videoUrl)
          setProgress(100)
          setStatusMessage('✅ 生成完成！')
          setLoading(false)
          if (pollInterval) clearInterval(pollInterval)
        } else if (['failed', 'error', 'cancelled'].includes(statusStr)) {
          const errorMsg = data.error || data.message || data.error_message || '未知錯誤'
          setStatusMessage(`❌ 生成失敗: ${errorMsg}`)
          setLoading(false)
          if (pollInterval) clearInterval(pollInterval)
        } else if (['processing', 'pending', 'running', 'queued', 'in_progress'].includes(statusStr)) {
          const progressValue = data.progress || data.percentage || progressPercent
          setProgress(Math.floor(progressValue))
          setStatusMessage(`⏳ 生成中... ${Math.floor(progressValue)}%`)
        } else {
          setStatusMessage(`狀態: ${data.status || 'unknown'} (${attempts}/${maxAttempts})`)
        }

        if (attempts >= maxAttempts) {
          setStatusMessage('⏱ 生成超時')
          setLoading(false)
          if (pollInterval) clearInterval(pollInterval)
        }
      } catch (error: any) {
        console.error('❌ Polling error:', error)
        setStatusMessage(`輪詢錯誤: ${error.message}`)
      }
    }, 5000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">生成參數</h2>
        <div className="space-y-4">
          {supportsImage && (
            <div>
              <label className="block text-sm font-medium mb-2">
                🖼 首幀圖片 <span className="text-gray-500">(可選)</span>
              </label>
              {!uploadedImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
                     onClick={() => document.getElementById('image-upload')?.click()}>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">點擊上傳圖片</p>
                  <p className="text-xs text-gray-400">支持 PNG, JPG, WebP，最大 10MB</p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded" className="w-full rounded-lg border-2 border-purple-400" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mt-2 text-xs text-gray-600 bg-green-50 border border-green-200 p-2 rounded">
                    ✅ 圖片已上傳 | 模式: Image-to-Video
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
              placeholder={uploadedImage 
                ? "描述圖片中的運動效果...&#10;&#10;範例：鏡頭緩慢推進，人物微笑點頭"
                : "描述你想生成的影片場景...&#10;&#10;範例：陽光下微笑的女人"}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none min-h-[100px] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">AI 模型</label>
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value)
                const newModel = VIDEO_MODELS.find(m => m.id === e.target.value)
                if (newModel) {
                  if (seconds > newModel.maxDuration) {
                    setSeconds(newModel.maxDuration)
                  }
                  if (!newModel.supportsImage && uploadedImage) {
                    alert('⚠️ 此模型不支援圖片輸入，將移除已上傳圖片')
                    removeImage()
                  }
                }
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              {VIDEO_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.supportsImage ? '🖼' : ''} - {m.description}
                </option>
              ))}
            </select>
            {selectedModel && (
              <p className="text-xs text-gray-500 mt-1">
                ⏱ 最大: {selectedModel.maxDuration}秒 
                {selectedModel.supportsImage && ' | 🖼 支持圖片'}
              </p>
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
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">畫面比例</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
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
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {statusMessage}
              </span>
            ) : (
              uploadedImage ? '🖼➡🎬 圖片轉影片' : '🎬 生成影片'
            )}
          </button>

          {loading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full transition-all" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center">
                {progress}% {taskId && `(ID: ${taskId.substring(0, 8)}...)`}
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 text-xs rounded-r-lg">
            <p className="font-semibold mb-2">💡 {uploadedImage ? '圖片轉影片技巧' : '模型建議'}</p>
            {uploadedImage ? (
              <ul className="space-y-1 text-gray-700">
                <li>• 提示詞描述運動，不是圖片內容</li>
                <li>• 避免過於複雜的運動</li>
                <li>• 使用清晰高質量圖片</li>
                <li>• 主體居中、光線充足</li>
              </ul>
            ) : (
              <ul className="space-y-1 text-gray-700">
                <li>🇨🇳 <strong>Kling 1.6</strong>: 中文+圖片</li>
                <li>🎬 <strong>Runway Gen-4</strong>: 圖片電影級</li>
                <li>🎵 <strong>Veo 3.1</strong>: 圖片+音頻</li>
                <li>📦 <strong>Luma Ray 3</strong>: 圖片3D</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">輸出結果</h2>

        <div className="mb-4">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 w-full">
            {[
              { key: 'video', label: '🎥 影片' },
              { key: 'api', label: '📊 API' },
              { key: 'request', label: '📤 請求' },
              { key: 'response', label: '📥 響應' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all flex-1 ${
                  activeTab === tab.key ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600'
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
                <div className="flex flex-col items-center py-12">
                  <svg className="animate-spin h-12 w-12 text-purple-600 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="font-semibold text-lg">{selectedModel?.name}</p>
                  <p className="text-gray-600 mt-2">{statusMessage}</p>
                  {taskId && (
                    <div className="mt-3 bg-gray-50 p-3 rounded">
                      <code className="text-xs">{taskId}</code>
                      <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                    </div>
                  )}
                  <div className="mt-4 text-xs bg-yellow-50 border border-yellow-200 p-3 rounded max-w-md">
                    <p className="font-semibold text-yellow-800">⏱ 預計時間</p>
                    <p>• 文字: 30-90秒</p>
                    <p>• 圖片: 60-120秒</p>
                    <p>• 複雜: 90-180秒</p>
                  </div>
                </div>
              )}

              {videoUrl && (
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
                      className="flex-1 border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-md hover:bg-purple-50"
                    >
                      ⬇ 下載
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(videoUrl)
                        alert('✅ 已複製')
                      }}
                      className="flex-1 border-2 border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                    >
                      📋 複製
                    </button>
                  </div>
                  <div className="text-xs text-center bg-green-50 border border-green-200 py-2 rounded">
                    ✨ {selectedModel?.name} | {apiInfo?.mode || 'Text2Video'} | {seconds}秒 {aspectRatio}
                  </div>
                </div>
              )}

              {!loading && !videoUrl && (
                <div className="text-center py-16 text-gray-500">
                  <svg className="mx-auto h-20 w-20 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium text-lg">準備開始</p>
                  <p className="text-sm mt-2">輸入提示詞或上傳圖片</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && apiInfo && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold">狀態碼:</span>
                <span className={`font-bold ${apiInfo.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                  {apiInfo.status} {apiInfo.statusText}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold">生成模式:</span>
                <span className="text-purple-600 font-medium">{apiInfo.mode || 'Text2Video'}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold">響應時間:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{apiInfo.responseTime}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold">模型:</span>
                <span className="text-purple-600">{apiInfo.model}</span>
              </div>
              {taskId && (
                <div className="flex justify-between py-3 border-b">
                  <span className="font-semibold">任務ID:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded break-all">{taskId}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'request' && requestData && (
            <div>
              <div className="mb-2 text-xs flex justify-between">
                <span>POST /api/videos/text2video</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(requestData, null, 2))
                    alert('✅ 已複製')
                  }}
                  className="text-purple-600"
                >
                  📋 複製
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
{JSON.stringify(requestData, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'response' && apiResponse && (
            <div>
              <div className="mb-2 text-xs flex justify-between">
                <span>實時響應</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2))
                    alert('✅ 已複製')
                  }}
                  className="text-purple-600"
                >
                  📋 複製
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
{JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}