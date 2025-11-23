# n8n 回调机制 Review 与修复方案

## 🔍 问题诊断

### 1. 回调地址配置错误 ❌

**当前配置：**
```bash
BACKEND_URL=http://127.0.0.1:3001
PORT=3002
```

**问题：**
- 端口不匹配：服务器运行在 3002，但回调地址是 3001
- 127.0.0.1 无法从远程 n8n 服务器访问
- n8n 在 49.235.210.6，无法访问本地回环地址

**本地 IP：** `192.168.2.156`

### 2. 网络可达性问题 ❌

n8n 服务器（49.235.210.6）需要能够访问你的本地服务器（192.168.2.156:3002），但可能存在：
- 防火墙拦截
- NAT 网络限制
- 端口未开放

### 3. n8n 工作流节点连接问题 ⚠️

回调节点可能未正确连接到工作流的最后一个节点。

---

## ✅ 修复方案

### 方案 A：修复回调地址（推荐用于内网测试）

#### Step 1: 修改环境变量

```bash
cd /home/frankyxu/Code/video/first_book_v2/backend

# 备份原配置
cp .env .env.backup

# 修改配置
cat > .env << 'EOF'
# Server
PORT=3002
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=writetalent
DB_USER=writetalent_user
DB_PASSWORD=writetalent2024

# n8n Configuration
N8N_BASE_URL=http://49.235.210.6:5678

# Backend URL - 使用本地 IP，让 n8n 可以回调
BACKEND_URL=http://192.168.2.156:3002

# Email (update these if needed)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOF
```

#### Step 2: 确保端口开放

```bash
# 检查防火墙状态
sudo ufw status

# 如果需要开放 3002 端口
sudo ufw allow 3002/tcp

# 或者临时关闭防火墙（仅测试）
sudo ufw disable
```

#### Step 3: 测试网络可达性

```bash
# 在你的机器上测试 n8n 是否可以访问你的服务器
# 从 n8n 服务器执行（需要 SSH 到 49.235.210.6）:
curl -X POST http://192.168.2.156:3002/api/drama/callback/test_task \
  -H 'Content-Type: application/json' \
  -d '{"status": "completed", "videoUrl": "http://test.com/video.mp4"}'
```

⚠️ **如果 n8n 服务器和你的开发机不在同一内网，需要使用方案 B**

---

### 方案 B：使用 ngrok 暴露本地服务（推荐用于跨网络测试）

#### Step 1: 安装 ngrok

```bash
# 下载 ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# 或使用 snap
sudo snap install ngrok
```

#### Step 2: 启动 ngrok

```bash
# 暴露本地 3002 端口
ngrok http 3002
```

输出示例：
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3002
```

#### Step 3: 修改环境变量

```bash
# 使用 ngrok 提供的公网 URL
BACKEND_URL=https://abc123.ngrok.io
```

#### Step 4: 重启后端服务

```bash
cd /home/frankyxu/Code/video/first_book_v2/backend
pkill -f "node server.js"
npm start &
```

---

### 方案 C：轮询 n8n 执行状态（替代回调方案）

如果回调始终有问题，可以改用轮询方式：

#### 在后端添加轮询逻辑：

```javascript
// 在 server.js 中添加

// n8n API 配置
const N8N_API_BASE = process.env.N8N_BASE_URL || 'http://49.235.210.6:5678';
const N8N_API_KEY = process.env.N8N_API_KEY; // 需要在 n8n 中生成 API key

// 轮询 n8n 执行状态
async function pollN8nExecution(executionId, taskId) {
  const maxAttempts = 720; // 720 * 5秒 = 1小时
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;
    
    try {
      const response = await axios.get(
        `${N8N_API_BASE}/api/v1/executions/${executionId}`,
        {
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY
          }
        }
      );

      const execution = response.data;
      const task = videoTasks.get(taskId);
      
      if (!task) {
        clearInterval(interval);
        return;
      }

      // 更新进度
      if (execution.finished) {
        clearInterval(interval);
        
        if (execution.status === 'success') {
          // 从执行结果中提取视频 URL
          const videoUrl = extractVideoUrlFromExecution(execution);
          task.status = 'completed';
          task.progress = 100;
          task.result = { videoUrl };
          task.updated_at = new Date().toISOString();
          console.log(`✅ [Poll] Task ${taskId} completed: ${videoUrl}`);
        } else {
          task.status = 'failed';
          task.error = execution.error || 'n8n execution failed';
          task.updated_at = new Date().toISOString();
          console.error(`❌ [Poll] Task ${taskId} failed`);
        }
      } else {
        // 更新进度（根据执行节点估算）
        task.progress = Math.min(90, 10 + (attempts * 0.5));
        task.updated_at = new Date().toISOString();
      }
      
    } catch (error) {
      console.error(`⚠️  [Poll] Error checking execution ${executionId}:`, error.message);
    }

    // 超时处理
    if (attempts >= maxAttempts) {
      clearInterval(interval);
      const task = videoTasks.get(taskId);
      if (task && task.status === 'running') {
        task.status = 'failed';
        task.error = 'Execution timeout (1 hour)';
        task.updated_at = new Date().toISOString();
        console.error(`❌ [Poll] Task ${taskId} timeout`);
      }
    }
  }, 5000); // 每 5 秒轮询一次
}

// 辅助函数：从执行结果中提取视频 URL
function extractVideoUrlFromExecution(execution) {
  // 查找最后一个成功节点的输出
  const nodes = execution.data?.resultData?.runData || {};
  
  // 尝试从 "合并最终视频" 或类似节点获取 URL
  for (const [nodeName, runs] of Object.entries(nodes)) {
    if (nodeName.includes('合并') || nodeName.includes('最终')) {
      const lastRun = runs[runs.length - 1];
      const data = lastRun?.data?.main?.[0]?.[0]?.json;
      
      if (data?.filename) {
        return `http://49.235.210.6:8001/output/${data.filename}`;
      }
      if (data?.video_url) {
        return data.video_url;
      }
    }
  }
  
  return 'http://49.235.210.6:8001/output/video.mp4'; // 默认值
}
```

#### 修改视频生成 API：

```javascript
// 在 n8n 返回后启动轮询
const n8nResponse = await axios.post(n8nWebhookUrl, {...});

task.n8n_execution_id = n8nResponse.data?.executionId || 'unknown';

// 如果有执行 ID，启动轮询
if (task.n8n_execution_id !== 'unknown') {
  pollN8nExecution(task.n8n_execution_id, taskId);
  console.log(`🔄 Started polling for execution ${task.n8n_execution_id}`);
}
```

---

## 🧪 快速测试方案

### 测试 1: 手动模拟回调（验证后端接口）

```bash
# 测试回调接口是否正常工作
curl -X POST http://localhost:3002/api/drama/callback/test_task_123 \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "videoUrl": "http://49.235.210.6:8001/output/test_video.mp4"
  }'

# 预期输出:
# {"success":true,"message":"Task updated"}
```

### 测试 2: 创建 Mock 视频任务

创建测试脚本 `test_video_generation.sh`：

```bash
#!/bin/bash

cd /home/frankyxu/Code/video/first_book_v2/backend

# 1. 提交视频生成任务
echo "📤 Submitting video generation task..."
RESPONSE=$(curl -s -X POST http://localhost:3002/api/drama/generate-video \
  -H 'Content-Type: application/json' \
  -d '{
    "scenes": [
      {
        "id": 1,
        "durationSeconds": 5,
        "story": "测试场景1",
        "voicePrompt": "这是第一个测试场景",
        "videoPrompt": "a beautiful landscape",
        "imagePrompt": "landscape photo"
      }
    ]
  }')

echo "Response: $RESPONSE"

# 提取 taskId
TASK_ID=$(echo $RESPONSE | jq -r '.taskId')
echo "✅ Task ID: $TASK_ID"

# 2. 等待 10 秒
echo "⏳ Waiting 10 seconds..."
sleep 10

# 3. 手动触发回调（模拟 n8n 完成）
echo "📞 Simulating n8n callback..."
curl -X POST "http://localhost:3002/api/drama/callback/$TASK_ID" \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "videoUrl": "http://49.235.210.6:8001/output/mock_video.mp4"
  }'

echo ""
echo "✅ Callback sent"

# 4. 查询任务状态
echo "🔍 Checking task status..."
curl -s "http://localhost:3002/api/drama/task/$TASK_ID" | jq .

echo ""
echo "✅ Test completed"
```

运行测试：

```bash
chmod +x test_video_generation.sh
./test_video_generation.sh
```

### 测试 3: 使用 Mock n8n（跳过视频生成，快速测试）

创建 mock 端点，直接返回成功：

```javascript
// 在 server.js 中添加 mock 端点
app.post('/api/drama/generate-video-mock', async (req, res) => {
  const { scenes } = req.body;
  const taskId = `video_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const task = {
    id: taskId,
    type: 'video',
    status: 'running',
    progress: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    n8n_execution_id: 'mock',
    result: null,
    error: null
  };
  
  videoTasks.set(taskId, task);
  
  // 5 秒后自动完成
  setTimeout(() => {
    task.status = 'completed';
    task.progress = 100;
    task.result = {
      videoUrl: 'http://49.235.210.6:8001/output/mock_video.mp4'
    };
    task.updated_at = new Date().toISOString();
    console.log(`✅ [Mock] Task ${taskId} completed`);
  }, 5000);
  
  res.json({
    success: true,
    taskId: taskId,
    status: task.status,
    message: 'Mock 视频生成任务（5秒后自动完成）'
  });
});
```

前端可以暂时调用这个 mock 接口进行快速测试。

---

## 📊 最佳实践建议

### 1. 混合方案（推荐）

结合回调和轮询，提供最佳可靠性：

```javascript
// 视频生成流程
const n8nResponse = await axios.post(n8nWebhookUrl, {
  scenes: mappedScenes,
  callback_url: callbackUrl  // 尝试回调
});

// 同时启动轮询作为备份
if (n8nResponse.data?.executionId) {
  setTimeout(() => {
    // 5 分钟后开始轮询（给回调充足时间）
    const task = videoTasks.get(taskId);
    if (task && task.status === 'running') {
      pollN8nExecution(n8nResponse.data.executionId, taskId);
    }
  }, 300000); // 5 分钟
}
```

### 2. 超时处理

```javascript
// 在任务创建时设置超时标记
task.timeout_at = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2小时

// 定期清理超时任务
setInterval(() => {
  const now = Date.now();
  for (const [taskId, task] of videoTasks.entries()) {
    if (task.status === 'running' && new Date(task.timeout_at) < now) {
      task.status = 'failed';
      task.error = 'Task timeout (2 hours)';
      task.updated_at = new Date().toISOString();
      console.warn(`⏰ Task ${taskId} marked as timeout`);
    }
  }
}, 60000); // 每分钟检查一次
```

### 3. 错误重试机制

在 n8n 回调节点配置重试：
- Retry On Fail: 启用
- Max Tries: 3
- Wait Between Tries: 5000ms

### 4. 监控和日志

```javascript
// 增强日志记录
console.log(`📞 [Callback] URL: ${callbackUrl}`);
console.log(`📡 [n8n] Webhook: ${n8nWebhookUrl}`);
console.log(`🆔 [Task] ID: ${taskId}, Execution: ${executionId}`);

// 记录到文件
const fs = require('fs');
fs.appendFileSync('/tmp/video_tasks.log', 
  `${new Date().toISOString()} | ${taskId} | ${status} | ${callbackUrl}\n`
);
```

---

## 🔧 立即行动

### 优先级 1: 修复回调地址 ⚡

```bash
cd /home/frankyxu/Code/video/first_book_v2/backend

# 修改 .env
nano .env

# 修改这一行:
BACKEND_URL=http://192.168.2.156:3002

# 重启服务
pkill -f "node server.js"
npm start &

# 测试回调
curl -X POST http://192.168.2.156:3002/api/drama/callback/test \
  -H 'Content-Type: application/json' \
  -d '{"status": "completed", "videoUrl": "http://test.com/video.mp4"}'
```

### 优先级 2: 验证 n8n 工作流 ⚡

1. 访问 n8n: http://49.235.210.6:5678
2. 打开 `story_final_v2` workflow
3. 检查"回调后端通知完成"节点是否：
   - 连接到最后一个节点
   - URL 配置正确：`{{ $('接收分镜').item.json.body.callback_url }}`
   - Headers 包含 `Content-Type: application/json`

### 优先级 3: 添加 Mock 测试 ⚡

快速验证整个流程，无需等待 50 分钟。

---

## 📝 总结

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **回调方案** | 实时通知、资源高效 | 需要网络可达 | 生产环境 |
| **轮询方案** | 无需网络可达 | 资源消耗大 | 测试环境 |
| **混合方案** | 可靠性高 | 实现复杂 | 推荐使用 |
| **Mock 测试** | 快速验证 | 不是真实场景 | 开发调试 |

**推荐做法：**
1. ✅ 先修复回调地址配置
2. ✅ 添加 Mock 测试快速验证流程
3. ✅ 实施混合方案（回调 + 轮询备份）
4. ✅ 完善监控和超时处理





