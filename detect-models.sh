#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Text2Video 2026 - 模型自動檢測"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f ".env.local" ]; then
    echo "❌ 錯誤: .env.local 不存在"
    echo "請執行: cp .env.local.example .env.local"
    exit 1
fi

TOKEN=$(grep SUPABASE_TOKEN .env.local | cut -d'=' -f2)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "your-supabase-token-here" ]; then
    echo "❌ Token 未配置或是示例值"
    echo "請編輯 .env.local 填入真實 Token"
    exit 1
fi

echo "✅ Token 已加載 (${#TOKEN} 字符)"
echo ""

API_URL="https://app-9kpm005bczy9-vitesandbox.sandbox.medo.dev/functions/v1/video-api/v1/videos/text2video"

MODELS=(
    "kling" "kling-v1" "kling-v2"
    "runway" "gen3" "gen4"
    "veo" "veo2" "veo3" "veo3.1"
    "sora" "sora-v1" "sora-v2"
    "kling-v2.6-master" "runway-gen4.5-turbo" "veo-3.1-master"
)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 測試 ${#MODELS[@]} 個模型名稱"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FOUND=()
COUNT=0

for MODEL in "${MODELS[@]}"; do
    COUNT=$((COUNT + 1))
    printf "[%2d/%2d] %-25s ... " "$COUNT" "${#MODELS[@]}" "$MODEL"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"model_name\":\"$MODEL\",\"prompt\":\"test\",\"duration\":\"5\"}" 2>&1)

    CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$CODE" == "200" ] || [ "$CODE" == "201" ] || [ "$CODE" == "202" ]; then
        echo "✅ $CODE"
        FOUND+=("$MODEL")
    elif [ "$CODE" == "404" ]; then
        echo "❌ 404"
    elif [ "$CODE" == "401" ]; then
        echo "❌ 401 (Token 問題)"
        echo ""
        echo "⚠️  Token 無效或權限不足"
        exit 1
    else
        echo "⚠️  $CODE"
    fi

    sleep 0.5
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 檢測結果"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ${#FOUND[@]} -eq 0 ]; then
    echo "❌ 未找到任何可用模型"
    echo ""
    echo "可能原因:"
    echo "• Token 權限不足"
    echo "• API 端點已變更"
    echo "• 訂閱已過期"
else
    echo "✅ 找到 ${#FOUND[@]} 個可用模型:"
    echo ""
    for MODEL in "${FOUND[@]}"; do
        echo "   ✓ $MODEL"
    done
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 更新建議"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "在 src/app/api/videos/text2video/route.ts 中:"
    echo ""

    FIRST="${FOUND[0]}"
    echo "const VERSIONED_MODELS: Record<string, string> = {"
    echo "  'kling-2.6': '$FIRST',"
    echo "  'runway-gen4.5': '$FIRST',"
    echo "  'default': '$FIRST'"
    echo "};"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
