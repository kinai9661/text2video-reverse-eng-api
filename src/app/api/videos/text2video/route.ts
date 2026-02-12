import { NextRequest, NextResponse } from 'next/server';

const VIDEO_API_URL = 'https://app-9kpm005bczy9-vitesandbox.sandbox.medo.dev/functions/v1/video-api/v1/videos/text2video';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = process.env.SUPABASE_TOKEN;

    if (!token || token === 'your-supabase-token-here') {
      console.error('❌ SUPABASE_TOKEN not configured');
      return NextResponse.json(
        { error: { code: 'missing_token', message: 'SUPABASE_TOKEN not configured in .env.local' } },
        { status: 500 }
      );
    }

    // 2026 最新模型映射表
    const modelMap: Record<string, string> = {
      // Kling (Kuaishou) - 最佳動畫和對話
      'kling-2.6': 'kling-v2.6-master',
      'kling-2.5': 'kling-v2.5-pro',
      'kling-1.6': 'kling-v2-master',
      'kling-1.5': 'kling-v1-standard',

      // Runway - 最佳專業級和運鏡控制
      'runway-gen4.5': 'runway-gen4.5-turbo',
      'runway-gen4': 'runway-gen4-alpha',
      'runway-gen3': 'runway-gen3-alpha',

      // Google Veo - 最佳真實感和人物
      'veo-3.1': 'veo-3.1-master',
      'veo-3': 'veo-3-base',

      // OpenAI Sora - 最佳動態場景
      'sora-2': 'sora-v2-turbo',
      'sora-1': 'sora-v1-base',

      // Luma - 最佳HDR和電影級
      'luma-ray3': 'luma-ray3-pro',
      'luma-dream': 'luma-dream-machine',

      // Seedance (ByteDance) - 最快速生成
      'seedance-1.5-pro': 'seedance-v1.5-pro',
      'seedance-1.5': 'seedance-v1.5-base',

      // Wan 2.6 - 高性價比
      'wan-2.6': 'wan-v2.6',

      // Hailuo (Minimax) - 快速低成本
      'hailuo-2.3': 'hailuo-v2.3',
      'minimax-video-01': 'minimax-video-01',

      // Pika - 入門級
      'pika-v1.5': 'pika-v1.5',
      'pika-v1': 'pika-v1',

      'default': 'kling-v2.6-master'
    };

    const requestBody: any = {
      model_name: modelMap[body.model] || modelMap['default'],
      prompt: body.prompt,
      aspect_ratio: body.aspect_ratio || '16:9',
      duration: String(body.seconds || 5)
    };

    if (body.image) {
      requestBody.image_url = body.image;
    }

    console.log('🚀 Sending to:', VIDEO_API_URL);
    console.log('📦 Model:', requestBody.model_name, '| Duration:', requestBody.duration);

    const startTime = Date.now();
    const response = await fetch(VIDEO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseTime = Date.now() - startTime;
    console.log('⏱ Response time:', responseTime, 'ms');
    console.log('📊 Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      return NextResponse.json(
        { 
          error: { 
            code: `api_error_${response.status}`,
            message: errorData.message || errorData.error || `HTTP ${response.status}`,
            status: response.status,
            details: errorData
          } 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Success:', data);

    return NextResponse.json({
      id: data.task_id || data.id || data.video_id || `task_${Date.now()}`,
      object: 'video.generation',
      created: Math.floor(Date.now() / 1000),
      model: requestBody.model_name,
      status: data.status || 'pending',
      video_url: data.video_url || data.url || null,
      generation_mode: body.image ? 'image2video' : 'text2video',
      metadata: {
        prompt: requestBody.prompt,
        duration: requestBody.duration,
        aspect_ratio: requestBody.aspect_ratio,
        has_image: !!body.image,
        response_time_ms: responseTime,
        raw_response: data
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Server Error:', error);
    return NextResponse.json(
      { error: { code: 'internal_error', message: error.message } },
      { status: 500 }
    );
  }
}