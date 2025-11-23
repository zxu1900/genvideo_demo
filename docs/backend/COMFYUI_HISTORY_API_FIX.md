# 🔧 ComfyUI History API 修复

**修复时间**: 2025-11-23  
**问题**: History API 调用路径错误

---

## 🐛 问题描述

### 错误 1: History API 路径错误

**之前的代码**:
```javascript
const historyResponse = await axios.get(`${COMFY_BASE_URL}/history/${promptId}`, {
  timeout: COMFY_REQUEST_TIMEOUT_MS,
});
```

**问题**:
- ComfyUI 不支持 `/history/{promptId}` 路径
- 应该使用 `/history` 获取所有历史记录，然后从中查找对应的 promptId

---

## ✅ 修复方案

### 修复后的代码

```javascript
async function waitForComfyResult(promptId) {
  const start = Date.now();

  while (Date.now() - start < COMFY_TIMEOUT_MS) {
    await new Promise((resolve) => setTimeout(resolve, COMFY_POLL_INTERVAL_MS));

    // ✅ 修复: 使用 /history 而不是 /history/{promptId}
    const historyResponse = await axios.get(`${COMFY_BASE_URL}/history`, {
      timeout: COMFY_REQUEST_TIMEOUT_MS,
    });

    // historyResponse.data 格式: { [prompt_id]: { ... } }
    const history = historyResponse.data[promptId];
    if (!history || !history.outputs) {
      continue;
    }

    const outputs = Object.values(history.outputs);
    for (const output of outputs) {
      if (output.images && output.images.length > 0) {
        const imageInfo = output.images[0];
        const imageUrl = `${COMFY_BASE_URL}/view?filename=${encodeURIComponent(imageInfo.filename)}&subfolder=${encodeURIComponent(imageInfo.subfolder || '')}&type=${encodeURIComponent(imageInfo.type || 'output')}`;

        return {
          imageUrl,
          imageInfo,
        };
      }
    }
  }

  throw new Error(`ComfyUI job ${promptId} timed out`);
}
```

---

## 📊 ComfyUI History API 说明

### API 格式

**端点**: `GET /history`

**返回格式**:
```json
{
  "prompt_id_1": {
    "prompt": [...],
    "outputs": {
      "9": {
        "images": [
          {
            "filename": "xxx.png",
            "subfolder": "",
            "type": "output"
          }
        ]
      }
    },
    "status": {
      "status_str": "success",
      "completed": true
    }
  },
  "prompt_id_2": { ... }
}
```

### 使用方式

1. 调用 `GET /history` 获取所有历史记录
2. 从返回的对象中查找对应的 `promptId`
3. 检查 `history[promptId].outputs` 获取图像信息

---

## 🔍 关于节点 4 (CheckpointLoaderSimple)

### 问题

从 ComfyUI history 返回的结果看，服务器上执行的历史记录都还是旧的 SD 模型（节点 4: CheckpointLoaderSimple），而不是 Flux workflow。

### 原因分析

**可能的原因**:
1. 后端服务还没有重启，还在使用旧的代码
2. 之前的测试还在使用旧的 workflow
3. ComfyUI 服务器上缓存了旧的 workflow

### 验证

**代码检查结果**:
- ✅ 代码已正确使用 `flux_dev_full_text_to_image.json`
- ✅ 生成的 payload 使用 Flux 节点 (38, 39, 40, 41)
- ✅ 没有节点 4 (CheckpointLoaderSimple)

**Flux Workflow 节点**:
- 节点 38: UNETLoader (Flux UNet)
- 节点 39: VAELoader (Flux VAE)
- 节点 40: DualCLIPLoader (Flux 双 CLIP)
- 节点 41: CLIPTextEncodeFlux (Flux 文本编码)
- 节点 27: EmptySD3LatentImage (SD3 Latent)
- 节点 31: KSampler (采样器)
- 节点 8: VAEDecode (VAE 解码)
- 节点 9: SaveImage (保存图像)
- 节点 42: ConditioningZeroOut (条件零化)

---

## 🚀 修复步骤

### 1. 重启后端服务

```bash
# 停止旧服务
pkill -f "node.*server.js" || lsof -ti:3002 | xargs kill -9

# 启动新服务
cd /home/frankyxu/Code/video/first_book_v2/backend
npm start
```

### 2. 验证修复

```bash
# 测试生成图像
curl -X POST http://localhost:3002/api/ai/generate-story \
  -H 'Content-Type: application/json' \
  -d '{
    "idea": "三只小猪盖房子",
    "theme": "fantasy-adventure",
    "useN8n": false
  }'
```

### 3. 检查 ComfyUI History

```bash
# 查看最新的历史记录
curl -s "http://117.50.175.32:8188/history" | jq 'to_entries | .[-1] | .value.prompt | keys'
```

**应该看到**: 节点 38, 39, 40, 41 (Flux workflow)  
**不应该看到**: 节点 4 (CheckpointLoaderSimple)

---

## 📋 修复清单

- ✅ History API 路径修复 (`/history` 而不是 `/history/{promptId}`)
- ✅ 代码使用 Flux workflow (已验证)
- ⏳ 重启后端服务 (需要手动执行)
- ⏳ 验证新生成的图像使用 Flux workflow

---

## 🎯 预期效果

### 修复前

- ❌ History API 调用失败或返回错误
- ❌ 无法获取图像结果
- ⚠️  可能使用旧的 SD 模型

### 修复后

- ✅ History API 正常调用
- ✅ 正确获取图像结果
- ✅ 使用 Flux workflow 生成图像

---

## 📚 相关文档

- [FLUX_WORKFLOW_INTEGRATION.md](../features/FLUX_WORKFLOW_INTEGRATION.md) - Flux workflow 集成
- [FLUX_DUAL_PROMPT_OPTIMIZATION.md](../features/FLUX_DUAL_PROMPT_OPTIMIZATION.md) - 双 Prompt 优化

---

**修复完成**: ✅  
**需要重启**: ⏳  
**测试状态**: ⏳

---

**创建时间**: 2025-11-23  
**修改文件**: `backend/services/comfyService.js`  
**影响范围**: ComfyUI 图像结果获取



