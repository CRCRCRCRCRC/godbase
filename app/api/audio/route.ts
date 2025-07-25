import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const revalidate = 0; // Don't cache this route

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT 
        id, 
        title, 
        description, 
        audio_url AS "filename", -- Alias to match the old structure
        thumbnail_url AS "thumbnail", 
        upload_date AS "uploadDate"
      FROM audios 
      ORDER BY upload_date DESC;
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching audio files:', error);
    return NextResponse.json({ error: 'Failed to fetch audio files' }, { status: 500 });
  }
} 