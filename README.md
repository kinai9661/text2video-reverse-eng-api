# Text2Video 2026 - 完整版

## 🚀 快速開始

\`\`\`bash
npm install
cp .env.local.example .env.local
# 編輯 .env.local 填入 SUPABASE_TOKEN
npm run detect  # 自動檢測模型
npm run dev
\`\`\`

## 🔧 遇到 404？

### 方法 1: 自動檢測
\`\`\`bash
npm run detect
\`\`\`

### 方法 2: 切換方案
編輯 \`src/app/api/videos/text2video/route.ts\`:
\`\`\`typescript
const ACTIVE_SCHEME = 1;  // 改為 1, 2, 或 3
\`\`\`

## 📊 3 種方案

- **1 = SIMPLE**: kling, runway, veo
- **2 = VERSIONED**: kling-v1, gen4, veo3.1
- **3 = FULL**: kling-v2.6-master

## 📝 配置

1. 獲取 Token: https://supabase.com/dashboard
2. Settings > API > 複製 anon key
3. 填入 .env.local

MIT License