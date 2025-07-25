import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, description, audioUrl, thumbnailUrl } = await request.json();

    if (!title || !audioUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sql`
      INSERT INTO audios (title, description, audio_url, thumbnail_url)
      VALUES (${title}, ${description}, ${audioUrl}, ${thumbnailUrl});
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating audio record:', error);
    return NextResponse.json({ error: 'Failed to create audio record' }, { status: 500 });
  }
} 