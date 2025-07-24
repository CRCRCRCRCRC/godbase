import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

interface AudioFile {
  id: string
  title: string
  description: string
  filename: string
  uploadDate: string
  thumbnail?: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename: audioId } = params
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const thumbnailFile = formData.get('thumbnail') as File | null

    if (!title) {
      return NextResponse.json({ error: '標題不能為空' }, { status: 400 })
    }

    // 檢查標題長度
    if (title.length > 20) {
      return NextResponse.json({ error: '標題不能超過20字' }, { status: 400 })
    }

    // 檢查縮圖類型
    if (thumbnailFile) {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedImageTypes.includes(thumbnailFile.type)) {
        return NextResponse.json({ error: '不支援的縮圖格式' }, { status: 400 })
      }
    }

    const audioDir = path.join(process.cwd(), 'public', 'uploads', 'audio')
    const thumbnailDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')
    const metadataFile = path.join(audioDir, 'metadata.json')

    // 讀取 metadata
    let audioFiles: AudioFile[] = []
    try {
      const metadataContent = await fs.readFile(metadataFile, 'utf-8')
      audioFiles = JSON.parse(metadataContent)
    } catch {
      return NextResponse.json({ error: '找不到音檔資料' }, { status: 404 })
    }

    // 找到要編輯的音檔
    const audioIndex = audioFiles.findIndex(file => file.id === audioId)
    if (audioIndex === -1) {
      return NextResponse.json({ error: '找不到音檔' }, { status: 404 })
    }

    const audioFile = audioFiles[audioIndex]
    let newThumbnailFilename = audioFile.thumbnail

    // 處理新縮圖上傳
    if (thumbnailFile) {
      // 確保縮圖目錄存在
      try {
        await fs.access(thumbnailDir)
      } catch {
        await fs.mkdir(thumbnailDir, { recursive: true })
      }

      // 刪除舊縮圖
      if (audioFile.thumbnail) {
        const oldThumbnailPath = path.join(thumbnailDir, audioFile.thumbnail)
        try {
          await fs.unlink(oldThumbnailPath)
        } catch {
          // 舊縮圖可能已經不存在
        }
      }

      // 儲存新縮圖
      const thumbnailExtension = path.extname(thumbnailFile.name)
      newThumbnailFilename = `${randomUUID()}${thumbnailExtension}`
      const thumbnailFilePath = path.join(thumbnailDir, newThumbnailFilename)

      const thumbnailBytes = await thumbnailFile.arrayBuffer()
      const thumbnailBuffer = Buffer.from(thumbnailBytes)
      await fs.writeFile(thumbnailFilePath, thumbnailBuffer)
    }

    // 更新音檔資訊
    const updatedAudioFile: AudioFile = {
      ...audioFile,
      title: title.trim(),
      description: description?.trim() || '',
      thumbnail: newThumbnailFilename,
    }

    audioFiles[audioIndex] = updatedAudioFile

    // 儲存更新的 metadata
    await fs.writeFile(metadataFile, JSON.stringify(audioFiles, null, 2), 'utf-8')

    return NextResponse.json(updatedAudioFile)
  } catch (error) {
    console.error('Error editing audio file:', error)
    return NextResponse.json({ error: '編輯失敗' }, { status: 500 })
  }
} 