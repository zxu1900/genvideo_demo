# Webhook 路径说明

## 📋 重要发现

### Workflow 信息

- **Workflow 名称**: `story_final_from_scenes`（在 n8n 界面中显示的名称）
- **Webhook 路径**: `story_final_v2`（在 workflow 内部 webhook 节点配置的路径）

### 后端调用

后端代码调用：
```
POST http://49.235.210.6:5678/webhook/story_final_v2
```

**这是正确的！** ✅

因为 webhook 节点的 path 配置是 `story_final_v2`，所以完整的 webhook URL 是：
```
/webhook/story_final_v2
```

---

## 🔍 为什么看不到 workflow 运行？

### 可能原因

1. **Workflow 未激活** ⚠️（最常见）
   - 在 n8n 界面中，workflow `story_final_from_scenes` 右上角的开关必须是 **ON**（绿色）
   - 如果开关是 OFF（灰色），webhook 不会响应

2. **Webhook 路径不匹配**
   - ✅ 已确认：webhook 路径是 `story_final_v2`
   - ✅ 后端调用：`/webhook/story_final_v2`
   - ✅ 路径匹配正确

3. **Workflow 执行太快**
   - 可能已经执行完成
   - 需要查看 "Executions" 历史记录

---

## ✅ 检查清单

### 在 n8n 界面中：

1. **找到 workflow**
   - 名称：`story_final_from_scenes`
   - 位置：Personal > Workflows

2. **检查激活状态**
   - 打开 workflow
   - 查看右上角开关
   - ✅ 必须是 **ON**（绿色）

3. **检查 webhook 节点**
   - 找到第一个节点（"接收分镜"）
   - 确认 Path: `story_final_v2`
   - 确认 Method: `POST`

4. **查看执行历史**
   - 点击 workflow
   - 查看左侧 "Executions" 标签
   - 应该能看到最近的执行记录

---

## 🧪 测试步骤

### 1. 测试 webhook 是否可访问

```bash
curl -X POST http://49.235.210.6:5678/webhook/story_final_v2 \
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
    "task_id": "test",
    "callback_url": "https://diffusibly-overfanciful-kiara.ngrok-free.dev/api/drama/callback/test"
  }'
```

**预期响应：**
- ✅ `{"message":"Workflow was started"}` = workflow 已触发
- ❌ `404` 或 `not registered` = workflow 未激活

### 2. 提交视频生成任务

```bash
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
```

### 3. 查看执行历史

在 n8n 界面中：
- 打开 workflow `story_final_from_scenes`
- 查看 "Executions" 标签
- 应该能看到新的执行记录

---

## 📝 总结

| 项目 | 值 | 状态 |
|------|-----|------|
| Workflow 名称 | `story_final_from_scenes` | ✅ |
| Webhook 路径 | `story_final_v2` | ✅ |
| 后端调用 | `/webhook/story_final_v2` | ✅ |
| 路径匹配 | 是 | ✅ |
| Workflow 激活 | 需要检查 | ⚠️ |

**下一步：**
1. 访问 n8n 界面：`http://49.235.210.6:5678`
2. 找到 workflow `story_final_from_scenes`
3. 确认右上角开关是 **ON**（绿色）
4. 如果未激活，点击激活
5. 重新测试





