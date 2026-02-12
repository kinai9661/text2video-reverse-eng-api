# Text2Video 2026 - Fixed Version

## 🔧 包含 404 錯誤修復

### 快速開始

\`\`\`bash
npm install
cp .env.local.example .env.local
# 編輯 .env.local 填入 SUPABASE_TOKEN
npm run dev
\`\`\`

### 🆘 遇到 404 錯誤？

編輯 \`src/app/api/videos/text2video/route.ts\`:

\`\`\`typescript
// 第 20 行左右
const USE_BASIC_MODELS = true;  // 改為 true
\`\`\`

保存並重啟。

### 📋 配置步驟

1. **創建 .env.local**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. **獲取 Token**
   - 訪問 https://supabase.com/dashboard
   - Settings > API
   - 複製 anon public key

3. **填入 Token**
   \`\`\`
   SUPABASE_TOKEN=你的真實token
   \`\`\`

4. **重啟**
   \`\`\`bash
   npm run dev
   \`\`\`

### 🧪 測試

打開 http://localhost:3000

按 F12 查看 Console 日誌

### 💡 特性

- ✅ 增強錯誤日誌
- ✅ 404 自動診斷
- ✅ 雙模型映射（完整/簡化）
- ✅ 一鍵切換修復

MIT License
