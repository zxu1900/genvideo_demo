# Flux 双 Prompt 示例

## 📝 DeepSeek 生成的理想输出

### 场景 1: 三只小猪与妈妈

```json
{
  "id": 1,
  "title": "三只小猪与妈妈",
  "durationSeconds": 6,
  "story": "在一个阳光明媚的早晨，猪妈妈和她的三个孩子在森林空地上玩耍。",
  "voicePrompt": "在一个阳光明媚的早晨，猪妈妈和她的三个孩子在森林空地上玩耍。",
  "imagePrompt": "A vibrant children's book illustration in a modern cartoon style.",
  "imagePromptDetailed": "A friendly mother pig is chatting with three playful little piglets in a sunny forest clearing. The piglets have exaggerated, cute expressions (curious, happy, sleepy). Bright, cheerful colors, clean shapes, soft cel-shading. Dynamic and playful composition, morning sunbeams illuminating the scene. High contrast and appealing character design.",
  "videoPrompt": "Children's cinematic scene, mother pig and piglets playing in forest, warm morning light, playful movements"
}
```

### 场景 2: 小兔子的冒险

```json
{
  "id": 2,
  "title": "小兔子发现宝藏",
  "durationSeconds": 7,
  "story": "小兔子在森林深处发现了一个闪闪发光的宝箱，里面装满了五颜六色的水晶。",
  "voicePrompt": "小兔子在森林深处发现了一个闪闪发光的宝箱，里面装满了五颜六色的水晶。",
  "imagePrompt": "A magical children's illustration with fantasy elements.",
  "imagePromptDetailed": "A cute white rabbit with big expressive eyes discovering a glowing treasure chest in a mystical forest. The chest is open, revealing colorful crystals that emit soft rainbow light. Moss-covered ground, ancient trees in background, magical atmosphere with sparkles. Warm color palette with purple and blue accents. Whimsical and enchanting composition.",
  "videoPrompt": "Fantasy children's scene, rabbit discovering treasure, magical lighting, sparkles and glow effects"
}
```

### 场景 3: 城市里的小猫

```json
{
  "id": 3,
  "title": "小猫的城市探险",
  "durationSeconds": 6,
  "story": "一只好奇的小猫在繁华的城市街道上探险，对一切新事物都充满好奇。",
  "voicePrompt": "一只好奇的小猫在繁华的城市街道上探险，对一切新事物都充满好奇。",
  "imagePrompt": "A colorful urban scene in children's book style.",
  "imagePromptDetailed": "A curious orange tabby kitten walking on a vibrant city street. Tall buildings with warm lights, street vendors, colorful storefronts. The kitten has wide, curious eyes looking at a butterfly. Urban but friendly atmosphere, golden hour lighting, dynamic perspective from low angle. Clean lines, bright colors, modern illustration style with geometric shapes.",
  "videoPrompt": "Urban children's scene, kitten exploring city, warm evening light, dynamic camera movement"
}
```

---

## 🎨 Prompt 设计原则

### imagePrompt (CLIP-L) - 核心描述

**特点**:
- 简洁、概括性强
- 定义整体风格和基调
- 通常 10-20 个单词

**结构**:
```
[艺术风格] + [主要媒介] + [核心特征]
```

**示例**:
- ✅ "A vibrant children's book illustration in a modern cartoon style."
- ✅ "A magical fantasy illustration with watercolor effects."
- ✅ "A colorful urban scene in children's book style."
- ❌ "A rabbit" (太简单)
- ❌ "A cute white rabbit with big eyes in a forest with trees and flowers and sunshine" (太长，应该放在 detailed)

---

### imagePromptDetailed (T5-XXL) - 详细描述

**特点**:
- 详细、具体
- 包含细节、情绪、光线、构图
- 可以 50-150 个单词

**结构**:
```
[主体详细描述] + [环境细节] + [光线氛围] + [艺术细节]
```

**必须包含**:
1. **主体**: 角色的外观、表情、动作
2. **环境**: 场景的具体元素
3. **光线**: 光照效果、时间、氛围
4. **风格**: 色彩、构图、艺术技法

**示例结构**:
```
A [detailed character description] in a [detailed environment]. 
[Expressions and emotions]. 
[Colors and lighting]. 
[Composition and camera angle]. 
[Style and artistic details].
```

---

## 📊 对比：单 Prompt vs 双 Prompt

### 场景：小兔子在森林里

#### ❌ 单 Prompt（之前）

```json
{
  "imagePrompt": "A cute rabbit in the forest, children's book illustration style, bright colors"
}
```

**问题**:
- 太笼统，缺少细节
- Flux 的 T5-XXL 能力没有被利用
- 生成的图像可能平淡、缺乏特色

---

#### ✅ 双 Prompt（现在）

```json
{
  "imagePrompt": "A vibrant children's book illustration in a modern cartoon style.",
  "imagePromptDetailed": "A cute white rabbit hopping in a sunny forest clearing. Big expressive eyes, fluffy tail, pink nose. Surrounded by colorful wildflowers (daisies, tulips). Ancient oak trees with moss in background. Soft morning sunbeams filtering through leaves, creating dappled light on the ground. Warm color palette with yellows and greens. Dynamic composition from slightly low angle. Soft cel-shading, high contrast, appealing character design."
}
```

**优势**:
- 主 prompt 定义整体风格
- 详细 prompt 添加具体细节
- Flux 能生成更丰富、更有特色的图像
- 可以精确控制表情、光线、构图

---

## 🔧 实际使用（n8n / ComfyUI）

### ComfyUI Workflow 配置

```json
{
  "41": {
    "inputs": {
      "clip_l": "{{ $json.imagePrompt }}",
      "t5xxl": "{{ $json.imagePromptDetailed }}",
      "guidance": 3.5,
      "clip": ["40", 0]
    },
    "class_type": "CLIPTextEncodeFlux"
  }
}
```

### n8n Code 节点示例

```javascript
// 获取场景数据
const scene = $json;

// 构建 Flux workflow
const workflow = JSON.parse(fluxTemplate);

// 设置双 prompt
workflow["41"]["inputs"]["clip_l"] = scene.imagePrompt;
workflow["41"]["inputs"]["t5xxl"] = scene.imagePromptDetailed || "";
workflow["41"]["inputs"]["guidance"] = 3.5;

// 设置其他参数
workflow["27"]["inputs"]["width"] = 1024;
workflow["27"]["inputs"]["height"] = 1024;
workflow["31"]["inputs"]["seed"] = Math.floor(Math.random() * 1000000000);

// 返回
return {
  scene_id: scene.id,
  workflow: workflow
};
```

---

## 💡 Prompt 写作技巧

### 1. 描述主体时要具体

❌ **不好**: "A cat"
✅ **好**: "A fluffy orange tabby kitten with big green eyes"

### 2. 添加情绪和表情

❌ **不好**: "A child"
✅ **好**: "A child with an excited, curious expression"

### 3. 描述光线和氛围

❌ **不好**: "In a forest"
✅ **好**: "In a forest at golden hour, with warm sunbeams filtering through leaves"

### 4. 使用艺术术语

❌ **不好**: "Nice colors"
✅ **好**: "Warm color palette, soft cel-shading, high contrast"

### 5. 指定构图

❌ **不好**: "A scene"
✅ **好**: "Dynamic composition from low angle, rule of thirds"

---

## 📋 Prompt 模板

### 模板 1: 角色特写

```
imagePrompt: "A vibrant character portrait in children's book style."

imagePromptDetailed: "A [character description] with [expression]. [Detailed features]. [Background elements]. [Lighting]. [Color palette]. [Artistic style]."
```

### 模板 2: 场景全景

```
imagePrompt: "A colorful landscape illustration for children."

imagePromptDetailed: "A [location] with [main elements]. [Characters and actions]. [Environmental details]. [Sky and lighting]. [Atmosphere]. [Composition angle]. [Color scheme and style]."
```

### 模板 3: 动作场景

```
imagePrompt: "A dynamic children's illustration with movement."

imagePromptDetailed: "[Character] is [action] in [location]. [Motion details]. [Surrounding elements]. [Dynamic lighting]. [Energy and atmosphere]. [Compositional flow]. [Style and effects]."
```

---

## 🎯 常见问题

### Q: imagePromptDetailed 可以留空吗？

A: 可以，Flux 会自动使用 CLIP-L (imagePrompt)。但建议填写以获得更好效果。

### Q: 两个 prompt 应该重复吗？

A: 不要完全重复。imagePrompt 定义整体，imagePromptDetailed 添加细节。

### Q: 多长的 prompt 合适？

A: 
- imagePrompt: 10-20 words
- imagePromptDetailed: 50-150 words

### Q: 如果 DeepSeek 生成的 prompt 太长怎么办？

A: 后端有 fallback 机制，会自动截断和优化。

---

## 🔗 相关文档

- [FLUX_DUAL_PROMPT_OPTIMIZATION.md](./FLUX_DUAL_PROMPT_OPTIMIZATION.md) - 技术实现细节
- [N8N_PARALLEL_REQUIREMENTS.md](../architecture/N8N_PARALLEL_REQUIREMENTS.md) - n8n 并行化需求

---

**创建日期**: 2025-11-23  
**更新日期**: 2025-11-23
