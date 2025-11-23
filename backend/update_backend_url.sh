#!/bin/bash
# 自动更新 BACKEND_URL 到当前 ngrok URL

echo "🔄 更新 BACKEND_URL 配置"
echo "========================"
echo ""

# 获取当前 ngrok URL
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null)

if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" == "null" ]; then
    echo "❌ 无法获取 ngrok URL"
    echo "   请确保 ngrok 正在运行: ~/ngrok http 3002"
    exit 1
fi

echo "📡 当前 ngrok URL: $NGROK_URL"
echo ""

# 更新 .env 文件
ENV_FILE="/home/frankyxu/Code/video/first_book_v2/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env 文件不存在，创建新文件..."
    touch "$ENV_FILE"
fi

# 备份原文件
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ 已备份原配置"

# 更新或添加 BACKEND_URL
if grep -q "^BACKEND_URL=" "$ENV_FILE"; then
    # 更新现有配置
    sed -i "s|^BACKEND_URL=.*|BACKEND_URL=$NGROK_URL|" "$ENV_FILE"
    echo "✅ 已更新 BACKEND_URL"
else
    # 添加新配置
    echo "BACKEND_URL=$NGROK_URL" >> "$ENV_FILE"
    echo "✅ 已添加 BACKEND_URL"
fi

echo ""
echo "📝 当前配置:"
grep "^BACKEND_URL" "$ENV_FILE"
echo ""
echo "💡 下一步："
echo "   1. 重启后端服务: pkill -f 'node server.js' && cd backend && npm start &"
echo "   2. 测试回调: curl -X POST $NGROK_URL/api/drama/callback/test"
echo ""





