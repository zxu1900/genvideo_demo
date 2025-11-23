#!/bin/bash
# 停止前端服务的脚本

echo "🛑 停止前端服务..."
echo ""

# 方法 1: 通过进程名匹配
echo "方法 1: 通过 react-scripts 匹配..."
pkill -f "react-scripts/scripts/start" 2>/dev/null && echo "✅ 已停止" || echo "⚠️  未找到进程"

# 方法 2: 通过端口查找
echo ""
echo "方法 2: 通过端口 3000 查找..."
PORT_PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PORT_PID" ]; then
  echo "找到进程 PID: $PORT_PID"
  kill $PORT_PID 2>/dev/null && echo "✅ 已停止进程 $PORT_PID" || echo "⚠️  停止失败"
else
  echo "✅ 端口 3000 未被占用"
fi

# 等待一下
sleep 2

# 验证
echo ""
echo "验证结果:"
if lsof -ti:3000 >/dev/null 2>&1; then
  echo "⚠️  端口 3000 仍被占用"
  echo "   可能需要强制停止: kill -9 $PORT_PID"
else
  echo "✅ 前端服务已停止"
fi

echo ""




