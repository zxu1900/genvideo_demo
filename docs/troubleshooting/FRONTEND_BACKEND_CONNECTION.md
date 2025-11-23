# 前端后端连接配置指南

## ❌ 问题：404 错误

```
Cannot POST /api/ai/generate-story
```

**原因：**
- 前端在开发模式下运行在 `localhost:3000`
- 后端运行在 `localhost:3002`
- 前端使用相对路径 `/api/...`，请求发送到了 `http://localhost:3000/api/...`
- 但前端开发服务器没有这个路由，所以返回 404

---

## ✅ 解决方案

### 方案 1: 配置环境变量（开发环境推荐）

已创建 `.env` 文件：
```bash
REACT_APP_API_URL=http://localhost:3002
```

**重启前端服务：**
```bash
# 停止当前前端服务（Ctrl+C 或）
pkill -f "react-scripts start"

# 重新启动
cd /home/frankyxu/Code/video/first_book_v2/frontend
npm start
```

**验证：**
- 前端应该能正常调用后端 API
- 浏览器 Console 中不再出现 404 错误

---

### 方案 2: 使用 Nginx 反向代理（生产环境）

如果使用 nginx，配置如下：

```nginx
server {
    listen 80;
    server_name localhost;

    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**使用 nginx 的步骤：**
```bash
# 1. 检查 nginx 配置
sudo nginx -t

# 2. 重载 nginx
sudo nginx -s reload

# 3. 前端访问 http://localhost（通过 nginx）
# 4. 前端不需要设置 REACT_APP_API_URL（使用相对路径）
```

---

### 方案 3: 使用 React 开发服务器代理（开发环境）

在 `package.json` 中添加 proxy 配置：

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "proxy": "http://localhost:3002",
  ...
}
```

**注意：** 这需要重启前端服务。

---

## 🎯 当前推荐配置

### 开发环境（本地测试）

**使用方案 1：环境变量**

```bash
# 前端 .env 文件
REACT_APP_API_URL=http://localhost:3002

# 启动服务
# 终端 1: 后端
cd backend && npm start

# 终端 2: 前端
cd frontend && npm start
```

**访问：**
- 前端：`http://localhost:3000`
- 后端：`http://localhost:3002`
- 前端会自动调用 `http://localhost:3002/api/...`

---

### 生产环境（使用 Nginx）

**配置 nginx：**
```bash
# 1. 更新 nginx 配置
sudo nano /etc/nginx/sites-available/writetalent

# 2. 确保配置正确（见上面的 nginx 配置示例）

# 3. 重启 nginx
sudo nginx -s reload
```

**前端构建：**
```bash
cd frontend
npm run build
# 构建文件在 frontend/build/
```

**访问：**
- 通过 nginx：`http://localhost` 或 `http://your-domain.com`
- 所有 `/api/...` 请求自动代理到后端

---

## 🔍 验证连接

### 1. 检查后端服务
```bash
curl http://localhost:3002/api/health
# 应该返回: {"status":"OK",...}
```

### 2. 检查前端配置
```bash
# 查看 .env 文件
cat frontend/.env
# 应该包含: REACT_APP_API_URL=http://localhost:3002
```

### 3. 测试 API 调用
```bash
# 在浏览器 Console 中
fetch('http://localhost:3002/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

## 📝 总结

| 环境 | 方案 | 配置 |
|------|------|------|
| **开发环境** | 环境变量 | `REACT_APP_API_URL=http://localhost:3002` |
| **生产环境** | Nginx 代理 | nginx 配置 `/api` 代理到 `localhost:3002` |

**当前状态：**
- ✅ 已创建 `.env` 文件
- ⚠️ **需要重启前端服务**以加载新配置
- ✅ 后端服务正常运行在 3002 端口

**下一步：**
1. 重启前端服务
2. 刷新浏览器
3. 测试 API 调用




