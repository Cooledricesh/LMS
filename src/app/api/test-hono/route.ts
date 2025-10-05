import { NextRequest, NextResponse } from 'next/server';
import { createHonoApp } from '@/backend/hono/app';

export async function GET(request: NextRequest) {
  try {
    console.log('Test Hono API called');

    // Hono 앱 생성 테스트
    const app = createHonoApp();
    console.log('Hono app created:', !!app);

    return NextResponse.json({
      success: true,
      message: 'Hono test endpoint working',
      honoApp: !!app,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test Hono error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}