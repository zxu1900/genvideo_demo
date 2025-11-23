# 快速测试指南

## 🤔 需要启动 ComfyUI 吗？

### 答案：取决于你要测试什么

#### ✅ **不需要 ComfyUI 的情况：**

1. **测试 n8n 回调机制**
   - 使用 Mock 接口：`/api/drama/generate-video-mock`
   - 5秒内完成，无需等待真实视频生成
   - 不需要 ComfyUI，不需要 n8n workflow 真正执行

2. **测试后端 API 逻辑**
   - 测试任务创建、状态查询、回调接收
   - 这些都不依赖 ComfyUI

#### ⚠️ **需要 ComfyUI 的情况：**

1. **Step2: 生成故事图片**
   - 后端直接调用 ComfyUI 生成图片
   - 需要 ComfyUI 服务运行在：`http://117.50.193.105:8188`（默认）

2. **Step6: 完整视频生成流程**
   - n8n workflow 内部会调用 ComfyUI API
   - n8n 中的 ComfyUI 地址：`http://comfyui_api:8001`
   - 这是 n8n 服务器内部的地址，不是你本地需要启动的

---

## 🚀 快速测试方法

### 方法 1: Mock 接口（最快，推荐用于开发调试）

#### 测试视频生成回调机制（5秒完成）

```bash
# 1. 提交 Mock 视频生成任务
curl -X POST http://localhost:3002/api/drama/generate-video-mock \
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
  }'

# 响应示例：
# {
#   "success": true,
#   "taskId": "video_mock_1763793555810_xxx",
#   "status": "running",
#   "message": "Mock 视频生成任务已创建（5秒后自动完成）"
# }

# 2. 等待 5 秒，然后查询任务状态
sleep 6
curl http://localhost:3002/api/drama/task/<taskId>

# 应该返回：
# {
#   "status": "completed",
#   "progress": 100,
#   "result": {
#     "videoUrl": "http://49.235.210.6:8001/output/mock_final_video.mp4"
#   }
# }
```

**优点：**
- ✅ 5秒完成，无需等待
- ✅ 不需要 ComfyUI
- ✅ 不需要 n8n workflow 真正执行
- ✅ 可以快速验证前端流程

**缺点：**
- ❌ 不是真实的视频生成
- ❌ 无法测试 n8n workflow 逻辑

---

### 方法 2: 测试 n8n Webhook 调用（不等待完成）

```bash
# 1. 提交真实视频生成任务
curl -X POST http://localhost:3002/api/drama/generate-video \
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
  }'

# 2. 获取 taskId

# 3. 检查后端日志，确认 n8n webhook 被调用
tail -f /tmp/writetalent_server.log | grep -E "n8n|webhook"

# 应该看到：
# 📡 Calling n8n webhook: http://49.235.210.6:5678/webhook/story_final_v2
# ✅ n8n workflow triggered, execution ID: unknown

# 4. 在 n8n 界面查看执行历史
# http://49.235.210.6:5678
# 打开 workflow: story_final_from_scenes
# 查看 "Executions" 标签
```

**优点：**
- ✅ 测试真实的 n8n webhook 调用
- ✅ 可以验证 workflow 是否被触发

**缺点：**
- ⚠️ 需要等待 workflow 执行（可能需要很长时间）
- ⚠️ 如果 workflow 未激活，看不到执行

---

### 方法 3: 手动模拟回调（测试回调机制）

```bash
# 1. 先创建一个任务（使用 Mock 或真实接口）
TASK_ID="video_test_123"

# 2. 手动模拟 n8n 回调
curl -X POST "http://localhost:3002/api/drama/callback/$TASK_ID" \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "videoUrl": "http://49.235.210.6:8001/output/test_video.mp4"
  }'

# 3. 查询任务状态，应该变成 completed
curl "http://localhost:3002/api/drama/task/$TASK_ID"
```

**优点：**
- ✅ 快速测试回调机制
- ✅ 不需要等待 workflow 执行

---

## 📊 测试场景对比

| 测试场景 | 需要 ComfyUI | 需要 n8n | 耗时 | 推荐场景 |
|---------|-------------|----------|------|---------|
| **Mock 接口** | ❌ | ❌ | 5秒 | 前端流程测试 |
| **n8n Webhook** | ❌ | ✅ | 立即返回 | Webhook 调用测试 |
| **完整流程** | ✅ | ✅ | 50分钟+ | 端到端测试 |
| **手动回调** | ❌ | ❌ | 1秒 | 回调机制测试 |

---

## 🎯 我的快速测试流程

### 1. 测试后端服务

```bash
# 健康检查
curl http://localhost:3002/api/health

# 应该返回：
# {"status":"OK","message":"WriteTalent API is running!","database":"connected"}
```

### 2. 测试回调机制（最快）

```bash
# 使用测试脚本
cd /home/frankyxu/Code/video/first_book_v2/backend
./test_video_callback.sh
```

这个脚本会：
- ✅ 创建测试任务
- ✅ 模拟 n8n 回调
- ✅ 验证任务状态更新
- ✅ 全部在几秒内完成

### 3. 测试 n8n Webhook 调用

```bash
# 直接测试 webhook
curl -X POST http://49.235.210.6:5678/webhook/story_final_v2 \
  -H 'Content-Type: application/json' \
  -d '{
    "scenes": [{"scene_id": 1, "duration": 5, "audio_script": "test"}],
    "callback_url": "https://diffusibly-overfanciful-kiara.ngrok-free.dev/api/drama/callback/test"
  }'

# 如果返回 {"message":"Workflow was started"}，说明 webhook 可访问
```

### 4. 查看日志

```bash
# 后端日志
tail -f /tmp/writetalent_server.log

# ngrok 请求日志（浏览器）
# http://127.0.0.1:4040
```

---

## 🔧 ComfyUI 配置说明

### 当前配置

**Step2 图片生成（后端直接调用）：**
- 默认地址：`http://117.50.193.105:8188`
- 环境变量：`COMFYUI_BASE_URL`

**Step6 视频生成（n8n 内部调用）：**
- n8n 中的地址：`http://comfyui_api:8001`
- 这是 n8n 服务器内部的 Docker 网络地址
- **你本地不需要启动 ComfyUI**

### 如果需要本地测试 ComfyUI

```bash
# 1. 启动 ComfyUI（假设在 8188 端口）
# 2. 更新 .env
COMFYUI_BASE_URL=http://localhost:8188

# 3. 重启后端
pkill -f "node server.js"
npm start &
```

---

## 📝 总结

### 快速测试（推荐）

1. ✅ **使用 Mock 接口**：`/api/drama/generate-video-mock`
   - 5秒完成
   - 不需要 ComfyUI
   - 不需要 n8n workflow 执行

2. ✅ **使用测试脚本**：`./test_video_callback.sh`
   - 自动完成所有测试
   - 验证回调机制

3. ✅ **查看日志**：`tail -f /tmp/writetalent_server.log`
   - 实时查看后端处理

### 完整测试（需要时间）

1. ⚠️ **真实视频生成**：需要等待 50 分钟+
2. ⚠️ **需要 ComfyUI 运行**（如果测试 Step2 图片生成）
3. ⚠️ **需要 n8n workflow 激活并执行**

---

## 💡 建议

**开发阶段：**
- 使用 Mock 接口快速迭代
- 使用测试脚本验证逻辑
- 不需要启动 ComfyUI

**集成测试：**
- 测试 n8n webhook 调用
- 验证回调机制
- 不需要等待完整执行

**生产验证：**
- 完整流程测试
- 需要 ComfyUI 和 n8n 都正常运行





