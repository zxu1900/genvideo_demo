# n8n Workflow 故障排查指南

## 🔍 问题：看不到 n8n workflow 在运行

### 当前状态

✅ **Webhook 已触发**
- 后端成功调用了 n8n webhook
- n8n 返回：`{"message":"Workflow was started"}`
- 说明 workflow 已经被触发

⚠️ **但看不到 workflow 运行**

---

## 📋 排查步骤

### 1. 检查 Workflow 是否激活 ⚡（最重要）

**访问 n8n 界面：**
```
http://49.235.210.6:5678
```

**检查步骤：**
1. 登录 n8n
2. 在左侧菜单找到 workflow: **`story_final_v2`**
3. **检查右上角的开关**：
   - ✅ **绿色 ON** = workflow 已激活，可以接收 webhook
   - ❌ **灰色 OFF** = workflow 未激活，**需要点击激活**

**如果开关是 OFF：**
- 点击开关，将其切换到 **ON**
- 保存 workflow
- 重新测试

---

### 2. 查看执行历史

**在 n8n 界面中：**
1. 点击 workflow `story_final_v2`
2. 查看左侧 **"Executions"** 标签
3. 应该能看到最近的执行记录

**执行记录会显示：**
- ✅ **Success** (绿色) = 执行成功
- ⏳ **Running** (黄色) = 正在运行
- ❌ **Error** (红色) = 执行失败
- ⏸️ **Waiting** (灰色) = 等待中

**如果看不到执行记录：**
- workflow 可能未激活
- 或者执行太快，已经完成

---

### 3. 检查 Workflow 配置

**确认 webhook 节点配置：**
1. 打开 workflow `story_final_v2`
2. 找到第一个节点（通常是 "接收分镜" 或 "Webhook"）
3. 检查：
   - ✅ **Path**: `/story_final_v2`
   - ✅ **HTTP Method**: `POST`
   - ✅ **Response Mode**: `When Last Node Finishes` 或 `Immediately`

**确认回调节点配置：**
1. 找到最后一个节点（"回调后端通知完成"）
2. 检查：
   - ✅ **URL**: `{{ $('接收分镜').item.json.body.callback_url }}`
   - ✅ **Method**: `POST`
   - ✅ **Body**: 包含 `status` 和 `videoUrl`

---

### 4. 实时监控 Workflow 执行

**方法 1: n8n 界面监控**
1. 打开 workflow
2. 点击右上角 **"Execute Workflow"** 手动测试
3. 观察节点执行情况（绿色=成功，红色=失败）

**方法 2: 查看后端日志**
```bash
tail -f /tmp/writetalent_server.log | grep -E "n8n|Callback|Step6"
```

**方法 3: 查看 ngrok 请求日志**
1. 访问：`http://127.0.0.1:4040`
2. 查看所有通过 ngrok 的请求
3. 如果看到来自 n8n 的回调请求，说明 workflow 已完成

---

## 🎯 常见问题

### Q1: Webhook 返回 "Workflow was started" 但看不到执行？

**A:** 可能原因：
1. **Workflow 未激活**（最常见）
   - 解决：在 n8n 界面激活 workflow
2. **执行太快已完成**
   - 解决：查看 "Executions" 历史记录
3. **执行失败但未显示**
   - 解决：查看执行历史中的错误信息

---

### Q2: 如何确认 workflow 真的在运行？

**A:** 检查方法：

1. **查看执行历史**
   ```bash
   # 访问 n8n 界面
   http://49.235.210.6:5678
   # 查看 Executions 标签
   ```

2. **查看后端日志**
   ```bash
   tail -f /tmp/writetalent_server.log
   # 应该看到回调请求
   ```

3. **查看 ngrok 日志**
   ```bash
   # 访问
   http://127.0.0.1:4040
   # 查看请求历史
   ```

---

### Q3: Workflow 执行了但没有回调？

**A:** 可能原因：

1. **回调节点配置错误**
   - 检查 URL 表达式是否正确
   - 检查 Body 格式是否正确

2. **网络问题**
   - n8n 无法访问 ngrok URL
   - 检查 ngrok 是否运行：`./ngrok_manage.sh status`

3. **回调节点执行失败**
   - 在 n8n 执行历史中查看错误信息
   - 检查回调节点的错误日志

---

### Q4: 如何测试完整的流程？

**A:** 使用测试脚本：

```bash
# 1. 提交视频生成任务
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

# 2. 获取 taskId（从响应中）

# 3. 查询任务状态
curl http://localhost:3002/api/drama/task/<taskId>

# 4. 在 n8n 中查看执行历史

# 5. 等待 workflow 完成（或手动模拟回调）
```

---

## 🚀 快速检查清单

- [ ] n8n 服务器可访问：`http://49.235.210.6:5678`
- [ ] Workflow `story_final_v2` 已激活（开关是 ON）
- [ ] Webhook 路径正确：`/webhook/story_final_v2`
- [ ] 后端服务运行中：`curl http://localhost:3002/api/health`
- [ ] ngrok 运行中：`./ngrok_manage.sh status`
- [ ] 回调 URL 可访问：`curl https://你的ngrok地址/api/health`
- [ ] 查看 n8n 执行历史中有新记录

---

## 📝 下一步行动

1. **立即检查**：访问 `http://49.235.210.6:5678`，确认 workflow 是否激活
2. **查看执行历史**：在 n8n 界面查看是否有执行记录
3. **如果未激活**：点击开关激活 workflow
4. **重新测试**：再次提交视频生成任务

---

## 🔧 调试工具

已创建的脚本：
- `check_n8n_workflow.sh` - 检查 workflow 状态
- `ngrok_manage.sh` - 管理 ngrok
- `test_video_callback.sh` - 测试回调机制

使用方法：
```bash
cd /home/frankyxu/Code/video/first_book_v2/backend
./check_n8n_workflow.sh
```





