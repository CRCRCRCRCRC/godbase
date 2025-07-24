import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface AudioFile {
  id: string
  title: string
  description: string
  filename: string
  uploadDate: string
  thumbnail?: string
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    const audioDir = path.join(process.cwd(), 'public', 'uploads', 'audio')
    const thumbnailDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')
    const metadataFile = path.join(audioDir, 'metadata.json')

    // 讀取 metadata
    let audioFiles: AudioFile[] = []
    try {
      const metadataContent = await fs.readFile(metadataFile, 'utf-8')
      audioFiles = JSON.parse(metadataContent)
    } catch {
      return NextResponse.json({ error: '找不到音檔' }, { status: 404 })
    }

    // 找到要刪除的音檔
    const audioIndex = audioFiles.findIndex(file => file.id === filename)
    if (audioIndex === -1) {
      return NextResponse.json({ error: '找不到音檔' }, { status: 404 })
    }

    const audioFile = audioFiles[audioIndex]
    const filePath = path.join(audioDir, audioFile.filename)

    // 刪除音檔檔案
    try {
      await fs.unlink(filePath)
    } catch {
      // 檔案可能已經不存在，繼續執行
    }

    // 刪除縮圖檔案
    if (audioFile.thumbnail) {
      const thumbnailPath = path.join(thumbnailDir, audioFile.thumbnail)
      try {
        await fs.unlink(thumbnailPath)
      } catch {
        // 縮圖可能已經不存在，繼續執行
      }
    }

    // 從 metadata 中移除
    audioFiles.splice(audioIndex, 1)
    await fs.writeFile(metadataFile, JSON.stringify(audioFiles, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting audio file:', error)
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    const audioDir = path.join(process.cwd(), 'public', 'uploads', 'audio')
    const filePath = path.join(audioDir, filename)

    // 檢查檔案是否存在
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: '檔案不存在' }, { status: 404 })
    }

    // 讀取檔案
    const fileBuffer = await fs.readFile(filePath)
    
    // 設定適當的 Content-Type
    const ext = path.extname(filename).toLowerCase()
    let contentType = 'audio/mpeg'
    
    switch (ext) {
      case '.mp3':
        contentType = 'audio/mpeg'
        break
      case '.wav':
        contentType = 'audio/wav'
        break
      case '.m4a':
        contentType = 'audio/mp4'
        break
      default:
        contentType = 'audio/mpeg'
    }

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (error) {
    console.error('Error serving audio file:', error)
    return NextResponse.json({ error: '無法提供檔案' }, { status: 500 })
  }
} 