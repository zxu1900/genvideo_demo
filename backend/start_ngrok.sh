#!/bin/bash
# ngrok 启动脚本（解决代理问题）

echo "🚀 启动 ngrok（禁用代理）..."
echo ""

# 清除所有代理环境变量
unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy
unset ALL_PROXY
unset all_proxy
unset NO_PROXY
unset no_proxy

# 检查后端服务是否运行
if ! curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
    echo "⚠️  警告: 后端服务似乎未运行在 3002 端口"
    echo "   请先启动后端: cd backend && npm start &"
    echo ""
fi

# 启动 ngrok
echo "📡 启动 ngrok 隧道..."
echo "   本地服务: http://localhost:3002"
echo "   管理界面: http://127.0.0.1:4040"
echo ""
echo "💡 提示: 按 Ctrl+C 停止 ngrok"
echo ""

# 使用环境变量方式启动（确保没有代理）
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY -u all_proxy \
    ~/ngrok http 3002





