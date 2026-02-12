'use client'

import { useState } from 'react'

interface ModelOption {
  id: string
  name: string
  description: string
  maxDuration: number
}

const VIDEO_MODELS: ModelOption[] = [
  { id: 'kling-1.6', name: 'Kling 1.6', description: '高質量中文視頻生成', maxDuration: 10 },
  { id: 'kling-1.5', name: 'Kling 1.5', description: '穩定快速生成', maxDuration: 10 },
  { id: 'minimax-video-01', name: 'MiniMax Video 01', description: '快速低成本', maxDuration: 6 },
  { id: 'runway-gen3', name: 'Runway Gen-3', description: '電影級質量', maxDuration: 10 },
  { id: 'runway-gen4', name: 'Runway Gen-4', description: '最新旗艦模型 4K', maxDuration: 10 },
  { id: 'luma-ray3', name: 'Luma Ray 3', description: '流暢運鏡控制', maxDuration: 5 },
  { id: 'pika-v1', name: 'Pika v1', description: '高性價比', maxDuration: 3 },
  { id: 'veo-3', name: 'Google Veo 3', description: '自帶音頻生成', maxDuration: 8 },
  { id: 'veo-3.1', name: 'Google Veo 3.1', description: '最新版本', maxDuration: 8 },
  { id: 'default', name: 'Default', description: '默認模型', maxDuration: 5 }
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

  const selectedModel = VIDEO_MODELS.find(m => m.id === model)
  const maxDuration = selectedModel?.maxDuration || 10

  const handleGenerate = async () => {
    setLoading(true)
    setVideoUrl(null)
    setTaskId(null)
    setProgress(0)
    setStatusMessage('正在提交請求...')

    const body = { 
      prompt, 
      model, 
      seconds: Math.min(seconds, maxDuration), 
      aspect_ratio: aspectRatio 
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
        model: body.model
      })

      if (res.ok && data.id) {
        setTaskId(data.id)
        setStatusMessage('任務已提交，開始生成...')
        setProgress(10)
        pollTaskStatus(data.id)
      } else if (data.video_url) {
        // 立即返回視頻 URL（同步生成）
        setVideoUrl(data.video_url)
        setProgress(100)
        setStatusMessage('✅ 生成完成！')
        setLoading(false)
      } else {
        // 錯誤處理
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
    const maxAttempts = 120 // 10 分鐘（每 5 秒一次）
    let pollInterval: NodeJS.Timeout | null = null

    pollInterval = setInterval(async () => {
      attempts++
      const progressPercent = Math.min(10 + (attempts * 0.7), 95)
      setProgress(Math.floor(progressPercent))

      try {
        const res = await fetch(`/api/videos/tasks/${id}`)

        if (!res.ok) {
          console.error('Status check failed:', res.status)
          setStatusMessage(`查詢狀態失敗 (HTTP ${res.status})，繼續重試...`)
          return
        }

        const data = await res.json()
        console.log('📊 Task status response:', data)

        // 更新最新響應到 UI
        setApiResponse(data)

        // 檢查多種完成狀態格式
        const isCompleted = ['completed', 'succeeded', 'success', 'done', 'finished'].includes(
          (data.status || '').toLowerCase()
        )

        // 檢查多個可能的 video_url 位置
        const videoUrl = data.video_url || 
                        data.result?.video_url || 
                        data.output?.video_url ||
                        data.data?.video_url ||
                        data.metadata?.video_url ||
                        data.video ||
                        data.result?.video ||
                        data.output?.video

        console.log('🎬 Video URL found:', videoUrl)
        console.log('✅ Status:', data.status, 'Is completed:', isCompleted)

        if (isCompleted && videoUrl) {
          setVideoUrl(videoUrl)
          setProgress(100)
          setStatusMessage('✅ 生成完成！')
          setLoading(false)
          if (pollInterval) clearInterval(pollInterval)
          console.log('🎉 Video generation completed successfully!')
        } else if (['failed', 'error', 'cancelled'].includes((data.status || '').toLowerCase())) {
          const errorMsg = data.error || data.message || data.error_message || '未知錯誤'
          setStatusMessage(`❌ 生成失敗: ${errorMsg}`)
          setLoading(false)
          if (pollInterval) clearInterval(pollInterval)
          console.error('❌ Task failed:', errorMsg)
        } else if (['processing', 'pending', 'running', 'queued', 'in_progress'].includes((data.status || '').toLowerCase())) {
          const progressValue = data.progress || data.percentage || progressPercent
          setProgress(Math.floor(progressValue))
          setStatusMessage(`⏳ 生成中... ${Math.floor(progressValue)}%`)
        } else {
          // 未知狀態，記錄完整響應
          console.warn('⚠️ Unknown status:', data.status, 'Full response:', data)
          setStatusMessage(`狀態: ${data.status || 'unknown'} (嘗試 ${attempts}/${maxAttempts})`)
        }

        // 超時處理
        if (attempts >= maxAttempts) {
          setStatusMessage('⏱ 生成超時，請切換到「📥 響應」標籤查看詳情')
          setLoading(false)
          if (pollInterval) clearInterval(pollInterval)
          console.error('⏱ Timeout after', maxAttempts, 'attempts')
        }
      } catch (error: any) {
        console.error('❌ Polling error:', error)
        setStatusMessage(`輪詢錯誤: ${error.message}`)

        // 連續失敗 5 次後停止
        if (attempts >= 5 && attempts % 5 === 0) {
          setLoading(false)
          if (pollInterval) clearInterval(pollInterval)
        }
      }
    }, 5000) // 每 5 秒查詢一次
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左側：輸入 */}
      <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">生成參數</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">提示詞</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想生成的影片場景，細節越豐富效果越好...&#10;&#10;範例：陽光下微笑的女人，輕風吹拂頭髮，電影級質感，4K 畫質"
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
                if (newModel && seconds > newModel.maxDuration) {
                  setSeconds(newModel.maxDuration)
                }
              }}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-600"
            >
              {VIDEO_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} - {m.description}
                </option>
              ))}
            </select>
            {selectedModel && (
              <p className="text-xs text-gray-500 mt-1">
                ⏱ 最大時長: {selectedModel.maxDuration}秒 | {selectedModel.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                時長 (秒) <span className="text-gray-500 text-xs">最大 {maxDuration}s</span>
              </label>
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
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {statusMessage}
              </span>
            ) : (
              '🎬 生成影片'
            )}
          </button>

          {/* 進度條 */}
          {loading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center font-medium">
                {progress}% 完成 {taskId && `(任務 ID: ${taskId.substring(0, 8)}...)`}
              </p>
            </div>
          )}

          {/* 模型對比提示 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 text-xs rounded-r-lg">
            <p className="font-semibold mb-2 text-blue-900">💡 模型選擇建議</p>
            <ul className="space-y-1.5 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">🇨🇳</span>
                <span><strong>Kling 1.6/1.5</strong>: 中文理解最佳，10秒高質量</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎬</span>
                <span><strong>Runway Gen-4</strong>: 電影級 4K，運鏡流暢</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎵</span>
                <span><strong>Veo 3/3.1</strong>: 自帶音頻，適合廣告</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📦</span>
                <span><strong>Luma Ray 3</strong>: 3D 產品展示專用</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💰</span>
                <span><strong>Pika v1</strong>: 預算有限首選（3秒）</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 右側：輸出 */}
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
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all flex-1 ${
                  activeTab === tab.key ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'
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
                  <p className="text-gray-700 font-semibold mb-1 text-lg">
                    {selectedModel?.name}
                  </p>
                  <p className="text-gray-600 font-medium mb-3">
                    {statusMessage}
                  </p>
                  {taskId && (
                    <div className="text-center mt-2 bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        任務 ID: <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">{taskId}</code>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">進度: {progress}%</p>
                    </div>
                  )}
                  <div className="mt-4 text-xs text-gray-500 text-center bg-yellow-50 border border-yellow-200 p-3 rounded-lg max-w-md">
                    <p className="font-semibold mb-1 text-yellow-800">⏱ 預計等待時間</p>
                    <p>• 簡單場景: 30-60 秒</p>
                    <p>• 複雜場景: 60-120 秒</p>
                    <p>• 長視頻 (8-10s): 90-180 秒</p>
                    <p className="mt-2 text-yellow-700">💡 可切換到「📥 響應」標籤查看實時狀態</p>
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
                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3C/svg%3E"
                  >
                    您的瀏覽器不支持 video 標籤
                  </video>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(videoUrl, '_blank')}
                      className="flex-1 border-2 border-purple-600 text-purple-600 px-4 py-2.5 rounded-md hover:bg-purple-50 flex items-center justify-center text-sm font-medium transition-all"
                    >
                      ⬇ 下載影片
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(videoUrl)
                        alert('✅ 影片連結已複製到剪貼板！')
                      }}
                      className="flex-1 border-2 border-gray-300 px-4 py-2.5 rounded-md hover:bg-gray-50 flex items-center justify-center text-sm font-medium transition-all"
                    >
                      📋 複製連結
                    </button>
                  </div>
                  <div className="text-xs text-center bg-green-50 border border-green-200 py-2 rounded">
                    ✨ 由 <strong>{selectedModel?.name}</strong> 生成 | {seconds}秒 {aspectRatio}
                  </div>
                </div>
              )}

              {!loading && !videoUrl && (
                <div className="text-center py-16 text-gray-500">
                  <svg className="mx-auto h-20 w-20 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium text-lg">準備開始</p>
                  <p className="text-sm mt-2">輸入提示詞並選擇 AI 模型開始生成</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && apiInfo && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold text-gray-700">狀態碼:</span>
                <span className={`font-bold ${apiInfo.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                  {apiInfo.status} {apiInfo.statusText}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold text-gray-700">響應時間:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{apiInfo.responseTime}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold text-gray-700">使用模型:</span>
                <span className="text-purple-600 font-medium">{apiInfo.model}</span>
              </div>
              {taskId && (
                <div className="flex justify-between py-3 border-b">
                  <span className="font-semibold text-gray-700">任務 ID:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded break-all">{taskId}</span>
                </div>
              )}
              {progress > 0 && (
                <div className="flex justify-between py-3 border-b">
                  <span className="font-semibold text-gray-700">當前進度:</span>
                  <span className="font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">{progress}%</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold text-gray-700">API 端點:</span>
                <span className="text-xs break-all font-mono bg-gray-50 px-2 py-1 rounded">{apiInfo.url}</span>
              </div>
            </div>
          )}

          {activeTab === 'request' && requestData && (
            <div>
              <div className="mb-2 text-xs text-gray-600 flex justify-between items-center">
                <span className="font-mono">POST /api/videos/text2video</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(requestData, null, 2))
                    alert('✅ 已複製請求內容')
                  }}
                  className="text-purple-600 hover:text-purple-700 text-xs font-medium"
                >
                  📋 複製
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96 font-mono leading-relaxed">
{JSON.stringify(requestData, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'response' && apiResponse && (
            <div>
              <div className="mb-2 text-xs text-gray-600 flex justify-between items-center">
                <span className="font-mono">OpenAI Compatible Format (實時更新)</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2))
                    alert('✅ 已複製響應內容')
                  }}
                  className="text-purple-600 hover:text-purple-700 text-xs font-medium"
                >
                  📋 複製
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96 font-mono leading-relaxed">
{JSON.stringify(apiResponse, null, 2)}
              </pre>
              <p className="text-xs text-gray-500 mt-2">
                💡 此標籤會實時更新，可用於調試 API 返回格式
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}