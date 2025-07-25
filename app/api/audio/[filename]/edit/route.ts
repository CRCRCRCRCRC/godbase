import { put, del } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { filename: string /* This is now the audio ID */ } }
) {
  const audioId = params.filename;
  
  try {
    const { title, description, newThumbnailUrl } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    }
    
    // If a new thumbnail was uploaded, we need to delete the old one.
    if (newThumbnailUrl) {
      const { rows } = await sql`
        SELECT thumbnail_url FROM audios WHERE id = ${audioId};
      `;
      const oldThumbnailUrl = rows[0]?.thumbnail_url;
      if (oldThumbnailUrl) {
        await del(oldThumbnailUrl);
      }
    }
    
    // Update the database record
    if (newThumbnailUrl) {
      await sql`
        UPDATE audios 
        SET title = ${title}, description = ${description}, thumbnail_url = ${newThumbnailUrl}
        WHERE id = ${audioId};
      `;
    } else {
      await sql`
        UPDATE audios 
        SET title = ${title}, description = ${description}
        WHERE id = ${audioId};
      `;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error editing audio:', error);
    return NextResponse.json({ error: 'Failed to edit audio' }, { status: 500 });
  }
} 