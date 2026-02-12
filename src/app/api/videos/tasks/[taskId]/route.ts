import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { taskId: string } }) {
  const token = process.env.SUPABASE_TOKEN;
  const url = `https://app-9kpm005bczy9-vitesandbox.sandbox.medo.dev/functions/v1/video-api/v1/videos/tasks/${params.taskId}`;

  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) return NextResponse.json({ id: params.taskId, status: 'error' });

  const data = await response.json();
  return NextResponse.json({ id: params.taskId, status: data.status, video_url: data.video_url });
}