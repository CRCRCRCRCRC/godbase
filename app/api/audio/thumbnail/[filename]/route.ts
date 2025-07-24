import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    const thumbnailDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')
    const filePath = path.join(thumbnailDir, filename)

    // 檢查檔案是否存在
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: '縮圖不存在' }, { status: 404 })
    }

    // 讀取檔案
    const fileBuffer = await fs.readFile(filePath)
    
    // 設定適當的 Content-Type
    const ext = path.extname(filename).toLowerCase()
    let contentType = 'image/jpeg'
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.webp':
        contentType = 'image/webp'
        break
      default:
        contentType = 'image/jpeg'
    }

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving thumbnail:', error)
    return NextResponse.json({ error: '無法提供縮圖' }, { status: 500 })
  }
} 