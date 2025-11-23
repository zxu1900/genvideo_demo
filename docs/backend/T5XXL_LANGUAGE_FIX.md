# 🔧 T5-XXL Prompt 语言修复

**修复时间**: 2025-11-23  
**问题**: T5-XXL prompt 包含了中文，但 Flux T5-XXL 模型只接受英文

---

## 🐛 问题描述

### 发现的问题

**错误的 prompt**:
```json
{
  "clip_l": "A vibrant children's book illustration in a modern cartoon style.",
  "t5xxl": "在一个充满魔法的世界里，有三只小猪盖房子的故事正在悄悄展开。. Bright colors, friendly characters, warm atmosphere, high contrast, appealing design."
}
```

**问题**:
- ❌ `t5xxl` 包含了中文文本
- ❌ Flux T5-XXL 模型只接受英文 prompt
- ❌ 中文部分来自 `storyText`（故事文本是中文）

---

## 🔍 根本原因

### 问题 1: Fallback 逻辑错误

**之前的代码** (`parseStoryboardResponse`):
```javascript
const fallbackPromptDetailed = storyText
  ? storyText.slice(0, 200)  // ❌ storyText 是中文！
  : `Children's story theme ${theme}, inspired by ${idea}`;
```

**问题**:
- 如果 DeepSeek 没有返回 `imagePromptDetailed`，fallback 使用了中文的 `storyText`
- T5-XXL 模型无法理解中文，会导致生成效果差或失败

---

### 问题 2: 本地生成也有同样问题

**之前的代码** (`generateLocalStoryboard`):
```javascript
const imagePromptDetailed = `${sceneText}. Bright colors...`;
// ❌ sceneText 是中文段落文本
```

---

## ✅ 修复方案

### 修复 1: parseStoryboardResponse

**修复前**:
```javascript
const fallbackPromptDetailed = storyText
  ? storyText.slice(0, 200)  // 中文
  : `Children's story theme ${theme}, inspired by ${idea}`;
```

**修复后**:
```javascript
// T5-XXL 必须使用英文，不能使用中文 storyText
const fallbackPromptDetailed = `Children's story scene with warm atmosphere. Bright colors, friendly characters, appealing design, high contrast, soft lighting.`;
```

---

### 修复 2: generateLocalStoryboard

**修复前**:
```javascript
const imagePromptDetailed = `${sceneText}. Bright colors...`;
// sceneText 是中文
```

**修复后**:
```javascript
// T5-XXL 必须使用英文，不能使用中文 sceneText
const imagePromptDetailed = `Children's story scene with warm atmosphere. Bright colors, friendly characters, appealing design, high contrast, soft lighting.`;
```

---

## 📋 修复后的预期行为

### 场景 1: DeepSeek 返回了 imagePromptDetailed

```json
{
  "imagePrompt": "A vibrant children's book illustration in a modern cartoon style.",
  "imagePromptDetailed": "A friendly mother pig chatting with three playful piglets in a sunny forest clearing. Bright, cheerful colors, soft cel-shading, warm morning light."
}
```

**结果**: ✅ 使用 DeepSeek 生成的英文详细描述

---

### 场景 2: DeepSeek 没有返回 imagePromptDetailed

```json
{
  "imagePrompt": "A vibrant children's book illustration in a modern cartoon style.",
  "imagePromptDetailed": null  // 或不存在
}
```

**修复前**: ❌ 使用中文 `storyText`  
**修复后**: ✅ 使用英文 fallback: `"Children's story scene with warm atmosphere. Bright colors, friendly characters, appealing design, high contrast, soft lighting."`

---

## 🎯 语言要求总结

### Flux 双 CLIP 架构

| 字段 | 模型 | 语言要求 | 示例 |
|------|------|---------|------|
| `clip_l` | CLIP-L | **英文** | "A vibrant children's book illustration in a modern cartoon style." |
| `t5xxl` | T5-XXL | **英文** | "A friendly mother pig chatting with three playful piglets..." |

### 其他字段

| 字段 | 用途 | 语言要求 |
|------|------|---------|
| `story` | 故事内容 | 中文 |
| `voicePrompt` | 语音合成 | 中文 |
| `imagePrompt` | CLIP-L prompt | **英文** |
| `imagePromptDetailed` | T5-XXL prompt | **英文** |
| `videoPrompt` | 视频生成 | **英文** |

---

## ⚠️ 重要提醒

### T5-XXL 模型限制

1. **只接受英文**: T5-XXL 是英文语言模型，不支持中文
2. **中文会导致**: 
   - 生成效果差
   - 可能生成失败
   - 图像质量下降

### DeepSeek Prompt 要求

在 DeepSeek 的 user prompt 中已经明确要求：
```
- imagePrompt, imagePromptDetailed 与 videoPrompt 使用英文
```

但需要确保 fallback 也遵守这个规则。

---

## 🧪 测试验证

### 测试场景

1. **DeepSeek 返回完整 prompt**
   - 验证 `imagePromptDetailed` 是英文
   - 验证不包含中文

2. **DeepSeek 未返回 imagePromptDetailed**
   - 验证 fallback 是英文
   - 验证不包含中文

3. **本地生成 fallback**
   - 验证 `imagePromptDetailed` 是英文
   - 验证不包含中文

---

## 📊 修复对比

### 修复前

```json
{
  "clip_l": "A vibrant children's book illustration...",
  "t5xxl": "在一个充满魔法的世界里... Bright colors..."  // ❌ 包含中文
}
```

### 修复后

```json
{
  "clip_l": "A vibrant children's book illustration...",
  "t5xxl": "Children's story scene with warm atmosphere. Bright colors, friendly characters..."  // ✅ 纯英文
}
```

---

## 🔄 下一步

1. **重启后端服务**（应用修复）
2. **运行测试**（验证 prompt 是纯英文）
3. **检查生成效果**（验证图像质量）

---

**修复完成**: ✅  
**需要重启**: ⏳  
**测试状态**: ⏳

---

**创建时间**: 2025-11-23  
**修改文件**: `backend/services/aiService.js`  
**影响范围**: DeepSeek prompt 解析和本地生成 fallback



