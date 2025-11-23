#!/bin/bash
# ngrok 快速启动脚本

echo "🚀 ngrok 快速启动指南"
echo "===================="
echo ""

# 检查是否已安装
if command -v ngrok &> /dev/null; then
    echo "✅ ngrok 已安装"
    ngrok version
else
    echo "📦 正在安装 ngrok..."
    
    # 下载到用户目录
    cd ~
    wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
    tar -xzf ngrok-v3-stable-linux-amd64.tgz
    rm ngrok-v3-stable-linux-amd64.tgz
    
    # 移动到系统路径（需要 sudo）
    echo ""
    echo "⚠️  需要 sudo 权限将 ngrok 移动到系统路径"
    echo "   运行: sudo mv ~/ngrok /usr/local/bin/"
    echo ""
    echo "   或者直接使用: ~/ngrok http 3002"
    echo ""
    
    # 使用本地路径
    if [ -f ~/ngrok ]; then
        echo "✅ ngrok 已下载到 ~/ngrok"
        ~/ngrok version
    fi
fi

echo ""
echo "📝 使用方法："
echo "============="
echo ""
echo "1. 启动后端服务（如果还没启动）："
echo "   cd /home/frankyxu/Code/video/first_book_v2/backend"
echo "   npm start &"
echo ""
echo "2. 启动 ngrok："
if [ -f ~/ngrok ]; then
    echo "   ~/ngrok http 3002"
else
    echo "   ngrok http 3002"
fi
echo ""
echo "3. 复制 ngrok 输出的 URL（如：https://abc123.ngrok-free.app）"
echo ""
echo "4. 更新 .env 文件："
echo "   cd /home/frankyxu/Code/video/first_book_v2/backend"
echo "   nano .env"
echo "   修改: BACKEND_URL=https://你的ngrok地址"
echo ""
echo "5. 重启后端服务："
echo "   pkill -f 'node server.js'"
echo "   npm start &"
echo ""
echo "6. 测试："
echo "   curl https://你的ngrok地址/api/health"
echo ""
echo "💡 提示："
echo "   - ngrok 会显示一个 Web 界面: http://127.0.0.1:4040"
echo "   - 可以在那里查看所有请求日志"
echo "   - 免费版 URL 每次启动都会变化"
echo ""





