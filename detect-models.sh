#!/bin/bash
echo "🔍 自動檢測可用模型..."
if [ -f ".env.local" ]; then
    TOKEN=$(grep SUPABASE_TOKEN .env.local | cut -d'=' -f2)
else
    echo "❌ .env.local 不存在"; exit 1
fi
[ -z "$TOKEN" ] && { echo "❌ Token 未配置"; exit 1; }
echo "✅ Token 已加載"
API="https://app-9kpm005bczy9-vitesandbox.sandbox.medo.dev/functions/v1/video-api/v1/videos/text2video"
MODELS=("kling" "kling-v1" "runway" "gen3" "gen4" "veo" "veo3.1" "sora")
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"
FOUND=()
for M in "${MODELS[@]}"; do
    echo -n "$M ... "
    R=$(curl -s -w "\n%{http_code}" -X POST "$API" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"model_name\":\"$M\",\"prompt\":\"test\",\"duration\":\"5\"}")
    C=$(echo "$R" | tail -n1)
    if [ "$C" == "200" ] || [ "$C" == "201" ]; then
        echo "✅"
        FOUND+=("$M")
    else
        echo "❌"
    fi
    sleep 0.3
done
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ ${#FOUND[@]} -eq 0 ]; then
    echo "❌ 未找到"
else
    echo "✅ 找到 ${#FOUND[@]} 個:"
    for M in "${FOUND[@]}"; do echo "   • $M"; done
fi