'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Crop as CropIcon, RefreshCw, Check, X } from 'lucide-react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageEditorProps {
  file: File
  onSave: (editedFile: File) => void
  onCancel: () => void
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageEditor({ file, onSave, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(16 / 9)
  const [imageSrc, setImageSrc] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImageSrc(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [file])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }, [aspect])

  const handleScaleChange = (delta: number) => {
    const newScale = Math.max(0.1, Math.min(3, scale + delta))
    setScale(newScale)
  }

  const handleRotate = (degrees: number) => {
    setRotate((prev) => (prev + degrees) % 360)
  }

  const handleReset = () => {
    setScale(1)
    setRotate(0)
    if (imgRef.current && aspect) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  const generateCroppedImage = useCallback(async () => {
    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = completedCrop

    if (!image || !canvas || !crop) {
      return null
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const offscreen = new OffscreenCanvas(
      crop.width * scaleX,
      crop.height * scaleY,
    )
    const ctx = offscreen.getContext('2d')
    if (!ctx) {
      return null
    }

    // 設置畫布尺寸
    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY
    const canvasCtx = canvas.getContext('2d')
    if (!canvasCtx) {
      return null
    }

    // 清除畫布
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height)

    // 應用變換
    canvasCtx.save()
    canvasCtx.translate(canvas.width / 2, canvas.height / 2)
    canvasCtx.rotate((rotate * Math.PI) / 180)
    canvasCtx.scale(scale, scale)
    canvasCtx.translate(-canvas.width / 2, -canvas.height / 2)

    // 繪製裁切的圖片
    canvasCtx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    )

    canvasCtx.restore()

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          return
        }
        const editedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        })
        resolve(editedFile)
      }, file.type, 0.9)
    })
  }, [completedCrop, scale, rotate, file])

  const handleSave = async () => {
    setIsProcessing(true)
    try {
      const editedFile = await generateCroppedImage()
      if (editedFile) {
        onSave(editedFile)
      }
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">編輯縮圖</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Image Area */}
          <div className="flex-1 p-6 flex items-center justify-center bg-gray-50">
            <div className="relative max-w-full max-h-full">
              {imageSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  minWidth={50}
                  minHeight={50}
                >
                  <img
                    ref={imgRef}
                    alt="編輯中的圖片"
                    src={imageSrc}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxWidth: '100%',
                      maxHeight: '60vh',
                    }}
                    onLoad={onImageLoad}
                    className="max-w-full max-h-full object-contain"
                  />
                </ReactCrop>
              )}
            </div>
          </div>

          {/* Controls Panel */}
          <div className="w-80 bg-gray-50 p-6 border-l border-gray-200 space-y-6">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                比例設定
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAspect(16 / 9)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    aspect === 16 / 9
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  16:9
                </button>
                <button
                  onClick={() => setAspect(4 / 3)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    aspect === 4 / 3
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  4:3
                </button>
                <button
                  onClick={() => setAspect(1)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    aspect === 1
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  1:1
                </button>
                <button
                  onClick={() => setAspect(undefined)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    aspect === undefined
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  自由
                </button>
              </div>
            </div>

            {/* Scale Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                縮放 ({Math.round(scale * 100)}%)
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <button
                  onClick={() => handleScaleChange(-0.1)}
                  className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => handleScaleChange(0.1)}
                  className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rotation Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                旋轉 ({rotate}°)
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <button
                  onClick={() => handleRotate(-90)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">左轉</span>
                </button>
                <button
                  onClick={() => handleRotate(90)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-sm">右轉</span>
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="359"
                value={rotate}
                onChange={(e) => setRotate(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重置</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary"
            disabled={isProcessing}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn-primary disabled:opacity-50"
            disabled={isProcessing || !completedCrop}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>處理中...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-4 h-4" />
                <span>確認編輯</span>
              </div>
            )}
          </button>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
} 