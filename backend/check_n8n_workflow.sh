#!/bin/bash
# 检查 n8n workflow 状态

echo "🔍 检查 n8n Workflow 状态"
echo "========================"
echo ""

N8N_URL="http://49.235.210.6:5678"
WEBHOOK_PATH="/webhook/story_final_v2"
WEBHOOK_URL="${N8N_URL}${WEBHOOK_PATH}"

echo "📡 n8n 服务器: $N8N_URL"
echo "🔗 Webhook 路径: $WEBHOOK_PATH"
echo ""

# 1. 测试 webhook 可访问性
echo "1️⃣  测试 Webhook 可访问性..."
RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d '{
    "scenes": [{
      "scene_id": 1,
      "duration": 5,
      "audio_script": "测试",
      "subtitle": "测试",
      "video_prompt": "test",
      "story": "test"
    }],
    "original_story": "test",
    "task_id": "check_workflow_test",
    "callback_url": "https://diffusibly-overfanciful-kiara.ngrok-free.dev/api/drama/callback/test"
  }' 2>&1)

echo "响应: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "Workflow was started"; then
    echo "✅ Webhook 可访问，workflow 已触发"
elif echo "$RESPONSE" | grep -q "404"; then
    echo "❌ Webhook 不存在 (404)"
    echo "   可能原因："
    echo "   - workflow 名称不正确"
    echo "   - workflow 未激活"
elif echo "$RESPONSE" | grep -q "500"; then
    echo "❌ n8n 服务器错误 (500)"
    echo "   可能原因："
    echo "   - workflow 配置错误"
    echo "   - n8n 服务异常"
else
    echo "⚠️  未知响应"
fi
echo ""

# 2. 检查 workflow 是否激活
echo "2️⃣  检查 Workflow 状态..."
echo "   需要手动访问 n8n 界面检查："
echo "   👉 http://49.235.210.6:5678"
echo ""
echo "   检查步骤："
echo "   1. 登录 n8n"
echo "   2. 找到 workflow: 'story_final_v2'"
echo "   3. 确认 workflow 右上角的开关是 'ON'（绿色）"
echo "   4. 如果开关是 'OFF'，点击激活"
echo ""

# 3. 查看执行历史
echo "3️⃣  查看执行历史..."
echo "   在 n8n 界面中："
echo "   - 点击 workflow 'story_final_v2'"
echo "   - 查看左侧 'Executions' 标签"
echo "   - 应该能看到最近的执行记录"
echo ""

# 4. 检查回调 URL
echo "4️⃣  检查回调 URL 配置..."
CALLBACK_URL="https://diffusibly-overfanciful-kiara.ngrok-free.dev/api/drama/callback/test"
echo "   回调 URL: $CALLBACK_URL"
echo ""

# 测试回调接口
echo "   测试回调接口..."
CALLBACK_TEST=$(curl -s -X POST "$CALLBACK_URL" \
  -H 'Content-Type: application/json' \
  -d '{"status": "completed", "videoUrl": "http://test.com/video.mp4"}' 2>&1)

if echo "$CALLBACK_TEST" | grep -q "Task not found"; then
    echo "   ✅ 回调接口可访问（任务不存在是正常的）"
elif echo "$CALLBACK_TEST" | grep -q "success"; then
    echo "   ✅ 回调接口正常工作"
else
    echo "   ⚠️  回调接口响应: $CALLBACK_TEST"
fi
echo ""

# 5. 总结
echo "📊 总结"
echo "========"
echo ""
echo "✅ 如果 webhook 返回 'Workflow was started'，说明："
echo "   - n8n 服务器可访问"
echo "   - webhook 端点存在"
echo "   - workflow 可能已触发"
echo ""
echo "⚠️  如果看不到 workflow 运行，可能原因："
echo "   1. workflow 未激活（最常见）"
echo "   2. workflow 在后台运行，需要查看执行历史"
echo "   3. workflow 执行很快完成，已经结束"
echo ""
echo "💡 建议："
echo "   1. 访问 http://49.235.210.6:5678 检查 workflow 状态"
echo "   2. 查看 'Executions' 标签中的执行记录"
echo "   3. 如果 workflow 未激活，点击右上角开关激活"
echo ""





