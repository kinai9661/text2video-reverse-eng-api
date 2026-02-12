#!/bin/bash
echo "🔍 自動檢測可用模型..."
if [ -f ".env.local" ]; then
    TOKEN=$(grep SUPABASE_TOKEN .env.local|cut -d'=' -f2)
else
    echo "❌ .env.local 不存在"; exit 1
fi
if [ -z "$TOKEN" ]||[ "$TOKEN" == "your-supabase-token-here" ]; then
    echo "❌ Token 未配置"; exit 1
fi
echo "✅ Token 已加載"
echo ""
API="https://app-9kpm005bczy9-vitesandbox.sandbox.medo.dev/functions/v1/video-api/v1/videos/text2video"
MODELS=("kling" "kling-v1" "kling-v2" "runway" "gen3" "gen4" "veo" "veo2" "veo3" "veo3.1" "sora" "sora-v1" "luma")
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 測試 ${#MODELS[@]} 個模型"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"
FOUND=()
for M in "${MODELS[@]}"; do
    echo -n "$M ... "
    R=$(curl -s -w "\n%{http_code}" -X POST "$API" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"model_name\":\"$M\",\"prompt\":\"test\",\"duration\":\"5\"}" 2>&1)
    C=$(echo "$R"|tail -n1)
    if [ "$C" == "200" ]||[ "$C" == "201" ]; then
        echo "✅"
        FOUND+=("$M")
    else
        echo "❌ $C"
    fi
    sleep 0.3
done
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ ${#FOUND[@]} -eq 0 ]; then
    echo "❌ 未找到可用模型"
else
    echo "✅ 找到 ${#FOUND[@]} 個:"
    for M in "${FOUND[@]}"; do echo "   • $M"; done
    echo ""
    echo "📝 更新 route.ts:"
    echo "const modelMap = {"
    F="${FOUND[0]}"
    echo "  'kling-2.6': '$F',"
    echo "  'default': '$F'"
    echo "};"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"