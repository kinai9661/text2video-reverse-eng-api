'use client'
import{useState}from'react'
import{AlertCircle,Upload,X,Download,Copy}from'lucide-react'

const MODELS=[
  {id:'kling-2.6',name:'Kling 2.6',badge:'🏆',max:10},
  {id:'kling-1.6',name:'Kling 1.6',badge:'⚡',max:10},
  {id:'runway-gen4.5',name:'Runway 4.5',badge:'🚀',max:10},
  {id:'runway-gen3',name:'Runway 3',badge:'🎬',max:10},
  {id:'veo-3.1',name:'Veo 3.1',badge:'👤',max:8},
  {id:'veo-3',name:'Veo 3',badge:'🎭',max:8},
  {id:'sora-2',name:'Sora 2',badge:'🔥',max:10},
  {id:'sora-1',name:'Sora 1',badge:'✨',max:10},
]

export default function VideoGenerator(){
  const[prompt,setPrompt]=useState('')
  const[model,setModel]=useState('kling-2.6')
  const[seconds,setSeconds]=useState(5)
  const[loading,setLoading]=useState(false)
  const[videoUrl,setVideoUrl]=useState<string|null>(null)
  const[error,setError]=useState<any>(null)
  const[taskId,setTaskId]=useState<string|null>(null)

  const handleGenerate=async()=>{
    setLoading(true)
    setVideoUrl(null)
    setError(null)
    setTaskId(null)

    try{
      const res=await fetch('/api/videos/text2video',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({prompt,model,seconds,aspect_ratio:'16:9'})
      })

      const data=await res.json()

      if(!res.ok||data.error){
        setError(data.error)
        setLoading(false)
        return
      }

      if(data.id){
        setTaskId(data.id)
        pollTask(data.id)
      }else{
        setVideoUrl(data.video_url)
        setLoading(false)
      }
    }catch(err:any){
      setError({message:err.message})
      setLoading(false)
    }
  }

  const pollTask=(id:string)=>{
    const interval=setInterval(async()=>{
      const res=await fetch(`/api/videos/tasks/${id}`)
      const data=await res.json()

      if(data.video_url){
        setVideoUrl(data.video_url)
        setLoading(false)
        clearInterval(interval)
      }else if(data.status==='error'||data.status==='not_found'){
        setError({message:'生成失敗'})
        setLoading(false)
        clearInterval(interval)
      }
    },5000)
  }

  const maxDuration=MODELS.find(m=>m.id===model)?.max||10

  return(
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white/95 backdrop-blur rounded-xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">生成參數</h2>

        {error&&(
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"/>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  {error.message||'未知錯誤'}
                </p>
                {error.status===404&&(
                  <div className="mt-2 text-xs text-red-700 space-y-1">
                    <p className="font-semibold">🔧 修復方法:</p>
                    <p>1. 運行: <code className="bg-red-100 px-1.5 py-0.5 rounded">npm run detect</code></p>
                    <p>2. 或編輯 route.ts 切換 ACTIVE_SCHEME</p>
                    {error.current_scheme&&<p className="mt-1">當前方案: {error.current_scheme}</p>}
                    {error.suggestion&&<p className="mt-1 text-red-600">💡 {error.suggestion}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">提示詞</label>
            <textarea
              value={prompt}
              onChange={(e)=>setPrompt(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg min-h-[120px] focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="描述你想生成的影片內容..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">模型</label>
            <select 
              value={model} 
              onChange={(e)=>setModel(e.target.value)} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {MODELS.map(m=>(
                <option key={m.id} value={m.id}>
                  {m.badge} {m.name} (最長 {m.max}s)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-gray-700">時長</label>
              <span className="text-sm font-semibold text-purple-600">{seconds} 秒</span>
            </div>
            <input
              type="range"
              min={3}
              max={maxDuration}
              value={seconds}
              onChange={(e)=>setSeconds(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3s</span>
              <span>{maxDuration}s</span>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading||!prompt}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3.5 rounded-lg disabled:opacity-50 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            {loading?'⏳ 生成中...':'🎬 生成影片'}
          </button>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg text-xs">
            <p className="font-semibold text-blue-900 mb-1.5">🔍 自動檢測工具</p>
            <p className="text-blue-800 mb-2">遇到 404？找出正確的模型名稱:</p>
            <code className="block bg-white px-3 py-2 rounded border border-blue-200 text-blue-900 font-mono">
              npm run detect
            </code>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur rounded-xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">結果</h2>

        {videoUrl?(
          <div className="space-y-3">
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop 
              className="w-full rounded-lg border-4 border-purple-200 shadow-lg"
            />
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={()=>window.open(videoUrl,'_blank')} 
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 font-medium transition"
              >
                <Download size={18}/>下載
              </button>
              <button 
                onClick={()=>{
                  navigator.clipboard.writeText(videoUrl)
                  alert('✅ URL 已複製到剪貼板')
                }}
                className="flex items-center justify-center gap-2 border-2 border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                <Copy size={18}/>複製
              </button>
            </div>
          </div>
        ):loading?(
          <div className="text-center py-24">
            <div className="relative inline-flex">
              <div className="animate-spin h-16 w-16 border-4 border-purple-600 border-t-transparent rounded-full"></div>
              <div className="absolute inset-0 animate-ping h-16 w-16 border-4 border-purple-300 border-t-transparent rounded-full opacity-20"></div>
            </div>
            <p className="mt-6 font-semibold text-gray-700 text-lg">生成中...</p>
            {taskId&&(
              <p className="text-xs text-gray-500 mt-2 font-mono">
                ID: {taskId.substring(0,16)}...
              </p>
            )}
            <p className="text-sm text-gray-500 mt-4">這可能需要 30-60 秒</p>
          </div>
        ):(
          <div className="text-center py-24 text-gray-400">
            <div className="text-8xl mb-4">🎬</div>
            <p className="text-lg font-medium">準備開始創作</p>
            <p className="text-sm mt-2">填寫提示詞並選擇模型</p>
          </div>
        )}
      </div>
    </div>
  )
}