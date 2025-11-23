# Flux 双 CLIP Prompt 优化说明

## 📋 更新内容

**日期**: 2025-11-23

### 问题
Flux 使用双 CLIP 架构（`clip_l` + `t5xxl`），之前 DeepSeek 只生成单个 `imagePrompt`，无法充分利用 Flux 的能力。

### 解决方案

修改 DeepSeek prompt 生成逻辑，支持双 prompt 结构：

#### 1. **imagePrompt** (CLIP-L)
- **用途**: 主要的核心描述
- **特点**: 简洁、概括性强
- **示例**: `"A vibrant children's book illustration in a modern cartoon style."`

#### 2. **imagePromptDetailed** (T5-XXL)
- **用途**: 详细的扩展描述
- **特点**: 详细、具体，包含更多细节
- **示例**: `"A friendly mother pig is chatting with three playful little piglets in a sunny forest clearing. The piglets have exaggerated, cute expressions (curious, happy, sleepy). Bright, cheerful colors, clean shapes, soft cel-shading. Dynamic and playful composition, morning sunbeams illuminating the scene. High contrast and appealing character design."`

---

## 🎨 Flux Workflow 结构

```json
{
  "41": {
    "inputs": {
      "clip_l": "主要描述（imagePrompt）",
      "t5xxl": "详细描述（imagePromptDetailed）",
      "guidance": 3.5,
      "clip": ["40", 0]
    },
    "class_type": "CLIPTextEncodeFlux"
  }
}
```

---

## 🔄 修改对比

### 修改前

```javascript
// DeepSeek 只生成一个 prompt
{
  "imagePrompt": "A cute rabbit in the forest, children's book style"
}

// ComfyUI 使用
workflow["41"]["inputs"]["clip_l"] = scene.imagePrompt;
workflow["41"]["inputs"]["t5xxl"] = ""; // 空的！
```

### 修改后

```javascript
// DeepSeek 生成双 prompt
{
  "imagePrompt": "A vibrant children's book illustration in a modern cartoon style.",
  "imagePromptDetailed": "A cute rabbit hopping in a sunny forest clearing. Big expressive eyes, fluffy tail, surrounded by colorful flowers. Soft morning light, warm color palette, gentle atmosphere. High contrast and appealing character design."
}

// ComfyUI 使用
workflow["41"]["inputs"]["clip_l"] = scene.imagePrompt;
workflow["41"]["inputs"]["t5xxl"] = scene.imagePromptDetailed;
```

---

## 📝 DeepSeek Prompt 更新

### 新增字段说明

在 DeepSeek 的 user prompt 中添加：

```
- "imagePrompt": 用于 Flux 图像生成的主要提示词（英文），简洁描述核心场景、角色、风格
- "imagePromptDetailed": 用于 Flux T5-XXL 的详细提示词（英文），详细描述情绪、光线、构图、艺术风格等细节（可选，留空使用默认）
```

### 示例说明

添加了具体的示例：

```
4. imagePrompt 示例：
   - imagePrompt: "A vibrant children's book illustration in a modern cartoon style."
   - imagePromptDetailed: "A friendly mother pig is chatting with three playful little piglets in a sunny forest clearing. The piglets have exaggerated, cute expressions (curious, happy, sleepy). Bright, cheerful colors, clean shapes, soft cel-shading. Dynamic and playful composition, morning sunbeams illuminating the scene. High contrast and appealing character design."
```

---

## 🔧 后端代码修改

### aiService.js 修改

1. **User Prompt 更新**: 
   - 新增 `imagePromptDetailed` 字段说明
   - 添加示例说明

2. **场景解析更新**:
   ```javascript
   return {
     id: scene.id,
     story: scene.story,
     voicePrompt: scene.voicePrompt,
     imagePrompt: scene.imagePrompt || fallbackPromptMain,      // CLIP-L
     imagePromptDetailed: scene.imagePromptDetailed || fallbackPromptDetailed,  // T5-XXL
     videoPrompt: scene.videoPrompt,
   };
   ```

3. **Fallback 优化**:
   ```javascript
   const fallbackPromptMain = "A vibrant children's book illustration in a modern cartoon style.";
   const fallbackPromptDetailed = storyText.slice(0, 200);
   ```

---

## 🎯 使用方式

### n8n Workflow 中使用

```javascript
// Code 节点 - 构建 Flux workflow
const workflow = JSON.parse(fluxTemplate);

workflow["41"]["inputs"]["clip_l"] = scene.imagePrompt;
workflow["41"]["inputs"]["t5xxl"] = scene.imagePromptDetailed || "";
workflow["41"]["inputs"]["guidance"] = 3.5;

// 提交到 ComfyUI
const response = await axios.post(`${comfyuiUrl}/prompt`, {
  prompt: workflow
});
```

### 直连 ComfyUI 使用

```javascript
// comfyService.js
function buildFluxWorkflow(imagePrompt, imagePromptDetailed) {
  const workflow = { ...fluxTemplate };
  
  workflow["41"]["inputs"]["clip_l"] = imagePrompt;
  workflow["41"]["inputs"]["t5xxl"] = imagePromptDetailed || "";
  
  return workflow;
}
```

---

## 📊 预期效果提升

### 优势

1. **更好的构图控制**: T5-XXL 能理解更复杂的场景描述
2. **更准确的细节**: 可以指定表情、光线、氛围等
3. **更高的一致性**: 主 prompt 保持风格统一，详细 prompt 添加变化
4. **更灵活**: 可以选择性使用详细 prompt（留空则只用主 prompt）

### 对比示例

#### 单 Prompt（之前）
```
"A cute rabbit in the forest, children's book style"
```
- 效果：基础的兔子图像
- 问题：细节不够，表情单一

#### 双 Prompt（现在）
```
clip_l: "A vibrant children's book illustration in a modern cartoon style."
t5xxl: "A cute rabbit hopping in a sunny forest clearing. Big expressive eyes, fluffy tail, surrounded by colorful flowers. Soft morning light, warm color palette, gentle atmosphere."
```
- 效果：细节丰富的兔子图像
- 优势：表情生动，场景清晰，氛围温暖

---

## 🧪 测试建议

### 测试场景

1. **简单场景**:
   ```json
   {
     "imagePrompt": "Children's book illustration",
     "imagePromptDetailed": "A happy child playing in the garden"
   }
   ```

2. **复杂场景**:
   ```json
   {
     "imagePrompt": "A vibrant fantasy illustration in watercolor style",
     "imagePromptDetailed": "A magical forest at twilight. Ancient trees with glowing mushrooms, a friendly fairy sitting on a moss-covered stone, soft purple and blue lighting, dreamy atmosphere, sparkles in the air"
   }
   ```

3. **Fallback 测试**:
   ```json
   {
     "imagePrompt": "Default style prompt",
     "imagePromptDetailed": ""  // 测试空值
   }
   ```

---

## 📋 待办事项

### 后端
- ✅ 更新 DeepSeek prompt 生成逻辑
- ✅ 添加 `imagePromptDetailed` 字段解析
- ✅ 添加 fallback 逻辑
- ⏳ 更新 `comfyService.js` 支持 Flux workflow
- ⏳ 测试 DeepSeek 生成结果

### n8n
- ⏳ 更新图像生成 workflow
- ⏳ 使用 `scene.imagePrompt` 和 `scene.imagePromptDetailed`
- ⏳ 测试 Flux 生成效果

### 前端
- ✅ 无需修改（字段向后兼容）

---

## 🔍 兼容性

### 向后兼容

- ✅ 如果 DeepSeek 没有生成 `imagePromptDetailed`，使用 fallback
- ✅ 旧的场景数据仍然可以工作（只用 `imagePrompt`）
- ✅ 前端无需修改（透明升级）

### Fallback 策略

```javascript
// 如果 DeepSeek 没返回详细 prompt
imagePromptDetailed: scene.imagePromptDetailed || storyText.slice(0, 200)

// 如果连主 prompt 都没有
imagePrompt: scene.imagePrompt || "A vibrant children's book illustration"
```

---

## 📚 参考资料

- **Flux 官方文档**: [https://github.com/black-forest-labs/flux](https://github.com/black-forest-labs/flux)
- **ComfyUI Flux 节点**: `CLIPTextEncodeFlux`
- **CLIP-L vs T5-XXL**: CLIP-L 更适合整体风格，T5-XXL 更适合细节描述

---

**文档创建**: 2025-11-23  
**修改文件**: `backend/services/aiService.js`  
**影响范围**: DeepSeek prompt 生成、Flux 图像生成



