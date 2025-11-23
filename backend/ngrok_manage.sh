#!/bin/bash
# ngrok 管理脚本

echo "🔧 ngrok 管理工具"
echo "=================="
echo ""

# 检查 ngrok 是否运行
NGROK_PID=$(pgrep -f "ngrok http")
NGROK_URL=""

if [ -n "$NGROK_PID" ]; then
    echo "✅ ngrok 正在运行 (PID: $NGROK_PID)"
    echo ""
    
    # 获取当前 URL
    NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null)
    
    if [ -n "$NGROK_URL" ] && [ "$NGROK_URL" != "null" ]; then
        echo "📡 当前隧道 URL: $NGROK_URL"
        echo ""
        echo "💡 你可以："
        echo "   1. 使用现有 URL: $NGROK_URL"
        echo "   2. 停止并重启: 运行此脚本时选择 'stop' 或 'restart'"
        echo ""
    else
        echo "⚠️  无法获取隧道 URL"
    fi
else
    echo "❌ ngrok 未运行"
    echo ""
fi

# 处理命令行参数
case "$1" in
    stop|kill)
        if [ -n "$NGROK_PID" ]; then
            echo "🛑 停止 ngrok 进程..."
            kill $NGROK_PID
            sleep 1
            if ! pgrep -f "ngrok http" > /dev/null; then
                echo "✅ ngrok 已停止"
            else
                echo "⚠️  强制停止..."
                kill -9 $NGROK_PID 2>/dev/null
            fi
        else
            echo "ℹ️  ngrok 未运行"
        fi
        ;;
    restart)
        if [ -n "$NGROK_PID" ]; then
            echo "🔄 重启 ngrok..."
            kill $NGROK_PID
            sleep 2
        fi
        echo "🚀 启动 ngrok..."
        unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy
        ~/ngrok http 3002 &
        sleep 3
        NEW_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null)
        if [ -n "$NEW_URL" ] && [ "$NEW_URL" != "null" ]; then
            echo "✅ ngrok 已启动"
            echo "📡 新隧道 URL: $NEW_URL"
        fi
        ;;
    status)
        if [ -n "$NGROK_PID" ]; then
            echo "✅ 状态: 运行中"
            echo "📡 URL: $NGROK_URL"
            echo "🌐 管理界面: http://127.0.0.1:4040"
        else
            echo "❌ 状态: 未运行"
        fi
        ;;
    url)
        if [ -n "$NGROK_URL" ] && [ "$NGROK_URL" != "null" ]; then
            echo "$NGROK_URL"
        else
            echo "无法获取 URL"
            exit 1
        fi
        ;;
    *)
        echo "用法: $0 {stop|restart|status|url}"
        echo ""
        echo "命令："
        echo "  stop     - 停止 ngrok"
        echo "  restart  - 重启 ngrok"
        echo "  status   - 查看状态"
        echo "  url      - 获取当前 URL（用于脚本）"
        echo ""
        if [ -n "$NGROK_URL" ] && [ "$NGROK_URL" != "null" ]; then
            echo "当前 URL: $NGROK_URL"
        fi
        ;;
esac





