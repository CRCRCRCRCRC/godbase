'use client'

import { useState, useEffect } from 'react'
import AudioCard from './components/AudioCard'
import AudioPlayer from './components/AudioPlayer'
import Image from 'next/image'
import { X } from 'lucide-react'

interface AudioFile {
  id: string
  title: string
  description: string
  filename: string; // This is now audio_url
  uploadDate: string;
  thumbnail?: string; // This is now thumbnail_url
}

export default function Home() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [currentAudio, setCurrentAudio] = useState<AudioFile | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [selectedAudioForInfo, setSelectedAudioForInfo] = useState<AudioFile | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchAudioFiles()
  }, [])

  const fetchAudioFiles = async () => {
    try {
      const response = await fetch('/api/audio')
      if (response.ok) {
        const files = await response.json()
        setAudioFiles(files)
      }
    } catch (error) {
      console.error('Failed to fetch audio files:', error)
    } finally {
      setTimeout(() => setIsLoading(false), 800)
    }
  }

  const handlePlayAudio = (audio: AudioFile) => {
    if (currentAudio?.id === audio.id && isPlaying) {
      setIsPlaying(false)
    } else {
      setCurrentAudio(audio)
      setIsPlaying(true)
    }
  }

  const handlePlayerClose = () => {
    setCurrentAudio(null)
    setIsPlaying(false)
  }

  const handleShowInfo = (audio: AudioFile) => {
    setSelectedAudioForInfo(audio)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 lg:p-8">
        <div className="flex justify-start">
          <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
            <Image
              src="/images/icon.png"
              alt="網站圖標"
              width={150}
              height={45}
              className="object-contain transition-all duration-300 group-hover:brightness-110"
              priority
            />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="relative z-10 flex">
        <main className="w-full px-4 sm:px-6 lg:px-8 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <div className="mt-6">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          ) : audioFiles.length === 0 ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-32 h-32 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="mt-6 opacity-60">
                  <p className="text-gray-500 text-sm font-medium">等待精彩內容...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`mx-auto transition-all duration-300 ${selectedAudioForInfo ? 'max-w-3xl mr-96' : 'max-w-6xl'}`}>
              <div className="space-y-6">
                {audioFiles.map((audio, index) => (
                  <div
                    key={audio.id}
                    className="animate-slide-up opacity-0"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <AudioCard
                      audio={audio}
                      isPlaying={currentAudio?.id === audio.id && isPlaying}
                      onPlay={() => handlePlayAudio(audio)}
                      onShowInfo={() => handleShowInfo(audio)}
                      isHorizontal={true}
                    />
                  </div>
                ))}
                
                <div className="flex justify-center mt-12">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-lg border border-white/20">
                    <p className="text-sm text-gray-600 font-medium">
                      共 <span className="text-blue-600 font-bold">{audioFiles.length}</span> 個音檔
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {selectedAudioForInfo && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-xl border-l border-gray-200 shadow-2xl z-30 animate-slide-in-right">
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">音檔詳情</h3>
                <button
                  onClick={() => setSelectedAudioForInfo(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedAudioForInfo.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    上傳日期：{formatDate(selectedAudioForInfo.uploadDate)}
                  </p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">說明內容</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedAudioForInfo.description || '沒有提供詳細說明。'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 break-all">
                    音檔URL：{selectedAudioForInfo.filename}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {currentAudio && (
        <AudioPlayer
          audio={currentAudio}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onClose={handlePlayerClose}
        />
      )}
    </div>
  )
} 