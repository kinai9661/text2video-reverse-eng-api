# Text2Video 2026

## 🚀 快速開始

\`\`\`bash
npm install
cp .env.local.example .env.local
# 編輯 .env.local 填入 Token
npm run detect
npm run dev
\`\`\`

## 🔧 修復 404

編輯 \`src/app/api/videos/text2video/route.ts\`:

\`\`\`typescript
const ACTIVE_SCHEME: number = 1;  // 改為 1, 2, 或 3
\`\`\`

1 = SIMPLE | 2 = VERSIONED | 3 = FULL

MIT License