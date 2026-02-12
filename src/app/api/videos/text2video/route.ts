import { NextRequest, NextResponse } from 'next/server';

const APPMEDO_API_URL = 'https://api-integrations.appmedo.com/app-7r29gu4xs001/api-6LeB8Qe4rWGY/v1/videos/text2video';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.APPMEDO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: 'missing_api_key', message: 'APPMEDO_API_KEY not configured' } },
        { status: 500 }
      );
    }

    const requestBody: any = {
      prompt: body.prompt,
      model: body.model || 'kling-1.6',
      seconds: body.seconds || 5,
      aspect_ratio: body.aspect_ratio || '16:9'
    };

    // 如果有圖片，添加到請求
    if (body.image) {
      requestBody.image = body.image;
      requestBody.generation_mode = body.generation_mode || 'image2video';
    }

    const startTime = Date.now();
    const response = await fetch(APPMEDO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    const openaiFormat = {
      id: data.task_id || data.id || `task_${Date.now()}`,
      object: 'video.generation',
      created: Math.floor(Date.now() / 1000),
      model: requestBody.model,
      status: data.status || 'pending',
      video_url: data.video_url || null,
      generation_mode: requestBody.generation_mode || 'text2video',
      metadata: {
        prompt: requestBody.prompt,
        duration: requestBody.seconds,
        aspect_ratio: requestBody.aspect_ratio,
        has_image: !!body.image,
        response_time_ms: responseTime,
        raw_response: data
      }
    };

    return NextResponse.json(openaiFormat, { 
      status: response.ok ? 200 : response.status 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { code: 'internal_error', message: error.message } },
      { status: 500 }
    );
  }
}