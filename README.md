# Text2Video API 逆向工程輸出站

支援 **10+ 主流 AI 影片生成模型**，OpenAI 相容格式，完整 UI 與 API 分析。

## ✨ 功能特性

✅ **10+ 頂級模型** - Kling 1.6, Runway Gen-4, Veo 3.1, Luma Ray 3, MiniMax, Pika v1 等  
✅ **智能輪詢** - 自動查詢任務狀態，實時進度顯示  
✅ **完整 UI** - 左側參數輸入，右側 4 標籤頁（影片/API/請求/響應）  
✅ **OpenAI 相容** - 標準 `/v1/videos/text2video` 端點  
✅ **調試友好** - Console 日誌 + 實時響應更新

## 🔧 修復內容

本版本解決「影片生成完成但未顯示」的問題：

1. ✅ 增強輪詢邏輯，支持多種狀態格式
2. ✅ 檢查 6+ 種 video_url 位置
3. ✅ 實時進度條與狀態消息
4. ✅ Console 調試日誌
5. ✅ 10 分鐘超時保護
6. ✅ 響應標籤實時更新

## 🚀 快速部署

```bash
npm install
cp .env.local.example .env.local
# 填入 APPMEDO_API_KEY
npm run dev
```

部署到 Vercel：
1. 前往 vercel.com/new
2. 匯入 GitHub repo
3. 設定環境變數 `APPMEDO_API_KEY`
4. Deploy

## 📊 模型列表

| 模型 | 時長 | 特色 |
|------|-----|------|
| Kling 1.6 | 10s | 中文理解最佳 |
| Runway Gen-4 | 10s | 電影級 4K |
| Veo 3.1 | 8s | 自帶音頻 |
| Luma Ray 3 | 5s | 3D 產品展示 |
| MiniMax | 6s | 快速低成本 |
| Pika v1 | 3s | 高性價比 |

完整文檔請查看 README.md

MIT License | Made with ❤️ by kinai9661
