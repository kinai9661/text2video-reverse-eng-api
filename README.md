# Text2Video API 逆向工程輸出站

基於 appmedo.com text2video API 的逆向工程專案，提供 OpenAI 相容格式輸出。

## 功能特性

✅ **完整 UI 界面**
- 左側參數輸入（提示詞、模型、時長、比例）
- 右側 4 個標籤頁（影片預覽、API 資訊、請求、響應）
- 紫色漸變主題，響應式設計

✅ **OpenAI Compatible API**
- `POST /v1/videos/text2video` - 影片生成
- `GET /v1/videos/tasks/{taskId}` - 任務狀態查詢
- Bearer Token 認證

✅ **智能任務輪詢**
- 自動輪詢任務狀態
- 實時進度更新
- 完成後自動顯示影片

## 部署到 Vercel

### 1. 環境變數設定

在 Vercel Dashboard > Settings > Environment Variables 新增：

```
APPMEDO_API_KEY=your-api-key-here
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### 2. 一鍵部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kinai9661/text2video-reverse-eng)

或手動部署：

```bash
npm install
npm run build
vercel deploy
```

### 3. 本地開發

```bash
# 安裝依賴
npm install

# 創建 .env.local
cp .env.local.example .env.local
# 編輯 .env.local 填入 API Key

# 啟動開發服務器
npm run dev
```

訪問 http://localhost:3000

## API 使用範例

### 生成影片

```bash
curl -X POST https://your-app.vercel.app/v1/videos/text2video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "陽光下微笑的女人，輕風吹拂頭髮",
    "model": "kling-1.6",
    "seconds": 5,
    "aspect_ratio": "16:9"
  }'
```

### 查詢任務狀態

```bash
curl https://your-app.vercel.app/v1/videos/tasks/{taskId}
```

## 技術棧

- **框架**: Next.js 15 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **部署**: Vercel Serverless Functions
- **API**: OpenAI Compatible Format

## 文件結構

```
text2video-reverse-eng/
├── src/
│   ├── app/
│   │   ├── api/videos/
│   │   │   ├── text2video/route.ts    # 影片生成 API
│   │   │   └── tasks/[taskId]/route.ts # 任務查詢 API
│   │   ├── page.tsx                    # 主頁面
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── VideoGenerator.tsx          # 主 UI 元件
│   │   └── ui/                         # shadcn 元件
│   └── lib/utils.ts
├── vercel.json                         # Vercel 配置
├── next.config.js
└── package.json
```

## 授權

MIT License

---

Made with ❤️ by [kinai9661](https://github.com/kinai9661)
