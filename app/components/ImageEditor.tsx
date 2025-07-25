'use client';

import React, { useState, useRef } from 'react';
import { useDebounceEffect } from './useDebounceEffect';
import { canvasPreview } from './canvasPreview';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop';

import 'react-image-crop/dist/ReactCrop.css';
import { RotateCcw, RotateCw, RefreshCw } from 'lucide-react';

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
  );
}

interface ImageEditorProps {
  src: string;
  onSave: (blob: Blob) => void;
  onCancel: () => void;
}

export default function ImageEditor({
  src,
  onSave,
  onCancel,
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const aspect = 1; // Always 1:1

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerAspectCrop(width, height, aspect);
    setCrop(initialCrop);
    setCompletedCrop(initialCrop as unknown as PixelCrop); 
  }

  const handleSave = async () => {
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    if (!image || !canvas || !completedCrop) {
      alert("無法處理圖片，請再試一次。");
      return;
    }

    if (!completedCrop?.width || !completedCrop?.height) {
        alert("請選取一個有效的裁切區域。");
        return;
    }
    
    canvas.toBlob(
      (blob) => {
        if (!blob) {
            alert("無法建立圖片，請再試一次。");
            return;
        }
        onSave(blob);
      },
      'image/png',
      1, // quality
    );
  };

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
        );
      }
    },
    100,
    [completedCrop, scale, rotate],
  );

  const handleReset = () => {
    setScale(1);
    setRotate(0);
    if (imgRef.current) {
        const { width, height } = imgRef.current;
        const resetCrop = centerAspectCrop(width, height, aspect);
        setCrop(resetCrop);
        setCompletedCrop(resetCrop as unknown as PixelCrop);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 text-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">編輯縮圖 (1:1)</h2>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-sm font-medium">
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium"
            >
              儲存
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
          {/* Controls */}
          <div className="w-full md:w-1/4 bg-gray-900 p-4 rounded-lg flex flex-col space-y-6 overflow-y-auto">

            {/* Rotation Controls */}
            <div>
              <span className="text-sm font-medium text-gray-400">旋轉</span>
              <div className="flex items-center space-x-2 mt-2">
                <button type="button" onClick={() => setRotate(rotate - 90)} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 flex-1 justify-center flex">
                  <RotateCcw size={16} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={rotate}
                  onChange={(e) => setRotate(parseInt(e.target.value))}
                  className="w-full"
                />
                <button type="button" onClick={() => setRotate(rotate + 90)} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600">
                   <RotateCw size={16} />
                </button>
              </div>
               <div className="flex items-center space-x-2 mt-2">
                 <button type="button" onClick={() => setRotate(rotate - 1)} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 flex-1 justify-center flex">-</button>
                 <span className="text-xs text-center w-8">{rotate}°</span>
                 <button type="button" onClick={() => setRotate(rotate + 1)} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600">+</button>
               </div>
            </div>

            {/* Zoom Controls */}
            <div>
              <span className="text-sm font-medium text-gray-400">縮放</span>
              <div className="flex items-center space-x-2 mt-2">
                <button type="button" onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 flex-1 justify-center flex">-</button>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.01"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
                <button type="button" onClick={() => setScale(s => s + 0.1)} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600">+</button>
              </div>
            </div>

            {/* Reset */}
            <div>
              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                <span>全部重設</span>
              </button>
            </div>
          </div>
          
          {/* Image Crop Area */}
          <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-w-full max-h-full"
              minWidth={100}
              minHeight={100}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={src}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
                className="max-h-[70vh]"
              />
            </ReactCrop>
            {/* Hidden canvas for preview */}
            <canvas
                ref={previewCanvasRef}
                className="hidden"
             />
          </div>
        </div>
      </div>
    </div>
  );
} 