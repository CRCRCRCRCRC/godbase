import { type PutBlobResult } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        let allowedContentTypes: string[] = [];
        if (pathname.startsWith('audio/')) {
            allowedContentTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/mp3'];
        } else if (pathname.startsWith('thumbnails/')) {
            allowedContentTypes = ['image/jpeg', 'image/png', 'image/webp'];
        }

        return {
          allowedContentTypes,
          addRandomSuffix: false, 
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }: { blob: PutBlobResult, tokenPayload: string | null }) => {
        console.log('blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
} 