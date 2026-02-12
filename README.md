# Text2Video API 逆向工程輸出站

基於 appmedo.com text2video API 的逆向工程專案，提供 OpenAI 相容格式輸出。

## 功能特性

✅ **完整 UI 界面** - 左側參數輸入，右側 4 個標籤頁  
✅ **OpenAI Compatible API** - `/v1/videos/text2video` 端點  
✅ **智能任務輪詢** - 自動查詢狀態並顯示影片  
✅ **實時 API 分析** - 完整請求/響應 JSON 顯示

## 部署到 Vercel

### 1. 環境變數

在 Vercel Dashboard > Settings > Environment Variables 新增：

```
APPMEDO_API_KEY=your-api-key-here
```

### 2. 一鍵部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

或手動部署：

```bash
npm install
npm run build
vercel deploy
```

### 3. 本地開發

```bash
npm install
cp .env.local.example .env.local
# 編輯 .env.local 填入 API Key
npm run dev
```

訪問 http://localhost:3000

## 技術棧

- Next.js 14.2 + TypeScript
- Tailwind CSS
- Vercel Serverless Functions

## 授權

MIT License

---

Made with ❤️ by [kinai9661](https://github.com/kinai9661)
