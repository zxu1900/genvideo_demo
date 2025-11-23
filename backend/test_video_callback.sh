#!/bin/bash
# 测试视频生成回调机制

set -e

echo "🧪 视频生成回调测试工具"
echo "=========================="
echo ""

# 配置
BACKEND_URL="http://localhost:3002"
BACKEND_IP=$(hostname -I | awk '{print $1}')

echo "📍 后端地址: $BACKEND_URL"
echo "📍 本机 IP: $BACKEND_IP"
echo ""

# 测试 1: 健康检查
echo "🔍 测试 1: 后端健康检查..."
HEALTH=$(curl -s "$BACKEND_URL/api/health")
if echo "$HEALTH" | grep -q "OK"; then
  echo "✅ 后端服务正常"
else
  echo "❌ 后端服务异常: $HEALTH"
  exit 1
fi
echo ""

# 测试 2: 手动回调接口
echo "🔍 测试 2: 回调接口测试..."
CALLBACK_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/drama/callback/test_task_123" \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "videoUrl": "http://49.235.210.6:8001/output/test_video.mp4"
  }')

if echo "$CALLBACK_RESPONSE" | grep -q "success"; then
  echo "✅ 回调接口正常工作"
else
  echo "⚠️  回调接口响应: $CALLBACK_RESPONSE"
fi
echo ""

# 测试 3: 创建测试任务
echo "🔍 测试 3: 创建视频生成任务..."
TASK_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/drama/generate-video" \
  -H 'Content-Type: application/json' \
  -d '{
    "scenes": [
      {
        "id": 1,
        "durationSeconds": 5,
        "story": "测试场景",
        "voicePrompt": "这是一个测试场景",
        "videoPrompt": "test scene",
        "imagePrompt": "test image"
      }
    ]
  }' 2>&1)

echo "📤 任务提交响应:"
echo "$TASK_RESPONSE" | jq . 2>/dev/null || echo "$TASK_RESPONSE"
echo ""

# 提取 taskId
if command -v jq &> /dev/null; then
  TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.taskId' 2>/dev/null)
  
  if [ "$TASK_ID" != "null" ] && [ -n "$TASK_ID" ]; then
    echo "✅ 任务创建成功: $TASK_ID"
    echo ""
    
    # 测试 4: 查询任务状态
    echo "🔍 测试 4: 查询任务状态..."
    sleep 2
    TASK_STATUS=$(curl -s "$BACKEND_URL/api/drama/task/$TASK_ID")
    echo "$TASK_STATUS" | jq . 2>/dev/null || echo "$TASK_STATUS"
    echo ""
    
    # 测试 5: 模拟 n8n 回调
    echo "🔍 测试 5: 模拟 n8n 回调完成..."
    CALLBACK_RESULT=$(curl -s -X POST "$BACKEND_URL/api/drama/callback/$TASK_ID" \
      -H 'Content-Type: application/json' \
      -d '{
        "status": "completed",
        "videoUrl": "http://49.235.210.6:8001/output/mock_final_video.mp4"
      }')
    echo "$CALLBACK_RESULT" | jq . 2>/dev/null || echo "$CALLBACK_RESULT"
    echo ""
    
    # 测试 6: 再次查询任务状态
    echo "🔍 测试 6: 验证任务已完成..."
    sleep 1
    FINAL_STATUS=$(curl -s "$BACKEND_URL/api/drama/task/$TASK_ID")
    echo "$FINAL_STATUS" | jq . 2>/dev/null || echo "$FINAL_STATUS"
    
    # 检查是否真的完成了
    if echo "$FINAL_STATUS" | grep -q '"status":"completed"'; then
      echo ""
      echo "✅ 回调机制工作正常！"
    else
      echo ""
      echo "⚠️  任务状态未更新为 completed"
    fi
  else
    echo "⚠️  无法提取 taskId，可能是 n8n 调用失败"
  fi
else
  echo "⚠️  未安装 jq，跳过详细测试"
fi

echo ""
echo "=========================="
echo "📊 测试总结"
echo "=========================="
echo ""
echo "✅ 如果所有测试通过，说明回调机制在本地正常工作"
echo ""
echo "⚠️  下一步检查:"
echo "1. n8n 服务器 (49.235.210.6) 能否访问 $BACKEND_IP:3002"
echo "2. 检查防火墙设置: sudo ufw status"
echo "3. 测试远程访问: ssh user@49.235.210.6 'curl http://$BACKEND_IP:3002/api/health'"
echo ""
echo "💡 建议使用 ngrok 暴露本地服务:"
echo "   ngrok http 3002"
echo "   然后将 BACKEND_URL 设置为 ngrok 提供的公网地址"
echo ""





