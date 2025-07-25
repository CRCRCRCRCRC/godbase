import { handleUpload, type HandleUploadBody, type PutBlobResult } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // This is where you would add your own authentication and authorization logic.
        // For now, we'll allow all uploads.
        
        // The pathname comes from the client-side upload() call.
        // We can use this to set allowed file types.
        let allowedContentTypes: string[] = [];
        if (pathname.startsWith('audio/')) {
            allowedContentTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/mp3'];
        } else if (pathname.startsWith('thumbnails/')) {
            allowedContentTypes = ['image/jpeg', 'image/png', 'image/webp'];
        }

        return {
          allowedContentTypes,
          addRandomSuffix: false, // We now generate a unique path on the client
          tokenPayload: JSON.stringify({
            // Here you can add any metadata you want to be available
            // in the onUploadCompleted callback.
            // For example, you could pass a user ID.
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }: { blob: PutBlobResult, tokenPayload: string | null }) => {
        // This callback is called after the file has been uploaded to Vercel Blob.
        // You can use this to update your database with the blob's URL.
        
        // Note: The client-side `upload` function in this project is not set up
        // to pass title/description, so we can't access them here.
        // This would require a more complex setup where metadata is sent
        // either in the `tokenPayload` or in a separate API call.
        
        // For now, we'll log the completion. The database insertion is handled
        // in a separate `/api/audio/create` call from the client.
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