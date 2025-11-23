# 视频无法加载问题分析

## 🔍 问题场景

**情况：**
- ✅ 前端能收到 `status: "completed"` 状态
- ✅ 前端能收到 `videoUrl`（有值）
- ❌ 但是视频无法加载/播放

---

## 🤔 可能的原因

### 原因 1: videoUrl 格式错误（最可能）

**问题：**
n8n 回调节点中：
```json
"videoUrl": "http://49.235.210.6:8001/output/{{ $json.filename || $json.output_filename || 'video.mp4' }}"
```

**如果字段名不对：**
- 如果 `$json.filename` 不存在
- 如果 `$json.output_filename` 也不存在
- 会使用默认值 `'video.mp4'`
- 最终 URL：`http://49.235.210.6:8001/output/video.mp4`
- **但这个文件可能不存在！**

**结果：**
- ✅ 前端收到：`{ status: "completed", videoUrl: "http://49.235.210.6:8001/output/video.mp4" }`
- ❌ 浏览器尝试加载：`http://49.235.210.6:8001/output/video.mp4`
- ❌ 服务器返回 404，视频无法加载

**验证方法：**
```bash
# 测试这个 URL 是否存在
curl -I http://49.235.210.6:8001/output/video.mp4

# 如果返回 404，说明文件不存在
```

---

### 原因 2: 视频 URL 路径错误

**问题：**
- n8n 生成的 URL 路径可能不正确
- 实际视频文件可能在另一个路径下

**可能的情况：**
- 实际路径：`http://49.235.210.6:8001/videos/final_story_video_xxx.mp4`
- n8n 生成的：`http://49.235.210.6:8001/output/video.mp4`
- 路径不匹配，导致 404

---

### 原因 3: CORS 跨域问题

**问题：**
- 视频服务器可能不允许跨域访问
- 浏览器会阻止视频加载

**表现：**
- 浏览器 Console 中会看到 CORS 错误
- 视频标签显示，但无法播放

**验证方法：**
```bash
# 检查 CORS 头
curl -I http://49.235.210.6:8001/output/test.mp4

# 查看响应头中是否有：
# Access-Control-Allow-Origin: *
```

---

### 原因 4: 视频格式不支持

**问题：**
- 视频文件格式浏览器不支持
- 或视频文件损坏

**表现：**
- 视频标签显示，但无法播放
- 浏览器 Console 可能有格式错误

---

### 原因 5: 视频服务器不可访问

**问题：**
- 视频服务器可能不在线
- 或网络无法访问

**验证方法：**
```bash
# 测试服务器是否可访问
curl -I http://49.235.210.6:8001

# 测试具体文件
curl -I http://49.235.210.6:8001/output/test.mp4
```

---

## 🔍 诊断步骤

### 步骤 1: 检查前端收到的 videoUrl

**在浏览器 Console 中：**
```javascript
// 查看实际收到的 videoUrl
console.log('Video URL:', videoUrl);

// 尝试直接访问
window.open(videoUrl, '_blank');
```

**检查：**
- videoUrl 是否有值？
- videoUrl 格式是否正确？
- videoUrl 是否包含实际文件名？

---

### 步骤 2: 测试视频 URL 可访问性

**在浏览器中：**
1. 复制 videoUrl
2. 在新标签页中直接访问
3. 查看是否能下载/播放

**或使用 curl：**
```bash
curl -I <videoUrl>
# 查看 HTTP 状态码
# 200 = 文件存在
# 404 = 文件不存在
# 403 = 权限问题
```

---

### 步骤 3: 检查浏览器 Console

**打开浏览器开发者工具：**
- 查看 Network 标签
- 找到视频请求
- 查看状态码和错误信息

**常见错误：**
- `404 Not Found` = 文件不存在
- `CORS policy` = 跨域问题
- `Failed to load resource` = 网络问题

---

### 步骤 4: 检查 n8n workflow 输出

**在 n8n 中：**
1. 执行一次 workflow
2. 查看"合并最终视频"节点的输出
3. 确认实际的文件名字段

**需要确认：**
- 字段名是什么？（`filename`、`output_filename`、`video_url` 等）
- 是否包含完整 URL？
- 还是只有文件名？

---

## 🎯 最可能的情况

### 情况 A: 字段名不对，使用默认值

**表现：**
- ✅ 前端收到 completed
- ✅ videoUrl 有值：`http://49.235.210.6:8001/output/video.mp4`
- ❌ 但这个文件不存在（因为实际文件名不是 video.mp4）

**解决：**
- 在 n8n 中确认正确的字段名
- 修改回调节点的 JSON 表达式

---

### 情况 B: 路径不对

**表现：**
- ✅ 前端收到 completed
- ✅ videoUrl 有值，但路径错误
- ❌ 文件在另一个路径下

**解决：**
- 确认视频文件的实际存储路径
- 修改 n8n 回调节点的 URL 构建逻辑

---

### 情况 C: CORS 问题

**表现：**
- ✅ 前端收到 completed
- ✅ videoUrl 有值且正确
- ❌ 浏览器 Console 显示 CORS 错误

**解决：**
- 配置视频服务器的 CORS
- 或使用代理服务器

---

## 💡 快速诊断命令

```bash
# 1. 测试视频服务器是否可访问
curl -I http://49.235.210.6:8001

# 2. 测试默认文件名是否存在
curl -I http://49.235.210.6:8001/output/video.mp4

# 3. 列出 output 目录下的文件（如果可能）
curl http://49.235.210.6:8001/output/

# 4. 测试一个已知存在的视频文件
curl -I http://49.235.210.6:8001/output/<实际文件名>.mp4
```

---

## 📝 总结

**我的意思是：**
- ✅ 前端逻辑是正确的，能收到 completed 状态
- ✅ 前端能收到 videoUrl（有值，不是 null）
- ❌ 但是 videoUrl 可能是错误的（字段名不对导致使用默认值）
- ❌ 或者 videoUrl 正确但无法访问（CORS、路径、服务器问题）

**关键问题：**
1. **videoUrl 的值是什么？**（需要查看实际收到的值）
2. **这个 URL 是否可以访问？**（需要测试）
3. **n8n 回调节点的字段名是否正确？**（需要确认）

**建议：**
1. 先在前端 Console 中查看实际收到的 videoUrl
2. 然后测试这个 URL 是否可以访问
3. 如果 URL 错误，检查 n8n workflow 的输出字段




