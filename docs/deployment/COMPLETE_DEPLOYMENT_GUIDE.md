# 🚀 WriteTalent 完整部署指南

## 📋 概览

本指南涵盖从 Mock 数据迁移到 PostgreSQL + YouTube 视频的完整部署流程。

---

## 🎯 部署目标

### 后端
- ❌ 移除内存中的 mock 数据
- ✅ 使用 PostgreSQL 数据库
- ✅ 导入 9 个 YouTube 视频数据

### 前端
- ❌ 移除硬编码的 mock 数据
- ✅ 从后端 API 获取数据
- ✅ 显示 9 个真实的 YouTube 视频

---

## 📖 分步部署

### 第一步：部署后端数据库

**时间：** 3-5 分钟

#### 选项 A：一键安装（推荐）

```bash
cd /var/www/first_book_v2/backend
sudo bash scripts/quickstart.sh
```

#### 选项 B：手动安装

```bash
# 1. 安装 PostgreSQL (Docker)
docker run --name writetalent-postgres \
  -e POSTGRES_PASSWORD=writetalent2024 \
  -e POSTGRES_DB=writetalent \
  -e POSTGRES_USER=writetalent_user \
  -p 5432:5432 \
  -d postgres:15

# 2. 配置环境变量
cd /var/www/first_book_v2/backend
cat > .env << 'EOF'
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=writetalent
DB_USER=writetalent_user
DB_PASSWORD=writetalent2024
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOF

# 3. 初始化数据库（自动获取 YouTube 数据）
node scripts/initDatabase.js

# 4. 切换到新后端
cp server.js server_old_mock.js
cp server_new.js server.js

# 5. 启动后端
npm start
# 或
pm2 restart writetalent-backend
```

#### 验证后端

```bash
# 健康检查
curl http://localhost:3001/api/health

# 应返回：
# {"status":"OK","message":"WriteTalent API is running!","database":"connected"}

# 查看 9 个视频
curl http://localhost:3001/api/portfolios | jq '.[].title'

# 应显示 9 个标题：
# "WriteTalent Introduction"
# "Adam's Jet Card Dream (Animation Version)"
# "Kitty "How to be A Korean Fashion Buyer""
# ...
```

---

### 第二步：更新并构建前端

**时间：** 2-3 分钟

#### 一键构建

```bash
cd /var/www/first_book_v2/frontend
bash build.sh
```

#### 手动构建

```bash
cd /var/www/first_book_v2/frontend

# 1. 配置 API URL（可选）
# 创建 .env 文件，默认使用 http://localhost:3001
# REACT_APP_API_URL=http://localhost:3001

# 2. 安装依赖
npm install

# 3. 构建
npm run build
```

#### 验证前端构建

```bash
# 检查构建输出
ls -lh build/

# 本地测试
npx serve -s build -p 3000

# 访问 http://localhost:3000/portfolio
# 应该看到 9 个 YouTube 视频
```

---

### 第三步：更新 Nginx 配置（生产环境）

#### 1. 更新 Nginx 配置

```bash
sudo nano /opt/webserver/openresty/nginx/conf/vhost/writetalent.conf
```

确保配置如下：

```nginx
server {
    listen 80;
    server_name writetalent.chat www.writetalent.chat;
    
    # 前端静态文件
    root /var/www/first_book_v2/frontend/build;
    index index.html;
    
    # React Router 支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 静态资源缓存
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

#### 2. 测试并重载 Nginx

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo nginx -s reload
```

---

## ✅ 完整验证清单

### 后端验证

- [ ] PostgreSQL 正在运行
  ```bash
  docker ps | grep postgres
  # 或
  sudo systemctl status postgresql
  ```

- [ ] 数据库连接成功
  ```bash
  curl http://localhost:3001/api/health
  ```

- [ ] 9 个视频已导入
  ```bash
  curl http://localhost:3001/api/portfolios | jq 'length'
  # 应返回: 9
  ```

- [ ] 视频包含正确的元数据
  ```bash
  curl http://localhost:3001/api/portfolios/1 | jq '{title, video_url, creator_name}'
  ```

### 前端验证

- [ ] 构建成功
  ```bash
  ls -lh /var/www/first_book_v2/frontend/build/index.html
  ```

- [ ] Portfolio 页面显示 9 个视频
  - 访问: http://writetalent.chat/portfolio
  - 预期: 看到 9 个作品而不是 2 个

- [ ] 作品详情页正常加载
  - 点击任意作品
  - 预期: 显示完整的作品信息

- [ ] 用户资料页正常工作
  - 访问: http://writetalent.chat/profile/1
  - 预期: 显示用户信息和作品列表

### 功能验证

- [ ] 搜索功能正常
- [ ] 主题筛选正常
- [ ] 排序功能正常（最新、最多点赞、最原创）
- [ ] 点赞功能正常
- [ ] 页面加载状态正常显示

---

## 🎬 数据对比

### 部署前

| 项目 | 值 |
|------|---|
| 后端数据源 | 内存数组 |
| 作品数量 | 2 个硬编码 |
| 数据持久化 | ❌ 否 |
| 真实视频 | ❌ 否 |
| 生产就绪 | ❌ 否 |

### 部署后

| 项目 | 值 |
|------|---|
| 后端数据源 | PostgreSQL |
| 作品数量 | **9 个 YouTube 视频** |
| 数据持久化 | ✅ 是 |
| 真实视频 | ✅ 是 |
| 生产就绪 | ✅ 是 |

---

## 📊 YouTube 视频清单

部署后应看到以下 9 个视频：

| # | 标题 | 创作者 | 年龄 | 主题 |
|---|------|--------|------|------|
| 1 | WriteTalent Introduction | - | - | creation-exploration |
| 2 | Adam's Jet Card Dream | Adam | 11 | creation-exploration |
| 3 | Kitty: Korean Fashion Buyer | Kitty | 16+ | creation-exploration |
| 4 | Caterina: Me and AI | Caterina | 11 | creation-exploration |
| 5 | Jason: Healthy AI Agent | Jason | 13 | society-world |
| 6 | Tony: Drone Tour of Fuzhou | Tony | 9 | creation-exploration |
| 7 | Sissi: Nature And AI | Sissi | 8 | society-world |
| 8 | Adam: China Air Force Cards | Adam | 11 | creation-exploration |
| 9 | Yania: Eldest Daughter | Yania | 11 | self-growth |

---

## 🔧 故障排除

### 问题 1: 前端显示 "Failed to fetch portfolios"

**原因：** 后端未运行或 CORS 配置问题

**解决：**
```bash
# 检查后端
curl http://localhost:3001/api/health

# 重启后端
cd /var/www/first_book_v2/backend
npm start
```

### 问题 2: 仍然显示 2 个 mock 作品

**原因：** 前端未重新构建或浏览器缓存

**解决：**
```bash
# 清空并重新构建
cd /var/www/first_book_v2/frontend
rm -rf build/
npm run build

# 清空浏览器缓存（Ctrl + Shift + R）
```

### 问题 3: PostgreSQL 连接失败

**原因：** 数据库未启动或配置错误

**解决：**
```bash
# Docker
docker ps | grep postgres
docker start writetalent-postgres

# 检查配置
cat /var/www/first_book_v2/backend/.env
```

### 问题 4: Nginx 404 错误

**原因：** Nginx 配置错误或前端路径不正确

**解决：**
```bash
# 检查 build 目录
ls -la /var/www/first_book_v2/frontend/build/

# 测试 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /opt/webserver/openresty/nginx/logs/error.log
```

---

## 🚀 下一步：腾讯云 COS 集成

当准备生成千级视频时：

### 1. 安装 COS SDK

```bash
cd /var/www/first_book_v2/backend
npm install cos-nodejs-sdk-v5
```

### 2. 配置 COS

在 `.env` 中添加：

```bash
TENCENT_COS_SECRET_ID=your_secret_id
TENCENT_COS_SECRET_KEY=your_secret_key
TENCENT_COS_BUCKET=writetalent-videos-1234567890
TENCENT_COS_REGION=ap-shanghai
```

### 3. 视频上传流程

```javascript
// 1. AIGC 生成视频
const videoFile = await generateVideo(prompt);

// 2. 上传到 COS
const cosUrl = await uploadToCOS(videoFile);

// 3. 写入数据库
await pool.query(`
  INSERT INTO portfolios (user_id, title, video_url, video_metadata)
  VALUES ($1, $2, $3, $4)
`, [userId, title, cosUrl, metadata]);
```

---

## 📈 性能监控

### 数据库性能

```sql
-- 查看慢查询
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

-- 查看表大小
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### API 响应时间

添加监控中间件：

```javascript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

---

## 📚 相关文档

- [QUICK_START.md](./QUICK_START.md) - 快速开始
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 实施方案总结
- [backend/README_DATABASE.md](./backend/README_DATABASE.md) - 数据库使用指南
- [backend/DATABASE_SETUP.md](./backend/DATABASE_SETUP.md) - 数据库详细设置
- [FRONTEND_UPDATE_GUIDE.md](./FRONTEND_UPDATE_GUIDE.md) - 前端更新指南

---

## 🎉 完成！

恭喜！您已成功完成：

✅ PostgreSQL 数据库部署  
✅ 9 个 YouTube 视频导入  
✅ 后端 API 迁移  
✅ 前端代码更新  
✅ 完整系统集成

**下周千级视频生成时，只需：**
1. 配置腾讯云 COS
2. 批量上传视频
3. 写入数据库

系统已准备就绪！🚀

---

**需要帮助？** 查看故障排除部分或联系技术团队。




