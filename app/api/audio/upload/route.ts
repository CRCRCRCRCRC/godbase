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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const thumbnailFile = formData.get('thumbnail') as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!audioFile || !title) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    // 檢查檔案類型
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ error: '不支援的音檔格式' }, { status: 400 })
    }

    // 檢查縮圖類型
    if (thumbnailFile) {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedImageTypes.includes(thumbnailFile.type)) {
        return NextResponse.json({ error: '不支援的縮圖格式' }, { status: 400 })
      }
    }

    // 檢查標題長度
    if (title.length > 20) {
      return NextResponse.json({ error: '標題不能超過20字' }, { status: 400 })
    }

    const audioDir = path.join(process.cwd(), 'public', 'uploads', 'audio')
    const thumbnailDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')
    const metadataFile = path.join(audioDir, 'metadata.json')

    // 確保目錄存在
    try {
      await fs.access(audioDir)
    } catch {
      await fs.mkdir(audioDir, { recursive: true })
    }

    try {
      await fs.access(thumbnailDir)
    } catch {
      await fs.mkdir(thumbnailDir, { recursive: true })
    }

    // 生成唯一檔名
    const audioExtension = path.extname(audioFile.name)
    const uniqueAudioFilename = `${randomUUID()}${audioExtension}`
    const audioFilePath = path.join(audioDir, uniqueAudioFilename)

    let thumbnailFilename: string | undefined

    // 處理縮圖上傳
    if (thumbnailFile) {
      const thumbnailExtension = path.extname(thumbnailFile.name)
      thumbnailFilename = `${randomUUID()}${thumbnailExtension}`
      const thumbnailFilePath = path.join(thumbnailDir, thumbnailFilename)

      const thumbnailBytes = await thumbnailFile.arrayBuffer()
      const thumbnailBuffer = Buffer.from(thumbnailBytes)
      await fs.writeFile(thumbnailFilePath, thumbnailBuffer)
    }

    // 儲存音檔
    const audioBytes = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(audioBytes)
    await fs.writeFile(audioFilePath, audioBuffer)

    // 讀取現有 metadata
    let audioFiles: AudioFile[] = []
    try {
      const metadataContent = await fs.readFile(metadataFile, 'utf-8')
      audioFiles = JSON.parse(metadataContent)
    } catch {
      // 如果檔案不存在，使用空陣列
    }

    // 新增音檔資訊
    const newAudioFile: AudioFile = {
      id: randomUUID(),
      title: title.trim(),
      description: description?.trim() || '',
      filename: uniqueAudioFilename,
      thumbnail: thumbnailFilename,
      uploadDate: new Date().toISOString(),
    }

    audioFiles.push(newAudioFile)

    // 儲存更新的 metadata
    await fs.writeFile(metadataFile, JSON.stringify(audioFiles, null, 2), 'utf-8')

    return NextResponse.json(newAudioFile, { status: 201 })
  } catch (error) {
    console.error('Error uploading audio file:', error)
    return NextResponse.json({ error: '上傳失敗' }, { status: 500 })
  }
} 