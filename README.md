# 音檔庫 - 精美音檔分享平台

一個現代化的音檔分享和管理平台，具有響應式設計和類似 Spotify 的播放體驗。

## 功能特色

- 🎵 **精美的音檔播放器** - 類似 Spotify 的播放體驗
- 📱 **完全響應式設計** - 支援桌面、平板和手機裝置
- 🔐 **後台管理系統** - 安全的管理員介面
- 📤 **音檔上傳管理** - 簡單的檔案上傳和組織
- 🎨 **現代化介面** - 使用 Tailwind CSS 設計
- ⚡ **高效能** - 基於 Next.js 13+ App Router

## 技術棧

- **前端**: Next.js 14, React 18, TypeScript
- **樣式**: Tailwind CSS, Framer Motion
- **圖示**: Lucide React
- **部署**: Vercel

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

應用程序將在 [http://localhost:3000](http://localhost:3000) 上運行。

### 3. 訪問後台管理

前往 [http://localhost:3000/admin](http://localhost:3000/admin) 訪問後台管理系統。

**管理員登入資訊:**
- 帳號: `superadmin`
- 密碼: `superadmin`

## 專案結構

```
├── app/
│   ├── components/          # React 組件
│   │   ├── AudioCard.tsx    # 音檔卡片組件
│   │   └── AudioPlayer.tsx  # 音檔播放器組件
│   ├── admin/               # 後台管理頁面
│   │   └── page.tsx
│   ├── api/                 # API 路由
│   │   └── audio/
│   │       ├── route.ts     # 音檔列表 API
│   │       ├── upload/      # 上傳 API
│   │       └── [filename]/  # 檔案服務和刪除 API
│   ├── globals.css          # 全域樣式
│   ├── layout.tsx           # 根布局
│   └── page.tsx            # 首頁
├── public/
│   └── uploads/
│       └── audio/          # 音檔儲存目錄
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

## 使用說明

### 上傳音檔

1. 訪問 `/admin` 頁面
2. 使用管理員帳號登入
3. 點選「新增」按鈕
4. 填寫音檔標題（最多20字）
5. 選填說明文字
6. 選擇音檔檔案（支援 MP3、WAV、M4A 格式）
7. 點選「上傳」

### 播放音檔

1. 在首頁瀏覽音檔卡片
2. 點選「播放」按鈕開始播放
3. 使用底部播放器控制播放
4. 點選「了解更多」查看詳細說明

### 響應式特性

- **桌面版**: 完整功能的播放器介面
- **平板版**: 優化的中等螢幕體驗
- **手機版**: 簡化的觸控友好介面

## 部署到 Vercel

### 自動部署（推薦）

1. 將專案推送到 GitHub 儲存庫
2. 前往 [Vercel](https://vercel.com)
3. 導入您的 GitHub 儲存庫
4. Vercel 會自動檢測 Next.js 專案並進行部署

### 手動部署

```bash
# 建置專案
npm run build

# 使用 Vercel CLI 部署
npx vercel --prod
```

## 環境設定

專案使用檔案系統儲存音檔和 metadata，不需要額外的資料庫設定。音檔將儲存在 `public/uploads/audio/` 目錄中。

## 瀏覽器支援

- Chrome (推薦)
- Firefox
- Safari
- Edge

## 授權

此專案為私人專案，請勿未經授權複製或分發。 