import { NextRequest, NextResponse } from 'next/server';

// This endpoint is no longer needed as files are served directly from Vercel Blob URLs.
// You can remove this or keep it for other purposes if needed.
// For now, let's return a 404 to avoid confusion.
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
    return NextResponse.json({ error: 'This endpoint is no longer used. Files are served directly from Vercel Blob.' }, { status: 404 });
} 