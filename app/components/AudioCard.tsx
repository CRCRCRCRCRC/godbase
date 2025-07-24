'use client'

import { Play, Pause, Info } from 'lucide-react'
import Image from 'next/image'

interface AudioFile {
  id: string
  title: string
  description: string
  filename: string
  uploadDate: string
  thumbnail?: string
}

interface AudioCardProps {
  audio: AudioFile
  isPlaying: boolean
  onPlay: () => void
  onShowInfo: () => void
  isHorizontal?: boolean
}

export default function AudioCard({ audio, isPlaying, onPlay, onShowInfo, isHorizontal = false }: AudioCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isHorizontal) {
    return (
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center p-4">
          {/* Left: Thumbnail or Music Icon */}
          <div className="flex-shrink-0 mr-6">
            {audio.thumbnail ? (
              <div className="relative w-16 h-12 rounded-xl overflow-hidden">
                <Image
                  src={`/api/audio/thumbnail/${audio.thumbnail}`}
                  alt={audio.title}
                  fill
                  className="object-cover"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-white animate-pulse"></div>
                      <div className="w-1 h-4 bg-white animate-pulse delay-75"></div>
                      <div className="w-1 h-4 bg-white animate-pulse delay-150"></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-16 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                {isPlaying ? (
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-white animate-pulse"></div>
                    <div className="w-1 h-4 bg-white animate-pulse delay-75"></div>
                    <div className="w-1 h-4 bg-white animate-pulse delay-150"></div>
                  </div>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                  </svg>
                )}
              </div>
            )}
          </div>

          {/* Middle: Audio Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
              {audio.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-1">
              <span>{formatDate(audio.uploadDate)}</span>
            </div>
            <p className="text-gray-600 text-sm truncate">
              {audio.description || '沒有說明文字'}
            </p>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-4 ml-6">
            {/* Play Button */}
            <button
              onClick={onPlay}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="font-medium text-sm">
                {isPlaying ? '暫停' : '播放'}
              </span>
            </button>

            {/* More Info Button */}
            <button
              onClick={onShowInfo}
              className="flex items-center space-x-2 bg-white/80 hover:bg-white text-gray-700 hover:text-blue-600 px-4 py-2.5 rounded-xl transition-all duration-200 border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl"
            >
              <Info className="w-4 h-4" />
              <span className="font-medium text-sm">了解更多</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 原本的垂直卡片布局（備用）
  return (
    <div className="audio-card group relative">
      {/* Card Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {audio.title}
        </h3>
        
        {/* Upload Date */}
        <p className="text-sm text-gray-500 mb-4">
          {formatDate(audio.uploadDate)}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {/* Play Button */}
          <button
            onClick={onPlay}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isPlaying ? '暫停' : '播放'}
            </span>
          </button>

          {/* More Info Button */}
          <button
            onClick={onShowInfo}
            className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span className="text-sm">了解更多</span>
          </button>
        </div>
      </div>

      {/* Playing Indicator */}
      {isPlaying && (
        <div className="absolute top-3 right-3 flex space-x-1">
          <div className="w-1 h-4 bg-spotify-green animate-pulse"></div>
          <div className="w-1 h-4 bg-spotify-green animate-pulse delay-75"></div>
          <div className="w-1 h-4 bg-spotify-green animate-pulse delay-150"></div>
        </div>
      )}
    </div>
  )
} 