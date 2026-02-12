'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Loader2, Download, Copy } from 'lucide-react'

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
        // 開始輪詢任務狀態
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
    const maxAttempts = 60 // 5 分鐘

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
      <Card className="bg-white/95 backdrop-blur">
        <CardHeader>
          <CardTitle>生成參數</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>提示詞</Label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想生成的影片..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>模型</Label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="kling-1.6">Kling 1.6</option>
                <option value="kling-1.5">Kling 1.5</option>
                <option value="default">Default</option>
              </select>
            </div>

            <div>
              <Label>時長 (秒)</Label>
              <Input
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
                min={3}
                max={10}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>畫面比例</Label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="16:9">16:9 (橫屏)</option>
              <option value="9:16">9:16 (豎屏)</option>
              <option value="1:1">1:1 (方形)</option>
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              '生成影片'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 右側：輸出 */}
      <Card className="bg-white/95 backdrop-blur">
        <CardHeader>
          <CardTitle>輸出結果</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="video" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="video">影片</TabsTrigger>
              <TabsTrigger value="api">API 資訊</TabsTrigger>
              <TabsTrigger value="request">請求</TabsTrigger>
              <TabsTrigger value="response">響應</TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="mt-4">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(videoUrl, '_blank')}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下載
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(videoUrl)}
                      className="flex-1"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      複製連結
                    </Button>
                  </div>
                </div>
              )}

              {!loading && !videoUrl && (
                <p className="text-center text-gray-500 py-12">
                  輸入提示詞並點擊生成按鈕
                </p>
              )}
            </TabsContent>

            <TabsContent value="api" className="mt-4">
              {apiInfo && (
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
                    <span className="text-xs">{apiInfo.url}</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="request" className="mt-4">
              {requestData && (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(requestData, null, 2)}
                </pre>
              )}
            </TabsContent>

            <TabsContent value="response" className="mt-4">
              {apiResponse && (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}