import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Test simple API called');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));

    return NextResponse.json({
      success: true,
      message: 'Simple test endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test simple error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}