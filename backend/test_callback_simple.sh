#!/bin/bash
# 简单的回调测试脚本

set -e

BACKEND_URL="http://localhost:3002"

echo "🧪 简单回调测试"
echo "================"
echo ""

# 步骤 1: 创建任务
echo "📤 步骤 1: 创建视频生成任务..."
TASK_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/drama/generate-video-mock" \
  -H 'Content-Type: application/json' \
  -d '{
    "scenes": [{
      "id": 1,
      "durationSeconds": 5,
      "story": "测试场景",
      "voicePrompt": "测试语音",
      "videoPrompt": "test",
      "imagePrompt": "test"
    }]
  }')

echo "响应: $TASK_RESPONSE"
echo ""

# 提取 taskId
if command -v jq &> /dev/null; then
  TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.taskId' 2>/dev/null)
else
  # 如果没有 jq，尝试从响应中提取
  TASK_ID=$(echo "$TASK_RESPONSE" | grep -o '"taskId":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$TASK_ID" ] || [ "$TASK_ID" == "null" ]; then
  echo "❌ 无法提取 taskId"
  echo "完整响应: $TASK_RESPONSE"
  exit 1
fi

echo "✅ 任务创建成功: $TASK_ID"
echo ""

# 步骤 2: 查询初始状态
echo "📊 步骤 2: 查询任务初始状态..."
INITIAL_STATUS=$(curl -s "$BACKEND_URL/api/drama/task/$TASK_ID")
echo "$INITIAL_STATUS" | jq . 2>/dev/null || echo "$INITIAL_STATUS"
echo ""

# 步骤 3: 模拟 n8n 回调
echo "📞 步骤 3: 模拟 n8n 回调..."
CALLBACK_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/drama/callback/$TASK_ID" \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "videoUrl": "http://49.235.210.6:8001/output/test_final_video.mp4"
  }')

echo "回调响应: $CALLBACK_RESPONSE"
echo ""

# 步骤 4: 验证任务状态已更新
echo "✅ 步骤 4: 验证任务已完成..."
sleep 1
FINAL_STATUS=$(curl -s "$BACKEND_URL/api/drama/task/$TASK_ID")
echo "$FINAL_STATUS" | jq . 2>/dev/null || echo "$FINAL_STATUS"
echo ""

# 检查结果
if echo "$FINAL_STATUS" | grep -q '"status":"completed"'; then
  echo "🎉 测试成功！任务状态已更新为 completed"
else
  echo "⚠️  任务状态可能未正确更新"
fi

echo ""
echo "📝 使用的 taskId: $TASK_ID"
echo "   你可以手动测试: curl \"$BACKEND_URL/api/drama/task/$TASK_ID\""
echo ""




