# WriteTalent Database Setup Guide

## 数据库架构说明

我们选择了 **PostgreSQL** 作为主数据库，原因如下：

### PostgreSQL 优势
1. ✅ **强关系完整性** - 用户、作品、点赞、评论之间的复杂关系
2. ✅ **JSONB 灵活性** - 存储视频元数据等灵活数据
3. ✅ **强大查询能力** - 支持复杂的 JOIN、聚合、分析查询
4. ✅ **ACID 事务** - 保证数据一致性（用户 tokens、支付等）
5. ✅ **可扩展性** - 轻松处理百万级数据

## 快速开始

### 1. 安装 PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**MacOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Docker (推荐用于开发):**
```bash
docker run --name writetalent-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=writetalent \
  -p 5432:5432 \
  -d postgres:15
```

### 2. 创建数据库

```bash
# 登录 PostgreSQL
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE writetalent;
CREATE USER writetalent_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE writetalent TO writetalent_user;

# 退出
\q
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填入数据库信息：

```bash
cd /var/www/first_book_v2/backend
cp .env.example .env
nano .env
```

修改以下配置：
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=writetalent
DB_USER=writetalent_user
DB_PASSWORD=your_secure_password
```

### 4. 初始化数据库

运行初始化脚本（会自动创建表结构并导入 YouTube 视频数据）：

```bash
cd /var/www/first_book_v2/backend
node scripts/initDatabase.js
```

这个脚本会：
- ✅ 创建所有表（users, portfolios, likes, comments 等）
- ✅ 从 YouTube 获取 @writetalent 的 9 个视频元数据
- ✅ 创建默认用户（Adam, Kitty, Caterina 等）
- ✅ 将视频数据写入 portfolios 表

### 5. 启动服务器

```bash
# 备份旧的 server.js
mv server.js server_old.js

# 使用新的数据库版本
mv server_new.js server.js

# 启动服务器
npm start
```

## 数据库结构

### 主要表

#### users (用户表)
- id, username, email, password_hash
- age, type (child/parent)
- tokens, followers_count, following_count, works_count

#### portfolios (作品表)
- id, user_id, title, theme
- story, storybook (JSONB)
- video_url, video_metadata (JSONB)
- originality_score, likes_count, views_count, rating

#### likes (点赞表)
- user_id, portfolio_id (多对多关系)

#### comments (评论表)
- user_id, portfolio_id, content
- parent_comment_id (支持嵌套评论)

#### follows (关注表)
- follower_id, following_id

### 索引优化

已创建以下索引优化查询性能：
- portfolios: user_id, theme, created_at, likes_count
- likes: portfolio_id, user_id
- comments: portfolio_id, user_id

## 测试

测试 API 端点：

```bash
# 健康检查
curl http://localhost:3001/api/health

# 获取所有作品
curl http://localhost:3001/api/portfolios

# 获取单个作品
curl http://localhost:3001/api/portfolios/1
```

## 视频数据结构

每个视频在 portfolios 表中包含：

```json
{
  "title": "视频标题",
  "theme": "creation-exploration",
  "story": "视频描述",
  "video_url": "https://www.youtube.com/watch?v=...",
  "video_metadata": {
    "youtube_id": "...",
    "duration": 60,
    "view_count": 100,
    "thumbnail": "https://...",
    "upload_date": "20241101",
    "creator_location": "Shanghai"
  }
}
```

## 下一步：腾讯云 COS 集成

当准备生成千级视频时，需要：

1. 安装腾讯云 SDK:
```bash
npm install cos-nodejs-sdk-v5
```

2. 配置 COS 凭证（在 .env 中）
3. 视频上传到 COS 后，将 URL 写入 `portfolios.video_url`
4. 元数据存储在 `video_metadata` JSONB 字段

## 故障排除

### 连接失败
```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 检查端口是否监听
netstat -ln | grep 5432
```

### 权限问题
```sql
-- 授予表权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO writetalent_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO writetalent_user;
```

## 备份与恢复

### 备份
```bash
pg_dump -U writetalent_user -h localhost writetalent > backup.sql
```

### 恢复
```bash
psql -U writetalent_user -h localhost writetalent < backup.sql
```

---

**需要帮助？** 请联系技术团队或查看 PostgreSQL 官方文档。

