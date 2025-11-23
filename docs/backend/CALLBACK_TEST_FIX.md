# 回调测试问题修复

## ❌ 遇到的问题

### 问题 1: 任务未找到
```
⚠️  Task video_test_123 not found for callback
```

**原因：**
- 直接回调了一个不存在的任务 ID `video_test_123`
- 任务必须先创建，然后才能回调

### 问题 2: 变量未设置
```bash
curl "http://localhost:3002/api/drama/task/$TASK_ID"
# 结果: Cannot GET /api/drama/task/
```

**原因：**
- `$TASK_ID` 变量未设置
- 导致 URL 变成了 `/api/drama/task/`（空）

---

## ✅ 正确的测试流程

### 方法 1: 使用测试脚本（推荐）

```bash
cd /home/frankyxu/Code/video/first_book_v2/backend
./test_callback_simple.sh
```

这个脚本会：
1. ✅ 自动创建任务
2. ✅ 提取 taskId
3. ✅ 模拟回调
4. ✅ 验证状态更新

### 方法 2: 手动测试（分步执行）

#### 步骤 1: 创建任务
```bash
# 创建任务并保存响应
RESPONSE=$(curl -s -X POST http://localhost:3002/api/drama/generate-video-mock \
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

# 提取 taskId（如果有 jq）
TASK_ID=$(echo "$RESPONSE" | jq -r '.taskId')

# 或者手动提取（如果没有 jq）
# TASK_ID=$(echo "$RESPONSE" | grep -o '"taskId":"[^"]*"' | cut -d'"' -f4)

echo "Task ID: $TASK_ID"
```

#### 步骤 2: 查询任务状态
```bash
# 确保 TASK_ID 已设置
if [ -z "$TASK_ID" ]; then
  echo "❌ TASK_ID 未设置"
  exit 1
fi

curl "http://localhost:3002/api/drama/task/$TASK_ID"
```

#### 步骤 3: 模拟回调
```bash
# 确保 TASK_ID 已设置
curl -X POST "http://localhost:3002/api/drama/callback/$TASK_ID" \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "videoUrl": "http://49.235.210.6:8001/output/test_video.mp4"
  }'
```

#### 步骤 4: 验证状态
```bash
curl "http://localhost:3002/api/drama/task/$TASK_ID"
# 应该返回 status: "completed"
```

---

## 🔍 调试技巧

### 1. 检查任务是否存在

```bash
# 列出所有任务（需要后端支持，或查看日志）
tail -f /tmp/writetalent_server.log | grep "Task.*created"
```

### 2. 查看回调日志

```bash
tail -f /tmp/writetalent_server.log | grep -E "Callback|task"
```

### 3. 测试回调接口（不存在的任务）

```bash
# 这会返回 404，但可以验证接口是否工作
curl -X POST "http://localhost:3002/api/drama/callback/nonexistent_task" \
  -H 'Content-Type: application/json' \
  -d '{"status": "completed", "videoUrl": "http://test.com/video.mp4"}'

# 预期响应: {"error":"Task not found"}
```

---

## 📝 常见错误

### 错误 1: 任务未找到
```
⚠️  Task xxx not found for callback
```

**解决：**
- 确保先创建任务
- 使用正确的 taskId
- 检查任务是否已过期（内存任务可能重启后丢失）

### 错误 2: 变量未设置
```bash
curl "http://localhost:3002/api/drama/task/$TASK_ID"
# 结果: Cannot GET /api/drama/task/
```

**解决：**
- 先设置 `TASK_ID` 变量
- 或直接使用具体的 taskId
- 使用测试脚本自动处理

### 错误 3: 任务已过期
```
⚠️  Task xxx not found for callback
```

**原因：**
- 后端重启后，内存中的任务丢失
- 任务 TTL 过期

**解决：**
- 重新创建任务
- 或使用数据库持久化（如果已实现）

---

## 🎯 快速测试命令

### 一行命令测试（需要 jq）

```bash
TASK_ID=$(curl -s -X POST http://localhost:3002/api/drama/generate-video-mock \
  -H 'Content-Type: application/json' \
  -d '{"scenes":[{"id":1,"durationSeconds":5,"story":"test","voicePrompt":"test","videoPrompt":"test","imagePrompt":"test"}]}' \
  | jq -r '.taskId') && \
echo "Task ID: $TASK_ID" && \
curl -X POST "http://localhost:3002/api/drama/callback/$TASK_ID" \
  -H 'Content-Type: application/json' \
  -d '{"status":"completed","videoUrl":"http://test.com/video.mp4"}' && \
sleep 1 && \
curl "http://localhost:3002/api/drama/task/$TASK_ID" | jq .
```

### 使用测试脚本（最简单）

```bash
cd /home/frankyxu/Code/video/first_book_v2/backend
./test_callback_simple.sh
```

---

## 💡 最佳实践

1. **总是先创建任务**
   - 不要直接使用硬编码的 taskId
   - 使用 Mock 接口快速创建

2. **保存 taskId**
   - 使用变量保存：`TASK_ID=xxx`
   - 或使用脚本自动提取

3. **验证任务存在**
   - 回调前先查询任务状态
   - 确保任务 ID 正确

4. **使用测试脚本**
   - 自动化整个流程
   - 减少手动错误

---

## 📚 相关文件

- `test_callback_simple.sh` - 简单测试脚本
- `test_video_callback.sh` - 完整测试脚本
- `server.js` - 后端服务（回调接口在 `/api/drama/callback/:taskId`）




