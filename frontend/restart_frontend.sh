#!/bin/bash
# 重启前端服务的脚本

echo "🔄 重启前端服务..."
echo ""

# 停止服务
echo "1️⃣  停止当前服务..."
PORT_PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PORT_PID" ]; then
  echo "   找到进程 PID: $PORT_PID"
  kill $PORT_PID 2>/dev/null && echo "   ✅ 已停止" || kill -9 $PORT_PID 2>/dev/null
else
  pkill -f "react-scripts/scripts/start" 2>/dev/null
fi

# 等待端口释放
echo ""
echo "2️⃣  等待端口释放..."
for i in {1..5}; do
  if ! lsof -ti:3000 >/dev/null 2>&1; then
    echo "   ✅ 端口已释放"
    break
  fi
  sleep 1
  echo "   等待中... ($i/5)"
done

# 检查 .env 文件
echo ""
echo "3️⃣  检查配置..."
if [ -f .env ]; then
  echo "   ✅ .env 文件存在"
  cat .env | grep REACT_APP_API_URL || echo "   ⚠️  未找到 REACT_APP_API_URL"
else
  echo "   ⚠️  .env 文件不存在，创建默认配置..."
  echo "REACT_APP_API_URL=http://localhost:3002" > .env
fi

# 启动服务
echo ""
echo "4️⃣  启动前端服务..."
echo "   运行: npm start"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
  echo "❌ 错误: 不在前端目录中"
  echo "   请运行: cd frontend && ./restart_frontend.sh"
  exit 1
fi

# 启动（前台运行，方便查看日志）
npm start




