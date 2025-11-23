# ComfyUI 并行化加速设计方案

## 📋 需求概述

**目标**：支持多台 ComfyUI 机器并行生成图片/视频，提升生成速度

**当前架构**：
```
n8n Workflow (单台机器)
  → 串行调用 ComfyUI (http://comfyui_api:8001)
  → 逐个场景生成
  → 总时间 = 场景数 × 单场景时间
```

**期望架构**：
```
n8n Workflow (多台机器)
  → 并行调用多台 ComfyUI
  → 负载均衡
  → 总时间 = (场景数 / 机器数) × 单场景时间
```

---

## 🎯 设计目标

### 1. 性能提升
- **图片生成**：6 张图从 18 秒降至 3-6 秒（假设 3-6 台机器）
- **视频生成**：6 段视频从 50 分钟降至 8-25 分钟

### 2. 高可用性
- 某台机器故障，自动切换到其他机器
- 避免单点故障

### 3. 易扩展性
- 动态添加/删除机器，无需修改代码
- 支持不同规格机器（GPU 算力不同）

### 4. 负载均衡
- 公平分配任务到各台机器
- 避免某台机器过载

---

## 🏗️ 架构方案

### 方案 A：n8n 内置负载均衡（简单）

#### 架构
```
n8n Workflow
  → [机器列表配置]
  → [Split Into Batches (并行度 = 机器数)]
  → [Loop 批次]
      → [轮询选择机器]
      → [调用 ComfyUI API]
  → [汇总结果]
```

#### 实现细节

**1. 机器列表存储**
```javascript
// n8n Workflow 环境变量
COMFYUI_NODES = "http://gpu1:8001,http://gpu2:8001,http://gpu3:8001"
```

**2. 负载均衡算法**
```python
# 在 n8n Code 节点中
import os

# 读取机器列表
nodes = os.environ['COMFYUI_NODES'].split(',')

# 轮询分配
scene_index = $json.scene_index
node_index = scene_index % len(nodes)
selected_node = nodes[node_index]

# 输出
return {
    'comfyui_url': selected_node,
    'scene_index': scene_index
}
```

**3. HTTP Request 节点**
```json
{
  "method": "POST",
  "url": "={{ $json.comfyui_url }}/api/image/generate",
  "body": {
    "prompt": "={{ $json.image_prompt }}"
  }
}
```

#### 优点
- ✅ 实现简单，无需额外服务
- ✅ n8n 自带并行能力（Split In Batches）
- ✅ 配置灵活（环境变量）

#### 缺点
- ❌ 负载均衡策略简单（轮询）
- ❌ 无法感知机器实时负载
- ❌ 机器故障需手动摘除

---

### 方案 B：独立负载均衡服务（推荐）

#### 架构
```
n8n Workflow
  → [调用负载均衡服务]
  → [负载均衡服务]
      → 自动选择空闲机器
      → 转发请求到 ComfyUI
      → 返回结果
  → [汇总结果]
```

#### 实现细节

**1. 负载均衡服务 API**
```
POST /api/comfyui/dispatch
{
  "type": "image",  // or "video"
  "prompt": "...",
  "priority": 1     // 1-10，数字越大优先级越高
}

Response:
{
  "job_id": "img_123",
  "node": "http://gpu2:8001",
  "status": "queued"
}
```

**2. 机器管理 API**
```
GET /api/nodes
Response:
{
  "nodes": [
    {
      "id": "gpu1",
      "url": "http://gpu1:8001",
      "status": "online",
      "queue_length": 2,
      "last_heartbeat": "2025-11-22T10:00:00Z"
    },
    {
      "id": "gpu2",
      "url": "http://gpu2:8001",
      "status": "busy",
      "queue_length": 5,
      "last_heartbeat": "2025-11-22T10:00:05Z"
    }
  ]
}
```

**3. 健康检查**
```
GET /api/nodes/{node_id}/health
Response:
{
  "status": "online",
  "gpu_usage": 85,
  "memory_usage": 70,
  "queue_length": 3,
  "processing_speed": 3.2  // 秒/张图
}
```

#### 负载均衡策略

**策略 1：最少连接数（推荐）**
```python
def select_node():
    # 选择队列最短的机器
    nodes = get_online_nodes()
    return min(nodes, key=lambda n: n.queue_length)
```

**策略 2：加权轮询**
```python
def select_node():
    # 根据机器算力分配权重
    # GPU A100 = 权重 3, GPU V100 = 权重 1
    nodes = get_online_nodes()
    weights = [n.capacity for n in nodes]
    return random.choices(nodes, weights=weights)[0]
```

**策略 3：响应时间优先**
```python
def select_node():
    # 选择平均响应最快的机器
    nodes = get_online_nodes()
    return min(nodes, key=lambda n: n.avg_response_time)
```

#### 优点
- ✅ 负载均衡策略灵活（可随时调整）
- ✅ 自动健康检查和故障转移
- ✅ 实时监控和统计
- ✅ 支持优先级队列
- ✅ 机器动态上下线

#### 缺点
- ❌ 需要开发独立服务
- ❌ 增加部署复杂度
- ❌ 单点故障风险（服务本身）

---

### 方案 C：使用现有负载均衡器（Nginx/HAProxy）

#### 架构
```
n8n Workflow
  → [调用 Nginx]
  → [Nginx 负载均衡]
      → upstream gpu1:8001
      → upstream gpu2:8001
      → upstream gpu3:8001
  → [返回结果]
```

#### Nginx 配置
```nginx
upstream comfyui_cluster {
    least_conn;  # 最少连接数
    
    server gpu1:8001 weight=3 max_fails=3 fail_timeout=30s;
    server gpu2:8001 weight=1 max_fails=3 fail_timeout=30s;
    server gpu3:8001 weight=2 max_fails=3 fail_timeout=30s;
}

server {
    listen 8001;
    
    location /api/ {
        proxy_pass http://comfyui_cluster;
        proxy_next_upstream error timeout http_500 http_502 http_503;
        proxy_connect_timeout 5s;
        proxy_read_timeout 300s;
    }
}
```

#### 优点
- ✅ 成熟稳定（Nginx 久经考验）
- ✅ 配置简单
- ✅ 自动健康检查和故障转移
- ✅ 高性能（C 语言实现）

#### 缺点
- ❌ 负载均衡策略有限（无法基于队列长度）
- ❌ 无法感知 ComfyUI 内部状态（GPU 使用率等）
- ❌ 配置变更需要重启

---

## 🎯 我的推荐方案

### 阶段 1：快速上线（Nginx）

**方案**：使用 **方案 C（Nginx）**

**理由**：
- 快速部署，无需开发
- 稳定可靠
- 满足基本负载均衡需求

**实施步骤**：
1. 在所有 GPU 机器上部署 ComfyUI
2. 配置 Nginx upstream
3. n8n 调用 Nginx 地址（如 `http://nginx:8001`）
4. 测试验证

**时间**：1-2 天

---

### 阶段 2：优化升级（独立服务）

**方案**：升级到 **方案 B（独立服务）**

**理由**：
- 更智能的负载均衡（基于队列、GPU 使用率）
- 支持优先级队列
- 实时监控和统计

**实施步骤**：
1. 开发负载均衡服务（Python FastAPI）
2. 实现健康检查和故障转移
3. 提供管理界面（机器状态、任务队列）
4. n8n 切换到负载均衡服务

**时间**：1-2 周

---

## 📋 n8n Workflow 修改需求

### 需求 1：支持动态 URL

**当前**：
```json
{
  "url": "http://comfyui_api:8001/api/video/submit"
}
```

**修改后**（方案 A）：
```json
{
  "url": "={{ $json.comfyui_url }}/api/video/submit"
}
```

**修改后**（方案 C）：
```json
{
  "url": "http://nginx:8001/api/video/submit"
}
```

---

### 需求 2：并行调用支持

**当前**：
```
[Split In Batches (batchSize=1)]
  → [HTTP Request]
```

**修改后**：
```
[Split In Batches (batchSize=3)]  ← 并行度
  → [HTTP Request] (同时发起 3 个请求)
```

---

### 需求 3：错误重试机制

**当前**：
```json
{
  "retryOnFail": true
}
```

**增强**：
```json
{
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 5000,  // 5秒
  "continueOnFail": true      // 某个失败不影响其他
}
```

---

### 需求 4：超时设置

**当前**：
```json
{
  "timeout": 60000  // 60秒
}
```

**修改**：
```json
{
  "timeout": 300000  // 300秒（视频生成）
}
```

---

## 🔧 ComfyUI 机器配置

### 机器规格建议

**图片生成机器**（低配）：
- GPU: RTX 3060 或以上
- 内存: 16GB
- 并发能力: 1-2 个任务
- 用途: Step 2 图片生成

**视频生成机器**（高配）：
- GPU: RTX 4090 或 A100
- 内存: 32GB+
- 并发能力: 1 个任务
- 用途: Step 6 视频生成

---

### 网络拓扑

**方案 1：所有机器同一局域网**
```
n8n (Server A)
  ↓
Nginx (Server B)
  ↓
├─ GPU1 (192.168.1.101:8001)
├─ GPU2 (192.168.1.102:8001)
└─ GPU3 (192.168.1.103:8001)
```

**方案 2：跨地域部署**
```
n8n (北京)
  ↓ (公网)
Load Balancer (上海)
  ↓ (内网)
├─ GPU1 (上海机房)
├─ GPU2 (上海机房)
└─ GPU3 (深圳机房)
```

---

## 📊 性能预估

### 图片生成（6 张图）

| 机器数 | 串行时间 | 并行时间 | 加速比 |
|--------|----------|----------|--------|
| 1 台   | 18 秒    | 18 秒    | 1x     |
| 2 台   | 18 秒    | 9 秒     | 2x     |
| 3 台   | 18 秒    | 6 秒     | 3x     |
| 6 台   | 18 秒    | 3 秒     | 6x     |

### 视频生成（6 段视频，假设单段 8 分钟）

| 机器数 | 串行时间 | 并行时间 | 加速比 |
|--------|----------|----------|--------|
| 1 台   | 48 分钟  | 48 分钟  | 1x     |
| 2 台   | 48 分钟  | 24 分钟  | 2x     |
| 3 台   | 48 分钟  | 16 分钟  | 3x     |
| 6 台   | 48 分钟  | 8 分钟   | 6x     |

---

## ❓ 需要确认的问题

### 问题 1：机器数量和配置

**计划部署几台机器？**
- GPU 型号？
- 内存？
- 网络环境（内网/公网）？

---

### 问题 2：优先级需求

**是否需要优先级队列？**
- 例如：付费用户优先
- VIP 任务优先

---

### 问题 3：成本预算

**每月预算？**
- 决定用云服务器还是自建机房
- 决定机器规格

---

### 问题 4：监控需求

**是否需要监控面板？**
- 实时查看各机器状态
- 任务队列长度
- 生成成功率

---

## 📝 下一步行动

### 如果选择方案 C（Nginx）

**我需要提供**：
1. ✅ Nginx 配置文件
2. ✅ n8n Workflow 修改文档
3. ✅ 部署和测试指南

**你需要提供**：
1. 机器 IP 列表和端口
2. 确认 ComfyUI 已部署在所有机器

**时间**：我可以立即提供配置

---

### 如果选择方案 B（独立服务）

**我需要提供**：
1. ✅ 负载均衡服务代码（Python FastAPI）
2. ✅ API 文档
3. ✅ n8n 调用示例
4. ✅ 部署和监控方案

**你需要提供**：
1. 机器规格和数量
2. 负载均衡策略偏好
3. 监控需求

**时间**：需要 1-2 周开发

---

## 🎯 请回答

1. **你倾向于哪个方案？**
   - A. 方案 A（n8n 内置，简单但功能有限）
   - B. 方案 B（独立服务，功能强大但复杂）
   - C. 方案 C（Nginx，快速上线）
   - D. 分阶段（先 C 后 B）

2. **计划部署几台机器？**
   - 提供机器配置（GPU、内存、网络）

3. **是否需要优先级队列？**

4. **是否需要监控面板？**

5. **预期上线时间？**
   - 决定方案选择和开发优先级

---

请告诉我你的决策和具体需求，我会提供详细的实施方案和代码！


