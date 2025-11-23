# WriteTalent 数据库方案实施指南

## 🎯 方案概述

本方案将 WriteTalent 从 **Mock 数据**迁移到 **PostgreSQL 数据库**，并从 YouTube @writetalent 频道导入 9 个真实视频数据。

### ✨ 核心特性

- ✅ **PostgreSQL** - 关系型数据库，支持复杂查询和事务
- ✅ **JSONB 字段** - 灵活存储视频元数据和 storybook 数据
- ✅ **自动化导入** - 从 YouTube 自动获取视频信息
- ✅ **生产就绪** - 支持百万级数据和并发访问
- ✅ **易于扩展** - 为腾讯云 COS 视频存储做好准备

---

## 🚀 快速开始（3 分钟）

### 方式 1: 一键安装（推荐）

```bash
cd /var/www/first_book_v2/backend
sudo bash scripts/quickstart.sh
```

这个脚本会自动：
1. ✅ 安装 PostgreSQL（Docker 或直接安装）
2. ✅ 创建数据库和用户
3. ✅ 配置环境变量
4. ✅ 从 YouTube 获取 9 个视频
5. ✅ 初始化数据库并导入数据
6. ✅ 切换到新的后端服务

### 方式 2: 手动安装

详细步骤请参考 [DATABASE_SETUP.md](./DATABASE_SETUP.md)

---

## 📂 项目文件结构

```
backend/
├── server.js                   # 原 Mock 数据版本（已备份为 server_old_mock.js）
├── server_new.js              # 新 PostgreSQL 版本（将替换 server.js）
├── package.json
├── .env                       # 环境变量配置（需创建）
├── .env.example              # 环境变量模板
│
├── db/
│   ├── config.js             # PostgreSQL 连接池配置
│   └── schema.sql            # 完整数据库 Schema
│
├── scripts/
│   ├── fetchYoutubeData.js   # YouTube 视频数据获取
│   ├── initDatabase.js       # 数据库初始化脚本
│   └── quickstart.sh         # 一键安装脚本
│
├── DATABASE_SETUP.md         # 详细设置指南
└── README_DATABASE.md        # 本文件
```

---

## 📊 数据库结构

### 核心数据表

| 表名 | 说明 | 关键字段 |
|-----|------|---------|
| `users` | 用户信息 | username, email, age, tokens, works_count |
| `portfolios` | 作品/视频 | title, theme, video_url, video_metadata (JSONB) |
| `likes` | 点赞关系 | user_id, portfolio_id |
| `comments` | 评论 | content, parent_comment_id (嵌套) |
| `follows` | 关注关系 | follower_id, following_id |
| `token_transactions` | Token 交易 | amount, type, reason |

### 视频数据示例

```json
{
  "id": 1,
  "title": "Adam's Jet Card Dream (Animation Version)",
  "theme": "creation-exploration",
  "video_url": "https://www.youtube.com/watch?v=pDyH0Xy2H6I",
  "video_metadata": {
    "youtube_id": "pDyH0Xy2H6I",
    "duration": 46,
    "view_count": 6,
    "thumbnail": "https://i.ytimg.com/vi/pDyH0Xy2H6I/hqdefault.jpg",
    "creator_location": "Tianjin"
  },
  "originality_score": 88,
  "rating": 4.5
}
```

---

## 🧪 测试 API

### 1. 健康检查
```bash
curl http://localhost:3001/api/health
```
预期输出：
```json
{
  "status": "OK",
  "message": "WriteTalent API is running!",
  "database": "connected"
}
```

### 2. 获取所有作品（9 个 YouTube 视频）
```bash
curl http://localhost:3001/api/portfolios | jq '.[].title'
```

### 3. 获取单个作品
```bash
curl http://localhost:3001/api/portfolios/1
```

### 4. 创建新作品
```bash
curl -X POST http://localhost:3001/api/portfolios \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Story",
    "theme": "fantasy-adventure",
    "story": "Once upon a time...",
    "video": "https://example.com/video.mp4"
  }'
```

---

## 🎬 YouTube 视频清单

从 [@writetalent](https://www.youtube.com/@writetalent) 频道导入的 9 个视频：

1. **WriteTalent Introduction** (56秒) - 平台介绍
2. **Adam's Jet Card Dream** (46秒) - 11岁，天津，设计中国战斗机卡牌
3. **Kitty: Korean Fashion Buyer** (34秒) - 澳洲留学生，韩国时尚买手
4. **Caterina: Me and AI** (74秒) - 11岁，上海，AI 与我的故事
5. **Jason: Healthy AI Agent** (59秒) - 13岁，北京，老年人健康 AI 助手
6. **Tony: Drone Tour of Fuzhou** (60秒) - 9岁，福州，无人机家乡游
7. **Sissi: Nature And AI** (57秒) - 8岁，香港，环保与 AI
8. **Adam: China Air Force Cards** (48秒) - 11岁，天津，中国空军卡牌设计
9. **Yania: Eldest Daughter** (77秒) - 11岁，上海，长女的经历

---

## 🔧 配置说明

### 环境变量 (.env)

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=writetalent
DB_USER=writetalent_user
DB_PASSWORD=writetalent2024

# 服务器配置
PORT=3001
NODE_ENV=production

# 邮件配置（用于密码重置）
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 数据库连接

```javascript
const { pool } = require('./db/config');

// 执行查询
const result = await pool.query('SELECT * FROM portfolios');
```

---

## 📈 性能优化

### 已实施的优化

1. **连接池** - 最多 20 个并发连接
2. **索引** - 在常用查询字段上创建索引
3. **JSONB** - 高效存储和查询 JSON 数据
4. **级联删除** - 自动维护数据完整性
5. **触发器** - 自动更新时间戳

### 查询示例

```sql
-- 按主题查询作品
SELECT * FROM portfolios 
WHERE theme = 'creation-exploration'
ORDER BY likes_count DESC
LIMIT 10;

-- 查询用户的所有作品
SELECT p.*, u.username 
FROM portfolios p
JOIN users u ON p.user_id = u.id
WHERE u.id = 1;

-- 搜索作品（全文搜索）
SELECT * FROM portfolios
WHERE title ILIKE '%AI%' OR story ILIKE '%AI%';
```

---

## 🚀 下一步：腾讯云 COS 集成

为即将到来的**千级视频**做准备：

### 1. 安装 COS SDK
```bash
npm install cos-nodejs-sdk-v5
```

### 2. 配置凭证
```bash
# 添加到 .env
TENCENT_COS_SECRET_ID=your_secret_id
TENCENT_COS_SECRET_KEY=your_secret_key
TENCENT_COS_BUCKET=writetalent-videos-1234567890
TENCENT_COS_REGION=ap-shanghai
```

### 3. 上传流程

```javascript
const COS = require('cos-nodejs-sdk-v5');
const { pool } = require('./db/config');

// 1. 上传视频到 COS
const cosUrl = await uploadToCOS(videoFile);

// 2. 写入数据库
await pool.query(`
  INSERT INTO portfolios (user_id, title, video_url, video_metadata)
  VALUES ($1, $2, $3, $4)
`, [userId, title, cosUrl, metadata]);
```

---

## 🐛 故障排除

### PostgreSQL 连接失败

```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql  # 直接安装
docker ps | grep postgres          # Docker 安装

# 检查端口
netstat -ln | grep 5432

# 查看日志
docker logs writetalent-postgres
```

### 权限问题

```sql
-- 授予所有权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO writetalent_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO writetalent_user;
```

### 重置数据库

```bash
# 删除并重新初始化
cd /var/www/first_book_v2/backend
node scripts/initDatabase.js
```

---

## 📚 相关文档

- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - 完整实施方案总结
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - 详细设置指南
- [db/schema.sql](./db/schema.sql) - 数据库 Schema

---

## 🎉 完成检查清单

- [ ] PostgreSQL 已安装并运行
- [ ] .env 文件已配置
- [ ] 数据库已初始化（运行 initDatabase.js）
- [ ] 9 个 YouTube 视频已导入
- [ ] API 健康检查通过
- [ ] 能够获取作品列表
- [ ] 后端服务已切换到 PostgreSQL 版本

---

**祝贺！** 🎊 您已成功将 WriteTalent 迁移到 PostgreSQL 数据库！

如有问题，请查看文档或联系技术团队。




