import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '音檔庫 - 精美音檔分享平台',
  description: '一個精美的音檔分享和管理平台，支援響應式設計和現代化播放體驗',
  keywords: '音檔, 播放器, 分享, 管理',
  authors: [{ name: '音檔庫' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
} 