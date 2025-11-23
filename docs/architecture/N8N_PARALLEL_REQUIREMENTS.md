# n8n 图像/视频并行生成需求文档

## 📋 需求概述

**目标**：在 n8n 中实现图像和视频的并行生成功能，支持多台 ComfyUI 机器的动态负载均衡

**背景**：
- 当前视频生成是串行的（逐个场景生成）
- 图像生成还没有 n8n workflow
- 需要支持多台 ComfyUI 机器并行处理

---

## 🎯 功能需求

### 需求 1: 图像生成 Workflow

#### 输入格式

```json
{
  "scenes": [
    {
      "id": 1,
      "imagePrompt": "Children book illustration, a cute rabbit in the forest",
      "scene_index": 0
    },
    {
      "id": 2,
      "imagePrompt": "Children book illustration, a wise old owl on the tree",
      "scene_index": 1
    }
  ],
  "task_id": "img_1732345678_abc123",
  "callback_url": "https://backend.example.com/api/ai/image-callback/img_1732345678_abc123"
}
```

**字段说明**：
- `scenes`: 场景数组
  - `id`: 场景 ID
  - `imagePrompt`: 图像生成提示词（必填）
  - `scene_index`: 场景索引（用于排序）
- `task_id`: 任务 ID（由后端生成）
- `callback_url`: 完成后回调的 URL

#### 输出格式（回调）

```json
{
  "status": "completed",
  "task_id": "img_1732345678_abc123",
  "images": [
    {
      "scene_id": 1,
      "scene_index": 0,
      "imageUrl": "http://49.235.210.6:8001/output/story_scene_123_1.png"
    },
    {
      "scene_id": 2,
      "scene_index": 1,
      "imageUrl": "http://49.235.210.6:8001/output/story_scene_123_2.png"
    }
  ],
  "stats": {
    "total_scenes": 2,
    "completed_scenes": 2,
    "failed_scenes": 0,
    "total_time_seconds": 6.5
  }
}
```

**错误回调**：
```json
{
  "status": "failed",
  "task_id": "img_1732345678_abc123",
  "error": "ComfyUI connection failed"
}
```

**部分成功回调**：
```json
{
  "status": "completed_with_errors",
  "task_id": "img_1732345678_abc123",
  "images": [
    {
      "scene_id": 1,
      "scene_index": 0,
      "imageUrl": "http://49.235.210.6:8001/output/story_scene_123_1.png"
    },
    {
      "scene_id": 2,
      "scene_index": 1,
      "imageUrl": null,
      "error": "Image generation timeout"
    }
  ],
  "stats": {
    "total_scenes": 2,
    "completed_scenes": 1,
    "failed_scenes": 1,
    "total_time_seconds": 12.3
  }
}
```

---

### 需求 2: 视频生成 Workflow 升级

#### 当前问题
- 串行处理：逐个场景生成视频
- 总时间 = 场景数 × 单场景时间（约 8 分钟/场景）
- 6 个场景需要 48 分钟

#### 期望改进
- 并行处理：同时生成多个场景视频
- 总时间 = (场景数 / 并行度) × 单场景时间
- 6 个场景，2 台机器，约 24 分钟

#### 输入格式（保持不变）

```json
{
  "scenes": [
    {
      "scene_id": 1,
      "duration": 6,
      "audio_script": "Once upon a time...",
      "subtitle": "Once upon a time...",
      "video_prompt": "A cute rabbit hopping in the forest"
    }
  ],
  "original_story": "Full story text...",
  "task_id": "video_1732345678_xyz789",
  "callback_url": "https://backend.example.com/api/drama/callback/video_1732345678_xyz789"
}
```

#### 输出格式（需要增加统计信息）

**当前**：
```json
{
  "status": "completed",
  "videoUrl": "http://49.235.210.6:8001/output/final_story_video_xxx.mp4"
}
```

**期望**：
```json
{
  "status": "completed",
  "task_id": "video_1732345678_xyz789",
  "videoUrl": "http://49.235.210.6:8001/output/final_story_video_xxx.mp4",
  "stats": {
    "total_scenes": 6,
    "completed_scenes": 6,
    "failed_scenes": 0,
    "total_time_seconds": 1440,
    "video_duration_seconds": 36
  }
}
```

---

## 🏗️ 技术需求

### 需求 3: 动态负载均衡（IP 池）

#### 实现方式

**选项 A: n8n 环境变量 + Python 代码（推荐）**

**配置**：
```bash
# n8n 环境变量
COMFYUI_IMAGE_NODES=http://192.168.1.101:8001,http://192.168.1.102:8001
COMFYUI_VIDEO_NODES=http://192.168.1.103:8001,http://192.168.1.104:8001
```

**实现**：
在 n8n Workflow 中添加 Code 节点（Python）：

```python
import os
import random

# 读取 IP 池
nodes_str = os.environ.get('COMFYUI_IMAGE_NODES', '')
if not nodes_str:
    raise Exception('COMFYUI_IMAGE_NODES 环境变量未设置')

nodes = [n.strip() for n in nodes_str.split(',') if n.strip()]

if not nodes:
    raise Exception('COMFYUI_IMAGE_NODES 为空')

# 负载均衡算法：轮询
scene_index = $json.get('scene_index', 0)
selected_node = nodes[scene_index % len(nodes)]

# 输出
return {
    'comfyui_url': selected_node,
    'scene_data': $json
}
```

**HTTP Request 节点**：
```json
{
  "method": "POST",
  "url": "={{ $json.comfyui_url }}/prompt",
  "body": "={{ $json.scene_data }}"
}
```

**优点**：
- ✅ 实现简单
- ✅ 动态扩容（修改环境变量即可）
- ✅ 轮询分配，公平负载

**缺点**：
- ⚠️ 修改环境变量需要重启 n8n
- ⚠️ 无法感知机器实时负载

---

**选项 B: n8n 内置变量 + 动态读取**

**配置**：
在 n8n Workflow 中添加 Set 节点：

```json
{
  "image_nodes": [
    "http://192.168.1.101:8001",
    "http://192.168.1.102:8001",
    "http://192.168.1.103:8001"
  ],
  "video_nodes": [
    "http://192.168.1.104:8001",
    "http://192.168.1.105:8001"
  ]
}
```

**优点**：
- ✅ 修改 IP 池无需重启 n8n（修改 Workflow 保存即可）
- ✅ 可以在 Workflow 中直接看到配置

**缺点**：
- ⚠️ 每次修改需要保存 Workflow

**推荐**：如果机器 IP 经常变化，使用选项 B；否则使用选项 A

---

### 需求 4: 并行处理

#### 当前实现（串行）

```
[接收分镜] 
  → [Split In Batches (batchSize=1)]
  → [Loop]
      → [调用 ComfyUI] (逐个执行)
```

#### 期望实现（并行）

```
[接收分镜] 
  → [选择 ComfyUI 节点] (为每个场景分配机器)
  → [Split In Batches (batchSize=2)]  ← 并行度
  → [Loop]
      → [调用 ComfyUI] (2 个场景同时执行)
  → [汇总结果]
  → [回调后端]
```

**并行度设置**：
- `batchSize = 1`：完全串行（当前）
- `batchSize = 2`：2 个场景并行
- `batchSize = 场景数`：所有场景并行（最快，但可能超载）

**建议**：
- 图像生成：`batchSize = ComfyUI 机器数`（例如 2 台机器 = batchSize 2）
- 视频生成：`batchSize = ComfyUI 机器数`（视频生成占用高，建议 1 台机器同时只处理 1 个）

---

### 需求 5: 错误处理和重试

#### 单个场景失败处理

**要求**：
- 某个场景失败，不影响其他场景
- 失败场景自动重试（最多 3 次）
- 重试失败后，标记为失败，继续处理其他场景

**HTTP Request 节点配置**：
```json
{
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 5000,
  "continueOnFail": true
}
```

#### 全部失败处理

**场景**：所有 ComfyUI 节点都不可用

**要求**：
- 立即回调后端，报告失败
- 不等待所有场景完成

**实现**：
在 HTTP Request 节点后添加 IF 节点判断：
```javascript
// 如果 3 次重试后仍失败
{{ $node["HTTP Request"].isExecuted === false }}
```

如果为 true，跳转到"回调失败"节点

---

### 需求 6: 超时设置

#### 图像生成超时

**单张图片**：
- 正常时间：3 秒
- 超时设置：30 秒（10 倍余量）

**整个任务**：
- 6 张图串行：18 秒
- 6 张图并行（2 台）：9 秒
- 超时设置：60 秒

**配置**：
```json
{
  "options": {
    "timeout": 30000  // 单个 HTTP 请求
  }
}
```

#### 视频生成超时

**单段视频**：
- 正常时间：8 分钟
- 超时设置：15 分钟

**整个任务**：
- 6 段视频串行：48 分钟
- 6 段视频并行（2 台）：24 分钟
- 超时设置：60 分钟

**配置**：
```json
{
  "options": {
    "timeout": 900000  // 15 分钟
  }
}
```

---

## 📊 Workflow 结构

### 图像生成 Workflow: `story_images_parallel`

```
1. [Webhook 接收] (path: /webhook/story_images_parallel)
   ↓
2. [解析输入] (Code 节点 - Python)
   - 提取 scenes, task_id, callback_url
   - 验证必填字段
   ↓
3. [为每个场景分配 ComfyUI 节点] (Code 节点 - Python)
   - 从 IP 池中轮询选择
   - 输出：每个场景 + 对应的 comfyui_url
   ↓
4. [Split In Batches] (batchSize = ComfyUI 机器数)
   ↓
5. [调用 ComfyUI 生成图片] (HTTP Request)
   - URL: {{ $json.comfyui_url }}/prompt
   - Body: { "prompt": "{{ $json.imagePrompt }}", ... }
   - Retry: 3 次
   - Continue On Fail: true
   ↓
6. [轮询 ComfyUI 结果] (HTTP Request + Wait)
   - Loop 直到 status = success/failed
   ↓
7. [汇总结果] (Code 节点 - Python)
   - 收集所有 imageUrl
   - 统计成功/失败数
   - 判断总体 status
   ↓
8. [回调后端] (HTTP Request)
   - URL: {{ $('Webhook 接收').item.json.body.callback_url }}
   - Body: { status, task_id, images, stats }
```

---

### 视频生成 Workflow 升级: `story_final_v2` → `story_final_v3`

**主要变更**：

```diff
  1. [Webhook 接收]
  2. [解析输入]
+ 3. [为每个场景分配 ComfyUI 节点] (新增)
- 4. [Split In Batches (batchSize=1)] (串行)
+ 4. [Split In Batches (batchSize=2)] (并行)
  5. [音频生成]
  6. [视频生成]
  7. [融合任务]
  8. [合并最终视频]
+ 9. [汇总统计] (新增)
  10. [回调后端]
```

---

## 🔧 ComfyUI API 调用方式

### 当前后端实现

```javascript
// 1. 提交任务
POST http://49.235.210.6:8001/prompt
Body: {
  "client_id": "xxx",
  "prompt": { ... workflow ... }
}

Response: {
  "prompt_id": "abc123"
}

// 2. 轮询结果
GET http://49.235.210.6:8001/history/abc123

Response: {
  "abc123": {
    "status": {
      "completed": true
    },
    "outputs": {
      "9": {
        "images": [
          {
            "filename": "story_scene_xxx.png",
            "type": "output"
          }
        ]
      }
    }
  }
}

// 3. 获取图片 URL
http://49.235.210.6:8001/view?filename=story_scene_xxx.png
```

### n8n 实现建议

**方式 1: 复用后端逻辑**（推荐）

在 n8n 中实现相同的流程：
1. HTTP Request: POST /prompt
2. Wait 2 秒
3. HTTP Request: GET /history/:prompt_id
4. IF 节点判断 completed
5. 如果未完成，返回步骤 3
6. 如果完成，构建图片 URL

**方式 2: 封装成 ComfyUI Service API**

在后端创建统一 API：
```javascript
POST /api/comfyui/generate-image
Body: {
  "prompt": "...",
  "type": "image"
}

Response (同步等待):
{
  "imageUrl": "http://49.235.210.6:8001/view?filename=xxx.png"
}
```

n8n 中只需调用这个 API，更简单

**推荐**：
- 短期：方式 1（n8n 中实现，减少依赖）
- 长期：方式 2（封装成统一服务，便于维护）

---

## 🎯 交付清单

### n8n 侧需要实现

1. ✅ 创建新 Workflow: `story_images_parallel`
   - 支持图像并行生成
   - 支持 IP 池负载均衡
   - 支持回调

2. ✅ 升级现有 Workflow: `story_final_v2` → `story_final_v3`
   - 增加并行处理
   - 增加 IP 池负载均衡
   - 增加统计信息

3. ✅ 配置环境变量
   - `COMFYUI_IMAGE_NODES`
   - `COMFYUI_VIDEO_NODES`

4. ✅ 测试验证
   - 单场景测试
   - 多场景并行测试
   - 失败重试测试
   - 回调测试

---

## 📋 测试用例

### 测试 1: 图像生成 - 正常流程

**输入**：
```json
{
  "scenes": [
    {"id": 1, "imagePrompt": "test prompt 1"},
    {"id": 2, "imagePrompt": "test prompt 2"}
  ],
  "task_id": "test_img_001",
  "callback_url": "http://localhost:3002/api/ai/image-callback/test_img_001"
}
```

**预期输出**：
- 2 张图片并行生成（如果有 2 台机器）
- 回调后端，包含 2 个 imageUrl
- status: "completed"

---

### 测试 2: 图像生成 - 单个失败

**模拟**：某台 ComfyUI 机器故障

**预期输出**：
- 失败的场景重试 3 次
- 3 次失败后，标记该场景失败
- 其他场景正常完成
- 回调后端，status: "completed_with_errors"

---

### 测试 3: 视频生成 - 并行

**输入**：6 个场景

**预期输出**：
- 6 个场景分成 3 批（假设 batchSize=2）
- 每批 2 个场景并行处理
- 总时间约为串行的 1/2

---

## 🚀 实施优先级

### P0（必须）
- ✅ 图像生成 Workflow 基础功能
- ✅ IP 池负载均衡
- ✅ 回调机制

### P1（重要）
- ✅ 并行处理（batchSize > 1）
- ✅ 错误重试
- ✅ 部分成功处理

### P2（可选）
- 统计信息（生成时间、成功率等）
- 更智能的负载均衡（基于队列长度）
- 监控和告警

---

## 📞 联系方式

如有疑问，请联系后端开发团队：
- Workflow 输入/输出格式确认
- ComfyUI API 调用方式确认
- 测试和验证

---

## 附录：环境变量配置示例

```bash
# n8n 环境变量文件 (.env)

# 图像生成 ComfyUI 节点（逗号分隔）
COMFYUI_IMAGE_NODES=http://192.168.1.101:8001,http://192.168.1.102:8001,http://192.168.1.103:8001

# 视频生成 ComfyUI 节点
COMFYUI_VIDEO_NODES=http://192.168.1.104:8001,http://192.168.1.105:8001

# 回调重试设置
CALLBACK_MAX_RETRIES=3
CALLBACK_RETRY_DELAY=5000

# 超时设置（毫秒）
IMAGE_GENERATION_TIMEOUT=30000
VIDEO_GENERATION_TIMEOUT=900000
```

---

**文档版本**: v1.0  
**创建日期**: 2025-11-22  
**最后更新**: 2025-11-22


