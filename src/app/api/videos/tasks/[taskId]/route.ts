import { NextRequest, NextResponse } from 'next/server';

const TASK_STATUS_URL = 'https://app-9kpm005bczy9-vitesandbox.sandbox.medo.dev/functions/v1/video-api/v1/videos/tasks';

export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const token = process.env.SUPABASE_TOKEN;
    const taskId = params.taskId;

    console.log('🔍 Checking task:', taskId);

    if (!token || token === 'your-supabase-token-here') {
      return NextResponse.json(
        { error: { code: 'missing_token', message: 'Token not configured' } },
        { status: 500 }
      );
    }

    const statusUrl = `${TASK_STATUS_URL}/${taskId}`;
    console.log('🌐 URL:', statusUrl);

    const response = await fetch(statusUrl, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', response.status, errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      if (response.status === 404) {
        return NextResponse.json(
          {
            id: taskId,
            status: 'not_found',
            error: 'Task not found',
            http_status: 404
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          id: taskId,
          status: 'error',
          error: errorData.message || `HTTP ${response.status}`,
          http_status: response.status
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('✅ Data:', data);

    return NextResponse.json({
      id: taskId,
      status: data.status || 'unknown',
      video_url: data.video_url || data.url || data.result?.video_url || null,
      progress: data.progress || data.percentage || 0,
      created_at: data.created_at,
      completed_at: data.completed_at,
      metadata: data
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { 
        id: params.taskId,
        status: 'error',
        error: error.message
      },
      { status: 200 }
    );
  }
}