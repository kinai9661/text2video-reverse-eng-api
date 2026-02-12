import { NextRequest, NextResponse } from 'next/server';

const VIDEO_API_URL = 'https://app-9kpm005bczy9-vitesandbox.sandbox.medo.dev/functions/v1/video-api/v1/videos/text2video';

// 模型映射方案
const SIMPLE_MODELS: Record<string, string> = {
  'kling-2.6': 'kling',
  'kling-1.6': 'kling',
  'runway-gen4.5': 'runway',
  'runway-gen3': 'runway',
  'veo-3.1': 'veo',
  'sora-2': 'sora',
  'default': 'kling'
};

const VERSIONED_MODELS: Record<string, string> = {
  'kling-2.6': 'kling-v1',
  'runway-gen4.5': 'gen4',
  'veo-3.1': 'veo3.1',
  'default': 'kling-v1'
};

const FULL_MODELS: Record<string, string> = {
  'kling-2.6': 'kling-v2.6-master',
  'runway-gen4.5': 'runway-gen4.5-turbo',
  'veo-3.1': 'veo-3.1-master',
  'default': 'kling-v2.6-master'
};

// 🔧 選擇方案: 1, 2, 或 3
const ACTIVE_SCHEME: number = 1;

// 根據方案選擇映射表
function getModelMap() {
  if (ACTIVE_SCHEME === 1) return SIMPLE_MODELS;
  if (ACTIVE_SCHEME === 2) return VERSIONED_MODELS;
  return FULL_MODELS;
}

const modelMap = getModelMap();
const SCHEME_NAME = ACTIVE_SCHEME === 1 ? 'SIMPLE' : ACTIVE_SCHEME === 2 ? 'VERSIONED' : 'FULL';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = process.env.SUPABASE_TOKEN;

    if (!token || token === 'your-supabase-token-here') {
      return NextResponse.json(
        { error: { code: 'missing_token', message: 'Token not configured' } },
        { status: 500 }
      );
    }

    const requestBody: any = {
      model_name: modelMap[body.model] || modelMap['default'],
      prompt: body.prompt,
      aspect_ratio: body.aspect_ratio || '16:9',
      duration: String(body.seconds || 5)
    };

    if (body.image) requestBody.image_url = body.image;

    console.log('🚀', VIDEO_API_URL, '|', SCHEME_NAME, '|', body.model, '→', requestBody.model_name);

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
    console.log('⏱', responseTime + 'ms', '|', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌', response.status, errorText);

      if (response.status === 404) {
        console.error('💡 Try: ACTIVE_SCHEME = ' + (ACTIVE_SCHEME === 3 ? 1 : ACTIVE_SCHEME + 1) + ' or npm run detect');
      }

      return NextResponse.json({
        error: {
          code: `api_error_${response.status}`,
          message: `HTTP ${response.status}`,
          status: response.status,
          current_scheme: SCHEME_NAME,
          model_tried: requestBody.model_name,
          suggestion: response.status === 404 ? `Change ACTIVE_SCHEME to ${ACTIVE_SCHEME === 3 ? 1 : ACTIVE_SCHEME + 1} or run: npm run detect` : null
        }
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅', data.task_id || data.id);

    return NextResponse.json({
      id: data.task_id || data.id || `task_${Date.now()}`,
      status: data.status || 'pending',
      video_url: data.video_url || null,
      model: requestBody.model_name,
      scheme: SCHEME_NAME,
      metadata: data
    });

  } catch (error: any) {
    console.error('❌', error.message);
    return NextResponse.json(
      { error: { code: 'internal_error', message: error.message } },
      { status: 500 }
    );
  }
}