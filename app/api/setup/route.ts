import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // This query creates the 'audios' table if it doesn't exist.
    // It's safe to run multiple times.
    const result = await sql`
      CREATE TABLE IF NOT EXISTS audios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        audio_url TEXT NOT NULL,
        thumbnail_url TEXT,
        upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
} 