import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const apiKey = process.env.APPMEDO_API_KEY;
    const taskId = params.taskId;

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: 'missing_api_key', message: 'API key not configured' } },
        { status: 500 }
      );
    }

    // 查詢任務狀態（需根據實際 API 調整）
    const statusUrl = `https://api-integrations.appmedo.com/app-7r29gu4xs001/api-6LeB8Qe4rWGY/v1/videos/tasks/${taskId}`;

    const response = await fetch(statusUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await response.json();

    return NextResponse.json({
      id: taskId,
      status: data.status || 'unknown',
      video_url: data.video_url || data.result?.video_url || null,
      progress: data.progress || 0,
      created_at: data.created_at,
      completed_at: data.completed_at,
      metadata: data
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'fetch_failed', message: error.message } },
      { status: 500 }
    );
  }
}