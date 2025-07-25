'use client'

import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Upload,
  X,
  Trash2,
  Music,
  Lock,
  Edit2,
  Image as ImageIcon,
} from 'lucide-react'
import Image from 'next/image'
import ImageEditor from '../components/ImageEditor'
import { upload } from '@vercel/blob/client'
import { useRouter } from 'next/navigation';

// This interface must match the database schema and the GET API response
interface AudioFile {
  id: string;
  title: string;
  description: string;
  filename: string; // This is now audio_url
  uploadDate: string;
  thumbnail?: string; // This is now thumbnail_url
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingAudio, setEditingAudio] = useState<AudioFile | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    audio: null as File | null,
    thumbnail: null as File | null,
    originalThumbnail: null as File | null,
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    thumbnail: null as File | null,
    originalThumbnail: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [currentEditingFor, setCurrentEditingFor] = useState<'upload' | 'edit' | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchAudioFiles();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'superadmin' && loginForm.password === 'superadmin') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      fetchAudioFiles();
      setError('');
    } else {
      setError('帳號或密碼錯誤');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
    setLoginForm({ username: '', password: '' });
  };

  const fetchAudioFiles = async () => {
    try {
      const response = await fetch('/api/audio');
      if (response.ok) {
        const files = await response.json();
        setAudioFiles(files);
      }
    } catch (error) {
      console.error('Failed to fetch audio files:', error);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'upload' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      if (target === 'edit') {
        setEditForm(prev => ({ ...prev, originalThumbnail: file }));
        setCurrentEditingFor('edit');
      } else {
        setUploadForm(prev => ({ ...prev, originalThumbnail: file }));
        setCurrentEditingFor('upload');
      }
      setShowImageEditor(true);
    }
  };

  const handleImageEditSave = (savedBlob: Blob) => {
    const originalFile = currentEditingFor === 'upload' ? uploadForm.originalThumbnail : editForm.originalThumbnail;
    const fileName = originalFile ? originalFile.name : 'thumbnail.png';
    const fileType = originalFile ? originalFile.type : 'image/png';
    const editedFile = new File([savedBlob], fileName, { type: fileType });

    if (currentEditingFor === 'upload') {
      setUploadForm(prev => ({ ...prev, thumbnail: editedFile }));
    } else if (currentEditingFor === 'edit') {
      setEditForm(prev => ({ ...prev, thumbnail: editedFile }));
    }
    setShowImageEditor(false);
    setCurrentEditingFor(null);
  };

  const handleImageEditCancel = () => {
    if (currentEditingFor === 'edit') {
      setEditForm({ ...editForm, originalThumbnail: null });
    } else {
      setUploadForm({ ...uploadForm, originalThumbnail: null });
    }
    setShowImageEditor(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.audio || !uploadForm.title.trim()) return;

    setIsUploading(true);
    setError('');

    try {
      let audioUrl = '';
      let thumbnailUrl = '';

      if (uploadForm.audio) {
        const audioFile = uploadForm.audio;
        const extension = audioFile.name.split('.').pop();
        const newPathname = `audio/${crypto.randomUUID()}.${extension}`;
        const newAudioBlob = await upload(newPathname, audioFile, {
          access: 'public',
          handleUploadUrl: '/api/audio/upload',
        });
        audioUrl = newAudioBlob.url;
      }

      if (uploadForm.thumbnail) {
        const thumbnailFile = uploadForm.thumbnail;
        const extension = thumbnailFile.name.split('.').pop();
        const newPathname = `thumbnails/${crypto.randomUUID()}.${extension}`;
        const newThumbnailBlob = await upload(newPathname, thumbnailFile, {
          access: 'public',
          handleUploadUrl: '/api/audio/upload',
        });
        thumbnailUrl = newThumbnailBlob.url;
      }
      
      const response = await fetch('/api/audio/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title.slice(0, 20),
          description: uploadForm.description,
          audioUrl: audioUrl,
          thumbnailUrl: thumbnailUrl || null,
        }),
      });

      if (response.ok) {
        setShowUploadModal(false);
        setUploadForm({ title: '', description: '', audio: null, thumbnail: null, originalThumbnail: null });
        fetchAudioFiles();
      } else {
        const errorData = await response.json();
        setError(errorData.error || '上傳失敗');
      }
    } catch (error) {
      console.error('Upload process failed:', error);
      setError('上傳過程中發生錯誤');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAudio || !editForm.title.trim()) return;

    setIsEditing(true);
    setError('');

    try {
      let newThumbnailUrl: string | null = null;
      
      // If a new thumbnail is selected, upload it
      if (editForm.thumbnail && editForm.thumbnail.name !== 'from_server') {
        try {
          const thumbnailFile = editForm.thumbnail;
          const extension = thumbnailFile.name.split('.').pop();
          const newPathname = `thumbnails/${crypto.randomUUID()}.${extension}`;
          const newThumbnailBlob = await upload(newPathname, thumbnailFile, {
            access: 'public',
            handleUploadUrl: '/api/audio/upload',
          });
          newThumbnailUrl = newThumbnailBlob.url;
        } catch (uploadError) {
          console.error('Thumbnail upload failed:', uploadError);
          setError('縮圖上傳失敗');
          return;
        }
      }

      const response = await fetch(`/api/audio/${editingAudio.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title.slice(0, 20),
          description: editForm.description,
          newThumbnailUrl: newThumbnailUrl, // Send the new URL
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingAudio(null);
        setEditForm({ title: '', description: '', thumbnail: null, originalThumbnail: null });
        fetchAudioFiles();
      } else {
        const errorData = await response.json();
        setError(errorData.error || '編輯失敗');
      }
    } catch (error) {
      console.error('Edit process failed:', error);
      setError('編輯過程中發生錯誤');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個音檔嗎？')) return;

    try {
      const response = await fetch(`/api/audio/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAudioFiles();
      } else {
        setError('刪除失敗');
      }
    } catch (error) {
      setError('刪除過程中發生錯誤');
    }
  };

  const openEditModal = (audio: AudioFile) => {
    setEditingAudio(audio);
    setEditForm({
      title: audio.title,
      description: audio.description,
      thumbnail: null,
      originalThumbnail: null,
    });
    setShowEditModal(true);
  };
  
  // 登入頁面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="p-3 bg-primary-100 rounded-full inline-block mb-4">
              <Lock className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">管理員登入</h1>
            <p className="text-gray-600 mt-2">請輸入您的帳號和密碼</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                帳號
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="請輸入帳號"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="請輸入密碼"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-3"
            >
              登入
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Music className="w-6 h-6 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">音檔庫管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>新增</span>
              </button>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {audioFiles.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">還沒有音檔</h3>
            <p className="text-gray-600 mb-6">
              點選「新增」按鈕來上傳第一個音檔。
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              開始上傳
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audioFiles.map((audio) => (
              <div key={audio.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    {audio.thumbnail && (
                      <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
                        <Image
                          src={audio.thumbnail} // Use the full URL
                          alt={audio.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                      {audio.title}
                    </h3>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => openEditModal(audio)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(audio.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-3">
                  {new Date(audio.uploadDate).toLocaleDateString('zh-TW')}
                </p>
                
                <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                  {audio.description || '沒有說明文字'}
                </p>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 break-all">
                    檔名URL：{audio.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content max-w-lg flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">上傳音檔</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="upload-form" onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    音檔標題 <span className="text-red-500">*</span>
                    <span className="text-gray-500 text-xs ml-2">
                      (最多20字)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value.slice(0, 20) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="請輸入音檔標題"
                    required
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {uploadForm.title.length}/20
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    說明文字
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="請輸入詳細說明（選填）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    縮圖 <span className="text-gray-500 text-xs">(選填)</span>
                  </label>
                  <div className="space-y-3">
                    {uploadForm.thumbnail && (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={URL.createObjectURL(uploadForm.thumbnail)}
                          alt="縮圖預覽"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <div className="relative flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                        <div>
                          <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">選擇縮圖</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleThumbnailSelect(e, 'upload')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      {uploadForm.thumbnail && (
                        <button
                          type="button"
                          onClick={() => setUploadForm({ ...uploadForm, thumbnail: null })}
                          className="px-4 py-2 text-sm text-red-500 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          移除
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    音檔檔案 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    {uploadForm.audio ? (
                      <div>
                        <Upload className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-700">已選擇：{uploadForm.audio.name}</p>
                        <button
                          type="button"
                          onClick={() => setUploadForm({ ...uploadForm, audio: null })}
                          className="text-sm text-red-500 hover:text-red-700 mt-2"
                        >
                          移除檔案
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">點選選擇音檔檔案</p>
                        <p className="text-xs text-gray-500 mt-1">支援 MP3、WAV、M4A 格式</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setUploadForm({ ...uploadForm, audio: e.target.files?.[0] || null })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex-shrink-0 p-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={isUploading}
                >
                  取消
                </button>
                <button
                  type="submit"
                  form="upload-form"
                  className="flex-1 btn-primary disabled:opacity-50"
                  disabled={isUploading || !uploadForm.audio || !uploadForm.title.trim()}
                >
                  {isUploading ? '上傳中...' : '上傳'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAudio && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content max-w-lg flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">編輯音檔</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="edit-form" onSubmit={handleEdit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    音檔標題 <span className="text-red-500">*</span>
                    <span className="text-gray-500 text-xs ml-2">
                      (最多20字)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value.slice(0, 20) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="請輸入音檔標題"
                    required
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {editForm.title.length}/20
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    說明文字
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="請輸入詳細說明（選填）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    更新縮圖 <span className="text-gray-500 text-xs">(選填)</span>
                  </label>
                  <div className="space-y-3">
                    {/* 顯示目前縮圖或新縮圖 */}
                    {(editForm.thumbnail || editingAudio.thumbnail) && (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                        {editForm.thumbnail ? (
                          <img
                            src={URL.createObjectURL(editForm.thumbnail)}
                            alt="新縮圖預覽"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={editingAudio.thumbnail!} // Use the full URL
                            alt={editingAudio.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <div className="relative flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                        <div>
                          <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {editForm.thumbnail ? '更換縮圖' : '選擇新縮圖'}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleThumbnailSelect(e, 'edit')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      {editForm.thumbnail && (
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, thumbnail: null })}
                          className="px-4 py-2 text-sm text-red-500 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          移除新縮圖
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex-shrink-0 p-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={isEditing}
                >
                  取消
                </button>
                <button
                  type="submit"
                  form="edit-form"
                  className="flex-1 btn-primary disabled:opacity-50"
                  disabled={isEditing || !editForm.title.trim()}
                >
                  {isEditing ? '保存中...' : '保存修改'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Editor */}
      {showImageEditor && (currentEditingFor === 'upload' || currentEditingFor === 'edit') && (
        <ImageEditor
          src={URL.createObjectURL(
            currentEditingFor === 'upload'
              ? uploadForm.originalThumbnail!
              : editForm.originalThumbnail!
          )}
          onSave={handleImageEditSave}
          onCancel={handleImageEditCancel}
        />
      )}
    </div>
  )
} 