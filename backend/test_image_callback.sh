#!/bin/bash
# 测试图像生成回调接口

set -e

BACKEND_URL="http://localhost:3002"
TASK_ID="test_img_$(date +%s)"

echo "🧪 图像生成回调接口测试"
echo "======================="
echo ""

# 步骤 1: 创建测试任务
echo "步骤 1: 创建测试任务..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/ai/generate-story" \
  -H 'Content-Type: application/json' \
  -d '{
    "idea": "一只小兔子的冒险",
    "theme": "adventure",
    "useN8n": true
  }')

echo "响应: $RESPONSE"
echo ""

# 提取 imageJobId
IMAGE_JOB_ID=$(echo "$RESPONSE" | grep -o '"imageJobId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$IMAGE_JOB_ID" ]; then
  echo "❌ 未能获取 imageJobId，使用测试 ID"
  IMAGE_JOB_ID="$TASK_ID"
else
  echo "✅ 获取到 imageJobId: $IMAGE_JOB_ID"
fi

echo ""
echo "等待 2 秒..."
sleep 2

# 步骤 2: 查询任务状态（回调前）
echo ""
echo "步骤 2: 查询任务状态（回调前）..."
curl -s "$BACKEND_URL/api/ai/image-jobs/$IMAGE_JOB_ID" | jq .
echo ""

# 步骤 3: 模拟 n8n 回调
echo ""
echo "步骤 3: 模拟 n8n 回调..."
CALLBACK_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/ai/image-callback/$IMAGE_JOB_ID" \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "task_id": "'"$IMAGE_JOB_ID"'",
    "images": [
      {
        "scene_id": 1,
        "scene_index": 0,
        "imageUrl": "http://49.235.210.6:8001/output/test_scene_1.png"
      },
      {
        "scene_id": 2,
        "scene_index": 1,
        "imageUrl": "http://49.235.210.6:8001/output/test_scene_2.png"
      },
      {
        "scene_id": 3,
        "scene_index": 2,
        "imageUrl": "http://49.235.210.6:8001/output/test_scene_3.png"
      }
    ],
    "stats": {
      "total_scenes": 3,
      "completed_scenes": 3,
      "failed_scenes": 0,
      "total_time_seconds": 6.5
    }
  }')

echo "回调响应: $CALLBACK_RESPONSE"
echo ""

# 步骤 4: 查询任务状态（回调后）
echo ""
echo "步骤 4: 查询任务状态（回调后）..."
FINAL_STATUS=$(curl -s "$BACKEND_URL/api/ai/image-jobs/$IMAGE_JOB_ID")
echo "$FINAL_STATUS" | jq .

# 验证结果
echo ""
echo "======================="
echo "🔍 验证结果"
echo "======================="

STATUS=$(echo "$FINAL_STATUS" | jq -r '.status')
COMPLETED_SCENES=$(echo "$FINAL_STATUS" | jq -r '.completedScenes')
IMAGE_URL_1=$(echo "$FINAL_STATUS" | jq -r '.scenes[0].imageUrl')

echo "任务状态: $STATUS"
echo "完成场景数: $COMPLETED_SCENES"
echo "第一个图片 URL: $IMAGE_URL_1"
echo ""

if [ "$STATUS" = "completed" ] && [ "$COMPLETED_SCENES" = "3" ] && [ "$IMAGE_URL_1" != "null" ]; then
  echo "✅ 测试通过！"
  echo "   - 任务状态正确: $STATUS"
  echo "   - 场景数正确: $COMPLETED_SCENES"
  echo "   - 图片 URL 已填充: $IMAGE_URL_1"
else
  echo "❌ 测试失败！"
  echo "   - 期望状态: completed, 实际: $STATUS"
  echo "   - 期望场景数: 3, 实际: $COMPLETED_SCENES"
  echo "   - 期望图片 URL 非空, 实际: $IMAGE_URL_1"
  exit 1
fi

echo ""
echo "🎉 图像生成回调接口测试完成！"


