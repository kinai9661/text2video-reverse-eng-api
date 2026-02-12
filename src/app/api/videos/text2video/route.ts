import { NextRequest, NextResponse } from 'next/server';

const VIDEO_API_URL = 'https://app-9kpm005bczy9-vitesandbox.sandbox.medo.dev/functions/v1/video-api/v1/videos/text2video';

const BASIC_MODEL_MAP: Record<string, string> = {
  'kling-2.6': 'kling-v1', 'kling-2.5': 'kling-v1', 'kling-1.6': 'kling-v1', 'kling-1.5': 'kling-v1',
  'runway-gen4.5': 'runway-gen3', 'runway-gen4': 'runway-gen3', 'runway-gen3': 'runway-gen3',
  'veo-3.1': 'veo-2', 'veo-3': 'veo-2', 'sora-2': 'sora-v1', 'default': 'kling-v1'
};

const FULL_MODEL_MAP: Record<string, string> = {
  'kling-2.6': 'kling-v2.6-master', 'kling-1.6': 'kling-v2-master',
  'runway-gen4.5': 'runway-gen4.5-turbo', 'veo-3.1': 'veo-3.1-master',
  'default': 'kling-v2.6-master'
};

// 🔧 切換此標誌: true=簡化模型, false=完整模型
const USE_BASIC_MODELS = false;
const modelMap = USE_BASIC_MODELS ? BASIC_MODEL_MAP : FULL_MODEL_MAP;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = process.env.SUPABASE_TOKEN;

    if (!token || token === 'your-supabase-token-here') {
      return NextResponse.json({ error: { code: 'missing_token', message: 'SUPABASE_TOKEN not configured' } }, { status: 500 });
    }

    const requestBody: any = {
      model_name: modelMap[body.model] || modelMap['default'],
      prompt: body.prompt,
      aspect_ratio: body.aspect_ratio || '16:9',
      duration: String(body.seconds || 5)
    };
    if (body.image) requestBody.image_url = body.image;

    console.log('🚀', VIDEO_API_URL, '| Model:', requestBody.model_name, '| Map:', USE_BASIC_MODELS ? 'BASIC' : 'FULL');

    const response = await fetch(VIDEO_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌', response.status, errorText);
      if (response.status === 404) {
        console.error('💡 Try: USE_BASIC_MODELS = true');
      }
      return NextResponse.json({
        error: {
          code: `api_error_${response.status}`,
          message: `HTTP ${response.status}`,
          status: response.status,
          troubleshooting: response.status === 404 ? { suggestion: 'Set USE_BASIC_MODELS = true' } : null
        }
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅', data);

    return NextResponse.json({
      id: data.task_id || data.id || `task_${Date.now()}`,
      status: data.status || 'pending',
      video_url: data.video_url || null,
      metadata: data
    });

  } catch (error: any) {
    console.error('❌', error.message);
    return NextResponse.json({ error: { code: 'internal_error', message: error.message } }, { status: 500 });
  }
}