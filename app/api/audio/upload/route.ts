import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { sql } from '@vercel/postgres';

// This is the new endpoint for the client to get a temporary upload URL
export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
  }

  // The `put` function returns a temporary URL for the client to upload the file to.
  // The client-side `@vercel/blob` library handles the actual upload.
  const blob = await put(filename, "dummy_body", { // Body is ignored here
    access: 'public',
  });

  return NextResponse.json(blob);
}
// Note: This endpoint is now just for handling the signed URL generation.
// The old logic for inserting into the DB is moved to /api/audio/create 