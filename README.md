# Text2Video 2026 - AI 視頻生成平台

🎉 **v2.0** - 使用 2026 年最新 AI 模型生成高質量視頻

## ✨ 特性

### 🏆 12+ 頂級模型
- **Kling 2.6** - 最佳動畫對話 (Elo 1247+)
- **Runway Gen-4.5** - 頂級專業控制
- **Google Veo 3.1** - 最佳真實感
- **Sora 2** - OpenAI 最新，動態場景
- **Seedance 1.5 Pro** - 極速生成
- 更多...

### 🎨 智能功能
- ✅ Text-to-Video（文字生成視頻）
- ✅ Image-to-Video（圖片生成視頻）
- ✅ 模型分類篩選（頂級/快速/特色/入門）
- ✅ 實時進度追蹤
- ✅ 完整錯誤處理
- ✅ 4 標籤頁查看（影片/API/請求/響應）

## 🚀 快速開始

### 1. 安裝依賴
\`\`\`bash
npm install
\`\`\`

### 2. 配置環境變數
\`\`\`bash
cp .env.local.example .env.local
# 編輯 .env.local，填入你的 SUPABASE_TOKEN
\`\`\`

### 3. 啟動開發服務器
\`\`\`bash
npm run dev
\`\`\`

訪問 http://localhost:3000

## 📊 模型對比

| 模型 | 最佳用途 | 時長 | 圖片支持 | 類別 |
|------|---------|------|---------|------|
| Kling 2.6 | 動畫對話 | 10s | ✅ | 頂級 |
| Runway 4.5 | 專業控制 | 10s | ✅ | 頂級 |
| Veo 3.1 | 真實人物 | 8s | ✅ | 頂級 |
| Sora 2 | 動態場景 | 10s | ✅ | 頂級 |
| Seedance | 快速原型 | 6s | ✅ | 快速 |
| Luma Ray 3 | 電影HDR | 5s | ✅ | 特色 |

## 🧪 API 測試

\`\`\`bash
curl -X POST "https://app-9kpm005bczy9-vitesandbox.sandbox.medo.dev/functions/v1/video-api/v1/videos/text2video" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "kling-v2.6-master",
    "prompt": "A beautiful sunset over the ocean",
    "aspect_ratio": "16:9",
    "duration": "5"
  }'
\`\`\`

## 📦 部署到 Vercel

\`\`\`bash
# 方法 1: CLI
vercel deploy

# 方法 2: GitHub
git push
# 在 vercel.com 連接 repo
\`\`\`

記得在 Vercel 設置環境變數: \`SUPABASE_TOKEN\`

## 💡 使用建議

### 按需求選擇模型

**商業廣告**: Veo 3.1（最佳真實感）
**動畫故事**: Kling 2.6（對話自然）
**專業項目**: Runway Gen-4.5（精確控制）
**快速原型**: Seedance 1.5 Pro（極速）
**電影級**: Luma Ray 3（HDR）

### 提示詞技巧
1. 詳細描述場景和動作
2. 包含光線、運鏡方向
3. 指定風格和情緒
4. 圖片模式描述運動而非內容

## 🐛 故障排除

### 401 Unauthorized
→ 檢查 SUPABASE_TOKEN 是否正確

### 404 Not Found
→ 確認 API URL 無誤

### 生成失敗
→ 查看 Console 日誌和響應標籤

## 📈 版本歷史

### v2.0.0 (2026-02-12)
- ✅ 新增 12 個 2026 最新模型
- ✅ 智能模型分類篩選
- ✅ 徽章系統（TOP/NEW/⚡/🎬）
- ✅ UI/UX 全面升級
- ✅ 完整錯誤處理

### v1.3.0
- 正確 API 端點
- Supabase Token 認證
- 模型映射表

## 📄 License

MIT License

---

Made with ❤️ by kinai9661
