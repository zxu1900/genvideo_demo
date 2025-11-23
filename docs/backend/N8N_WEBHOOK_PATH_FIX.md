# n8n Webhook 路径修复

## ❌ 问题

**错误信息：**
```
500 Internal Server Error
"Request failed with status code 404"
"n8n 视频生成服务暂时不可用"
```

**原因：**
- 后端代码使用了错误的 webhook 路径：`/webhook/story_final_from_scenes`
- 实际的 webhook 路径是：`/webhook/story_final_v2`
- 导致 n8n 返回 404 错误

---

## ✅ 修复

**已修复代码：**
```javascript
// 修复前（错误）
const n8nWebhookUrl = `${process.env.N8N_BASE_URL}/webhook/story_final_from_scenes`;

// 修复后（正确）
const n8nWebhookUrl = `${process.env.N8N_BASE_URL}/webhook/story_final_v2`;
```

**说明：**
- Workflow 名称：`story_final_from_scenes`（在 n8n 界面中显示）
- Webhook 路径：`story_final_v2`（在 workflow 内部配置的路径）
- 后端应该使用 webhook 路径，不是 workflow 名称

---

## 🔍 验证

### 测试错误的路径（应该返回 404）
```bash
curl -X POST http://49.235.210.6:5678/webhook/story_final_from_scenes \
  -H 'Content-Type: application/json' \
  -d '{"test":"test"}'

# 返回: {"code":404,"message":"The requested webhook \"POST story_final_from_scenes\" is not registered."}
```

### 测试正确的路径（应该返回成功）
```bash
curl -X POST http://49.235.210.6:5678/webhook/story_final_v2 \
  -H 'Content-Type: application/json' \
  -d '{"test":"test"}'

# 返回: {"message":"Workflow was started"}
```

---

## 🚀 重启后端

修复后需要重启后端服务：

```bash
cd /home/frankyxu/Code/video/first_book_v2/backend

# 停止服务
pkill -f "node server.js"

# 等待
sleep 2

# 启动服务
npm start > /tmp/writetalent_server.log 2>&1 &
```

---

## ✅ 验证修复

### 1. 检查后端服务
```bash
curl http://localhost:3002/api/health
# 应该返回: {"status":"OK",...}
```

### 2. 测试视频生成 API
```bash
curl -X POST http://localhost:3002/api/drama/generate-video \
  -H 'Content-Type: application/json' \
  -d '{
    "scenes": [{
      "id": 1,
      "durationSeconds": 5,
      "story": "测试",
      "voicePrompt": "测试语音",
      "videoPrompt": "test",
      "imagePrompt": "test"
    }]
  }'

# 应该返回成功，不再出现 404 错误
```

### 3. 在前端测试
- 打开前端页面
- 进入 Step6: 生成视频
- 点击 "Generate Video"
- 应该不再出现 500 错误

---

## 📝 总结

| 项目 | 值 | 说明 |
|------|-----|------|
| **Workflow 名称** | `story_final_from_scenes` | n8n 界面中显示的名称 |
| **Webhook 路径** | `story_final_v2` | 实际使用的路径 |
| **后端调用** | `/webhook/story_final_v2` | ✅ 已修复 |

**关键点：**
- Webhook 路径 ≠ Workflow 名称
- 后端应该使用 webhook 路径
- 路径在 workflow 的 webhook 节点中配置

---

## 🔧 如果还有问题

1. **检查 workflow 是否激活**
   - 访问：http://49.235.210.6:5678
   - 找到 workflow `story_final_from_scenes`
   - 确认右上角开关是 **ON**（绿色）

2. **查看后端日志**
   ```bash
   tail -f /tmp/writetalent_server.log | grep -E "n8n|webhook|Step6"
   ```

3. **测试 webhook 直接调用**
   ```bash
   curl -X POST http://49.235.210.6:5678/webhook/story_final_v2 \
     -H 'Content-Type: application/json' \
     -d '{"scenes":[{"scene_id":1,"duration":5,"audio_script":"test"}],"callback_url":"http://test.com/callback"}'
   ```




