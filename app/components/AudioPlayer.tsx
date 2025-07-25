'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, X, SkipBack, SkipForward } from 'lucide-react'

interface AudioFile {
  id: string
  title: string
  description: string
  filename: string; // This is audio_url
  uploadDate: string;
  thumbnail?: string; // This is thumbnail_url
}

interface AudioPlayerProps {
  audio: AudioFile
  isPlaying: boolean
  onPlayPause: () => void
  onClose: () => void
}

export default function AudioPlayer({ audio, isPlaying, onPlayPause, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime)
    }

    const handleEnded = () => {
      setCurrentTime(0)
      onPlayPause()
    }

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata)
    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    audioElement.addEventListener('ended', handleEnded)

    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
      audioElement.removeEventListener('ended', handleEnded)
    }
  }, [audio, onPlayPause])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return

    if (isPlaying) {
      audioElement.play().catch(console.error)
    } else {
      audioElement.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audioElement = audioRef.current
    if (audioElement) {
      audioElement.volume = volume
    }
  }, [volume])

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioElement = audioRef.current
    if (!audioElement) return

    const newTime = (parseFloat(e.target.value) / 100) * duration
    audioElement.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value) / 100)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  return (
    <>
      <audio
        ref={audioRef}
        src={audio.filename} // Use the full URL directly
        preload="metadata"
      />
      
      <div className="player-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left: Song Info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-medium truncate">{audio.title}</h4>
                <p className="text-gray-400 text-sm truncate">音檔庫</p>
              </div>
            </div>

            {/* Center: Controls and Progress */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 mb-2">
                <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                  <SkipBack className="w-5 h-5 text-gray-400" />
                </button>
                
                <button
                  onClick={onPlayPause}
                  disabled={isLoading}
                  className="p-3 bg-white hover:bg-gray-100 rounded-full transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 text-black" />
                  ) : (
                    <Play className="w-5 h-5 text-black ml-0.5" />
                  )}
                </button>
                
                <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                  <SkipForward className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={handleProgressChange}
                    className="audio-progress w-full"
                  />
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Volume and Close */}
            <div className="flex items-center space-x-4 flex-1 justify-end">
              {/* Volume Control (Desktop only) */}
              <div className="hidden lg:flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-full appearance-none outline-none"
                />
              </div>

              {/* Mobile Controls */}
              <div className="flex items-center space-x-2 md:hidden">
                <button
                  onClick={onPlayPause}
                  disabled={isLoading}
                  className="p-2 bg-white hover:bg-gray-100 rounded-full transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 text-black" />
                  ) : (
                    <Play className="w-4 h-4 text-black" />
                  )}
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="md:hidden pb-2">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercentage}
                  onChange={handleProgressChange}
                  className="audio-progress w-full"
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 