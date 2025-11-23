# Step6 回调逻辑 Review

## 📋 完整流程分析

### 流程概览

```
前端 (Step6)
  │
  ├─ 1. 用户点击 "Generate Video"
  │   └─> POST /api/drama/generate-video
  │       └─> 后端创建任务，调用 n8n webhook
  │           └─> 返回 taskId
  │
  ├─ 2. 前端开始轮询
  │   └─> 每 5 秒: GET /api/drama/task/:taskId
  │       └─> 查询任务状态 (running/completed/failed)
  │
  ├─ 3. n8n workflow 执行（50分钟）
  │   └─> 生成视频
  │       └─> 完成后调用回调
  │           └─> POST /api/drama/callback/:taskId
  │               └─> 后端更新任务状态
  │
  └─ 4. 前端轮询检测到 completed
      └─> 显示视频播放器
```

---

## 🔍 详细代码分析

### 1. 后端回调接口 (`/api/drama/callback/:taskId`)

**位置：** `backend/server.js:671-701`

**代码：**
```javascript
app.post('/api/drama/callback/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { status, videoUrl, error } = req.body;

  const task = videoTasks.get(taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // 更新任务状态
  task.status = status || 'completed';
  task.progress = status === 'completed' ? 100 : (status === 'failed' ? task.progress : 90);
  task.updated_at = new Date().toISOString();

  if (videoUrl) {
    task.result = { videoUrl };
  }

  if (error) {
    task.error = error;
    task.status = 'failed';
  }

  res.json({ success: true, message: 'Task updated' });
});
```

**✅ 优点：**
- 逻辑清晰
- 正确处理 videoUrl
- 正确处理错误情况

**⚠️ 潜在问题：**
1. **任务存储方式**：使用内存 Map (`videoTasks`)，后端重启后任务丢失
2. **没有验证**：没有验证 videoUrl 格式
3. **没有重试机制**：如果回调失败，没有重试

---

### 2. n8n 回调节点配置

**位置：** `backend/n8n/story_final_v2_with_callback.json:481`

**配置：**
```json
{
  "jsonBody": "={\n  \"status\": \"completed\",\n  \"videoUrl\": \"http://49.235.210.6:8001/output/{{ $json.filename || $json.output_filename || 'video.mp4' }}\"\n}"
}
```

**✅ 优点：**
- URL 格式正确
- 有 fallback 值

**⚠️ 潜在问题：**
1. **字段名不确定**：`$json.filename` 或 `$json.output_filename` 可能不存在
2. **硬编码域名**：`http://49.235.210.6:8001` 硬编码在 n8n 中
3. **没有错误处理**：如果视频生成失败，可能没有正确的错误回调

---

### 3. 前端轮询逻辑

**位置：** `frontend/src/pages/portfolio/PortfolioCreate.tsx:55-96`

**代码：**
```javascript
const fetchVideoTaskStatus = useCallback(async () => {
  if (!videoTaskId) return;

  const response = await fetch(`/api/drama/task/${videoTaskId}`);
  const data = await response.json();
  const task = data.task;

  if (task.status === 'completed' && task.result?.videoUrl) {
    setVideoUrl(task.result.videoUrl);
    setVideoProgress(100);
    setIsGeneratingVideo(false);
    clearVideoTaskPolling();
  } else if (task.status === 'failed') {
    setError(task.error || 'Video generation failed');
    setIsGeneratingVideo(false);
    clearVideoTaskPolling();
  } else if (task.status === 'running' || task.status === 'queued') {
    const estimatedProgress = task.progress || (task.status === 'running' ? 50 : 10);
    setVideoProgress(estimatedProgress);
  }
}, [videoTaskId, clearVideoTaskPolling]);
```

**✅ 优点：**
- 逻辑清晰
- 正确处理各种状态
- 自动停止轮询

**⚠️ 潜在问题：**
1. **轮询间隔**：需要查看轮询间隔设置
2. **没有超时处理**：如果任务一直 running，会无限轮询
3. **错误处理**：网络错误时没有重试

---

### 4. 视频显示逻辑

**位置：** `frontend/src/pages/portfolio/PortfolioCreate.tsx:987-996`

**代码：**
```javascript
{videoUrl ? (
  <div className="mb-6">
    <video 
      controls 
      className="max-w-full max-h-96 mx-auto rounded-lg"
      src={videoUrl}
    >
      Your browser does not support the video tag.
    </video>
  </div>
) : (
  <Film className="w-32 h-32 mx-auto text-primary-400 mb-4" />
)}
```

**✅ 优点：**
- 使用标准 HTML5 video 标签
- 有 fallback UI

**⚠️ 潜在问题：**
1. **CORS 问题**：如果视频服务器不允许跨域，可能无法加载
2. **视频格式**：没有检查视频格式是否支持
3. **加载错误处理**：没有处理视频加载失败的情况

---

## 🔴 发现的问题

### 问题 1: n8n 回调 URL 字段名不确定 ⚠️

**问题：**
```json
"videoUrl": "http://49.235.210.6:8001/output/{{ $json.filename || $json.output_filename || 'video.mp4' }}"
```

**风险：**
- 如果 n8n workflow 的输出节点中，文件名字段不是 `filename` 或 `output_filename`，会使用默认值 `'video.mp4'`
- 这会导致视频 URL 错误

**建议：**
- 在 n8n 中确认"合并最终视频"节点的实际输出字段名
- 或者使用更通用的表达式，如 `$json.video_url` 或 `$json.output_file`

---

### 问题 2: 视频 URL 格式硬编码 ⚠️

**问题：**
- n8n 中硬编码了 `http://49.235.210.6:8001/output/`
- 如果视频服务器地址改变，需要修改 n8n workflow

**建议：**
- 使用环境变量或配置
- 或者从 workflow 的输出节点直接获取完整 URL

---

### 问题 3: 没有错误回调机制 ⚠️

**问题：**
- 如果 n8n workflow 执行失败，可能不会调用回调
- 前端会一直轮询，直到超时（如果有超时）

**建议：**
- 在 n8n workflow 中添加错误处理节点
- 错误时也调用回调，设置 `status: "failed"`

---

### 问题 4: 前端轮询没有超时 ⚠️

**问题：**
- 如果任务一直 `running`，前端会无限轮询
- 没有最大轮询次数或超时时间

**建议：**
- 添加最大轮询次数（如 720 次 = 1小时）
- 或添加超时时间（如 2 小时）

---

### 问题 5: 视频 CORS 问题 ⚠️

**问题：**
- 视频服务器 `http://49.235.210.6:8001` 可能不允许跨域访问
- 浏览器可能阻止视频加载

**建议：**
- 检查视频服务器的 CORS 配置
- 或使用代理服务器

---

### 问题 6: 任务存储方式 ⚠️

**问题：**
- 使用内存 Map 存储任务
- 后端重启后，所有任务丢失
- 无法查询历史任务

**建议：**
- 使用数据库存储任务（PostgreSQL）
- 或使用 Redis 等持久化存储

---

## ✅ 正确的部分

1. **回调接口逻辑**：正确处理 status、videoUrl、error
2. **前端轮询逻辑**：正确检测 completed 状态并显示视频
3. **视频显示**：使用标准 HTML5 video 标签
4. **状态管理**：正确更新 progress 和状态

---

## 🎯 关键检查点

### 1. n8n workflow 输出字段

**需要确认：**
- "合并最终视频"节点的输出字段名是什么？
- 是 `filename`、`output_filename`、`video_url` 还是其他？

**检查方法：**
1. 在 n8n 中执行一次 workflow
2. 查看"合并最终视频"节点的输出数据
3. 找到包含文件名的字段

---

### 2. 视频 URL 格式

**当前格式：**
```
http://49.235.210.6:8001/output/{filename}
```

**需要确认：**
- 这个 URL 格式是否正确？
- 视频文件是否真的在这个路径下？
- 服务器是否允许直接访问？

---

### 3. 回调是否会被调用

**需要确认：**
- n8n workflow 是否真的会调用回调？
- 回调节点是否连接到 workflow 的最后？
- workflow 是否激活？

---

## 💡 建议的改进

### 1. 增强 n8n 回调节点

```json
{
  "jsonBody": "={\n  \"status\": \"{{ $json.status || 'completed' }}\",\n  \"videoUrl\": \"{{ $json.video_url || $json.videoUrl || ('http://49.235.210.6:8001/output/' + ($json.filename || $json.output_filename || 'video.mp4')) }}\",\n  \"error\": \"{{ $json.error || null }}\"\n}"
}
```

### 2. 添加前端超时

```javascript
const MAX_POLL_ATTEMPTS = 720; // 1小时 (720 * 5秒)
let pollAttempts = 0;

const fetchVideoTaskStatus = useCallback(async () => {
  pollAttempts++;
  
  if (pollAttempts > MAX_POLL_ATTEMPTS) {
    setError('Video generation timeout (1 hour)');
    setIsGeneratingVideo(false);
    clearVideoTaskPolling();
    return;
  }
  
  // ... 现有逻辑
}, [videoTaskId, clearVideoTaskPolling]);
```

### 3. 添加视频加载错误处理

```javascript
<video 
  controls 
  className="max-w-full max-h-96 mx-auto rounded-lg"
  src={videoUrl}
  onError={(e) => {
    console.error('Video load error:', e);
    setError('Failed to load video. Please check the video URL.');
  }}
>
  Your browser does not support the video tag.
</video>
```

---

## 📊 总结

| 项目 | 状态 | 说明 |
|------|------|------|
| **回调接口逻辑** | ✅ 正确 | 能正确处理回调并更新状态 |
| **前端轮询逻辑** | ✅ 正确 | 能正确检测 completed 状态 |
| **视频显示逻辑** | ✅ 正确 | 使用标准 video 标签 |
| **n8n 回调配置** | ⚠️ 需确认 | 字段名可能不正确 |
| **视频 URL 格式** | ⚠️ 需确认 | 硬编码，可能有问题 |
| **错误处理** | ⚠️ 不完善 | 缺少超时和错误回调 |
| **任务持久化** | ⚠️ 需改进 | 内存存储，重启丢失 |

**关键问题：**
1. ⚠️ n8n 回调节点中的字段名需要确认
2. ⚠️ 视频 URL 格式需要验证
3. ⚠️ 需要添加超时和错误处理

**建议：**
1. 先在 n8n 中测试一次完整的 workflow，确认输出字段
2. 测试视频 URL 是否可以正常访问
3. 添加超时和错误处理机制




