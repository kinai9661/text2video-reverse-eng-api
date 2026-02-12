import { NextRequest, NextResponse } from 'next/server';

const TASK_BASE_URL = 'https://app-9kpm005bczy9-vitesandbox.sandbox.medo.dev/functions/v1/video-api/v1/videos/tasks';

export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const token = process.env.SUPABASE_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'Token not configured' }, { status: 500 });
    }

    const response = await fetch(`${TASK_BASE_URL}/${params.taskId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({
        id: params.taskId,
        status: response.status === 404 ? 'not_found' : 'error'
      });
    }

    const data = await response.json();
    return NextResponse.json({
      id: params.taskId,
      status: data.status,
      video_url: data.video_url || data.url,
      progress: data.progress || 0
    });

  } catch (error: any) {
    return NextResponse.json({
      id: params.taskId,
      status: 'error',
      error: error.message
    });
  }
}