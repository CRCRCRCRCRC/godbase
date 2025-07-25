import { del } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const audioId = params.filename;

  try {
    // First, get the URLs from the database
    const { rows } = await sql`
      SELECT audio_url, thumbnail_url FROM audios WHERE id = ${audioId};
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 });
    }

    const { audio_url, thumbnail_url } = rows[0];

    // Delete files from Vercel Blob
    if (audio_url) {
      await del(audio_url);
    }
    if (thumbnail_url) {
      await del(thumbnail_url);
    }

    // Delete the record from the database
    await sql`DELETE FROM audios WHERE id = ${audioId};`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting audio:', error);
    return NextResponse.json({ error: 'Failed to delete audio' }, { status: 500 });
  }
}


// The GET method is no longer needed here as files are served directly from Vercel Blob URLs.
// You can remove this or keep it for other purposes if needed.
// For now, let's return a 404 to avoid confusion.
export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  return NextResponse.json({ error: 'This endpoint is no longer used. Files are served directly from Vercel Blob.' }, { status: 404 });
} 