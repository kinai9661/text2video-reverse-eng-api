# Text2Video API - 圖片上傳支持版

支援 10+ AI 影片生成模型，現已支持 **圖片轉影片 (Image-to-Video)** 功能！

## ✨ 新增功能

### 🖼 圖片轉影片 (Image-to-Video)
- 上傳首幀圖片，AI 自動生成動態影片
- 支持 PNG, JPG, WebP，最大 10MB
- 7 個模型支持圖片輸入：
  - ✅ Kling 1.6/1.5
  - ✅ Runway Gen-3/Gen-4
  - ✅ Veo 3/3.1
  - ✅ Luma Ray 3

### 🎯 使用場景
- 產品照片→動態展示
- 靜態海報→動態廣告
- 人物照片→表情動作
- 風景照片→鏡頭運動

## 🚀 快速部署

```bash
npm install
cp .env.local.example .env.local
# 填入 APPMEDO_API_KEY
npm run dev
```

## 📋 使用指南

### Text-to-Video
1. 選擇模型
2. 輸入提示詞
3. 設定參數
4. 生成

### Image-to-Video
1. 選擇帶 🖼 的模型
2. 上傳圖片 (<10MB)
3. 描述運動效果
4. 生成

## 🎨 提示詞範例

### 文字生成
```
陽光下微笑的女人，長髮隨風飄動，背景海灘，電影級質感
```

### 圖片生成
```
❌ "一個女人在海灘微笑"
✅ "鏡頭緩慢推進，人物微笑點頭，頭髮輕輕飄動"
```

## 📊 模型對比

| 模型 | 時長 | 圖片 | 特色 |
|------|-----|------|------|
| Kling 1.6 | 10s | ✅ | 中文+圖片最佳 |
| Runway Gen-4 | 10s | ✅ | 圖片電影級 4K |
| Veo 3.1 | 8s | ✅ | 圖片+音頻 |
| Luma Ray 3 | 5s | ✅ | 圖片 3D |

完整文檔請查看專案內 README。

MIT License | Made by kinai9661
