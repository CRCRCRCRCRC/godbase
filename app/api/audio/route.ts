import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface AudioFile {
  id: string
  title: string
  description: string
  filename: string
  uploadDate: string
}

export async function GET() {
  try {
    const audioDir = path.join(process.cwd(), 'public', 'uploads', 'audio')
    const metadataFile = path.join(audioDir, 'metadata.json')

    // 確保目錄存在
    try {
      await fs.access(audioDir)
    } catch {
      await fs.mkdir(audioDir, { recursive: true })
    }

    // 讀取 metadata
    let audioFiles: AudioFile[] = []
    try {
      const metadataContent = await fs.readFile(metadataFile, 'utf-8')
      audioFiles = JSON.parse(metadataContent)
    } catch {
      // 如果檔案不存在，創建空的 metadata
      await fs.writeFile(metadataFile, '[]', 'utf-8')
    }

    // 按上傳時間排序（最新的在前）
    audioFiles.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())

    return NextResponse.json(audioFiles)
  } catch (error) {
    console.error('Error fetching audio files:', error)
    return NextResponse.json({ error: 'Failed to fetch audio files' }, { status: 500 })
  }
} 