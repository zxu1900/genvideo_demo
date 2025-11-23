# 🚀 WriteTalent 数据库迁移 - 快速启动

## ⚡ 一键安装（推荐）

```bash
cd /var/www/first_book_v2/backend
sudo bash scripts/quickstart.sh
```

**这个脚本会自动完成所有步骤！**

---

## 📋 或手动执行

### Step 1: 安装 PostgreSQL (使用 Docker)
```bash
docker run --name writetalent-postgres \
  -e POSTGRES_PASSWORD=writetalent2024 \
  -e POSTGRES_DB=writetalent \
  -e POSTGRES_USER=writetalent_user \
  -p 5432:5432 \
  -d postgres:15
```

### Step 2: 配置环境变量
```bash
cd /var/www/first_book_v2/backend
cp .env.example .env
# 编辑 .env 文件，设置数据库密码等
```

### Step 3: 初始化数据库并导入 YouTube 数据
```bash
node scripts/initDatabase.js
```

### Step 4: 切换后端
```bash
cp server.js server_old_mock.js
cp server_new.js server.js
```

### Step 5: 启动服务
```bash
npm start
# 或
pm2 restart writetalent-backend
```

---

## ✅ 验证

```bash
# 健康检查
curl http://localhost:3001/api/health

# 查看9个视频
curl http://localhost:3001/api/portfolios
```

---

## 📖 详细文档

- **backend/README_DATABASE.md** - 完整使用指南
- **backend/DATABASE_SETUP.md** - 详细设置步骤
- **IMPLEMENTATION_SUMMARY.md** - 方案总结

---

**预计完成时间：3-5 分钟** ⏱️
