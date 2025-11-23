# 📁 WriteTalent 项目结构

本文档描述 WriteTalent 项目的目录结构和文件组织。

**更新日期**: 2025-11-23

---

## 🌳 目录树

```
first_book_v2/
├── README.md                      # 项目说明
├── PROJECT_STRUCTURE.md           # 本文件
│
├── docs/                          # 📚 所有文档（新整理）
│   ├── README.md                  # 文档索引
│   ├── deployment/                # 部署相关
│   ├── architecture/              # 架构设计
│   ├── features/                  # 功能实现
│   ├── backend/                   # 后端专用文档
│   ├── troubleshooting/           # 问题修复记录
│   ├── testing/                   # 测试文档
│   ├── security/                  # 安全审查
│   └── summary/                   # 项目总结
│
├── frontend/                      # 前端代码（React）
│   ├── public/                    # 静态资源
│   ├── src/                       # 源代码
│   │   ├── components/            # 通用组件
│   │   ├── pages/                 # 页面组件
│   │   ├── utils/                 # 工具函数
│   │   ├── App.tsx                # 应用入口
│   │   └── index.tsx              # 渲染入口
│   ├── package.json               # 前端依赖
│   ├── .env                       # 前端环境变量（需创建）
│   ├── stop_frontend.sh           # 停止前端服务
│   └── restart_frontend.sh        # 重启前端服务
│
├── backend/                       # 后端代码（Node.js + Express）
│   ├── server.js                  # 主服务器文件
│   ├── package.json               # 后端依赖
│   ├── .env                       # 后端环境变量（需创建）
│   │
│   ├── db/                        # 数据库相关
│   │   ├── config.js              # 数据库连接配置
│   │   ├── schema.sql             # 数据库表结构
│   │   └── init.sql               # 初始化数据
│   │
│   ├── services/                  # 业务服务
│   │   ├── aiService.js           # AI 服务（DeepSeek）
│   │   └── comfyService.js        # ComfyUI 图像生成
│   │
│   ├── scripts/                   # 脚本工具
│   │   ├── quickstart.sh          # 一键安装数据库
│   │   ├── fetchYoutubeData.js    # 抓取 YouTube 数据
│   │   └── testDeepSeek.js        # 测试 DeepSeek API
│   │
│   ├── n8n/                       # n8n 工作流
│   │   └── story_final_v2.json    # 视频生成工作流
│   │
│   ├── test_image_callback.sh     # 测试图像回调
│   ├── test_callback_simple.sh    # 简单回调测试
│   ├── ngrok_quick_start.sh       # ngrok 安装脚本
│   ├── ngrok_manage.sh            # ngrok 管理脚本
│   └── update_backend_url.sh      # 更新 BACKEND_URL
│
└── node_modules/                  # 依赖包（自动生成）
```

---

## 📂 详细说明

### 根目录

| 文件/目录 | 说明 |
|----------|------|
| `README.md` | 项目主说明文件 |
| `PROJECT_STRUCTURE.md` | 本文件，项目结构说明 |
| `docs/` | 所有项目文档（按分类整理） |
| `frontend/` | 前端代码和资源 |
| `backend/` | 后端代码和服务 |
| `.gitignore` | Git 忽略配置 |

---

### 📚 docs/ - 文档目录（新整理）

所有文档按功能分类存放，便于查找和维护。

| 子目录 | 说明 | 包含文档数量 |
|-------|------|------------|
| `deployment/` | 部署相关（快速开始、完整指南） | 3 |
| `architecture/` | 架构设计（n8n、ComfyUI 方案） | 2 |
| `features/` | 功能实现（Step 2/6、故事生成） | 6 |
| `backend/` | 后端专用（数据库、n8n、ngrok） | 9 |
| `troubleshooting/` | 问题修复记录 | 5 |
| `testing/` | 测试相关 | 4 |
| `security/` | 安全审查 | 1 |
| `summary/` | 项目总结 | 3 |

📖 **查看详细索引**: [docs/README.md](./docs/README.md)

---

### 🎨 frontend/ - 前端代码

React 单页应用，使用 TypeScript 和 TailwindCSS。

```
frontend/
├── public/
│   ├── index.html              # HTML 模板
│   └── favicon.ico             # 网站图标
│
├── src/
│   ├── components/             # 可复用组件
│   │   ├── Auth/              # 认证相关组件
│   │   ├── Layout/            # 布局组件
│   │   └── Common/            # 通用组件
│   │
│   ├── pages/                 # 页面组件
│   │   ├── home/              # 首页
│   │   ├── portfolio/         # 作品集（核心功能）
│   │   ├── profile/           # 用户资料
│   │   └── auth/              # 认证页面
│   │
│   ├── utils/                 # 工具函数
│   │   ├── api.ts             # API 封装
│   │   └── helpers.ts         # 辅助函数
│   │
│   ├── App.tsx                # 应用主组件
│   ├── index.tsx              # 入口文件
│   └── index.css              # 全局样式
│
├── package.json               # 依赖配置
├── tsconfig.json              # TypeScript 配置
├── tailwind.config.js         # TailwindCSS 配置
├── .env                       # 环境变量（需创建）
└── README.md                  # 前端说明
```

**关键文件**:
- `src/pages/portfolio/PortfolioCreate.tsx` - 作品创作主页面（6 个步骤）
- `.env` - 配置 `REACT_APP_API_URL=http://localhost:3002`

---

### ⚙️ backend/ - 后端代码

Node.js + Express 后端服务，集成 PostgreSQL、DeepSeek AI、ComfyUI 和 n8n。

```
backend/
├── server.js                  # 主服务器（所有路由）
├── package.json               # 依赖配置
├── .env                       # 环境变量（需创建）
│
├── db/                        # 数据库
│   ├── config.js              # PostgreSQL 连接配置
│   ├── schema.sql             # 表结构定义
│   └── init.sql               # 初始数据
│
├── services/                  # 业务服务
│   ├── aiService.js           # DeepSeek AI（故事生成、原创度）
│   └── comfyService.js        # ComfyUI（图像生成）
│
├── scripts/                   # 脚本工具
│   ├── quickstart.sh          # 一键安装 PostgreSQL
│   ├── fetchYoutubeData.js    # 抓取 YouTube 视频数据
│   └── testDeepSeek.js        # 测试 DeepSeek API 连接
│
├── n8n/                       # n8n 工作流
│   └── story_final_v2.json    # 视频生成工作流（导入到 n8n）
│
└── [测试/管理脚本]
    ├── test_image_callback.sh     # 测试图像回调
    ├── test_callback_simple.sh    # 简单回调测试
    ├── ngrok_quick_start.sh       # 安装 ngrok
    ├── ngrok_manage.sh            # 管理 ngrok 进程
    └── update_backend_url.sh      # 更新 BACKEND_URL
```

**关键文件**:
- `server.js` - 所有 API 路由和业务逻辑
- `services/aiService.js` - DeepSeek AI 集成
- `services/comfyService.js` - ComfyUI 图像生成
- `.env` - 环境变量配置（API Key、数据库等）

**环境变量示例** (`.env`):
```bash
# Server
PORT=3002
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=writetalent
DB_USER=postgres
DB_PASSWORD=your_password

# AI Services
DEEPSEEK_API_KEY=sk-your-key-here

# n8n
N8N_BASE_URL=http://49.235.210.6:5678

# Backend
BACKEND_URL=http://localhost:3002

# ComfyUI
COMFYUI_BASE_URL=http://49.235.210.6:8001

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 🔧 配置文件

### 必需的配置文件

| 文件 | 位置 | 说明 | 是否必需 |
|-----|------|------|---------|
| `.env` | `backend/.env` | 后端环境变量 | ✅ 必需 |
| `.env` | `frontend/.env` | 前端环境变量 | ✅ 必需 |
| `.gitignore` | 根目录 | Git 忽略配置 | ✅ 已存在 |

### 自动生成的文件

| 文件 | 位置 | 说明 |
|-----|------|------|
| `node_modules/` | 各目录 | npm 依赖包 |
| `package-lock.json` | 各目录 | 依赖版本锁定 |
| `build/` | `frontend/` | 前端构建产物 |

---

## 📝 脚本工具

### 后端脚本

| 脚本 | 功能 | 使用场景 |
|-----|------|---------|
| `scripts/quickstart.sh` | 一键安装数据库 | 初次部署 |
| `test_image_callback.sh` | 测试图像回调 | 开发测试 |
| `ngrok_quick_start.sh` | 安装 ngrok | 本地测试 n8n 回调 |
| `ngrok_manage.sh` | 管理 ngrok | 查看/停止 ngrok |
| `update_backend_url.sh` | 更新回调 URL | ngrok 重启后 |

### 前端脚本

| 脚本 | 功能 |
|-----|------|
| `stop_frontend.sh` | 停止前端服务 |
| `restart_frontend.sh` | 重启前端服务 |

---

## 🚀 快速启动

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 2. 配置环境变量

```bash
# 后端
cp backend/.env.example backend/.env  # 如果有示例文件
# 编辑 backend/.env，填入真实值

# 前端
echo "REACT_APP_API_URL=http://localhost:3002" > frontend/.env
```

### 3. 启动数据库

```bash
cd backend
./scripts/quickstart.sh  # 一键安装 PostgreSQL
```

### 4. 启动服务

```bash
# 后端（终端 1）
cd backend
npm start

# 前端（终端 2）
cd frontend
npm start
```

### 5. 访问应用

- **前端**: http://localhost:3000
- **后端**: http://localhost:3002

---

## 📦 依赖关系

```
前端 (React)
   ↓ HTTP
后端 (Node.js + Express)
   ↓
   ├─→ PostgreSQL (数据库)
   ├─→ DeepSeek API (故事生成)
   ├─→ ComfyUI (图像生成)
   └─→ n8n (视频生成工作流)
```

---

## 🔒 安全注意事项

1. **`.env` 文件**
   - ✅ 已被 `.gitignore` 排除
   - ⚠️ 不要提交到 Git
   - ⚠️ 不要在代码中硬编码 API Key

2. **API Key**
   - DeepSeek API Key: `backend/.env` → `DEEPSEEK_API_KEY`
   - 数据库密码: `backend/.env` → `DB_PASSWORD`
   - 邮箱密码: `backend/.env` → `EMAIL_PASS`

3. **安全审查**
   - 查看: [docs/security/API_KEY_SECURITY_AUDIT.md](./docs/security/API_KEY_SECURITY_AUDIT.md)

---

## 📚 更多信息

- **完整文档**: [docs/README.md](./docs/README.md)
- **快速开始**: [docs/deployment/QUICK_START.md](./docs/deployment/QUICK_START.md)
- **部署指南**: [docs/deployment/COMPLETE_DEPLOYMENT_GUIDE.md](./docs/deployment/COMPLETE_DEPLOYMENT_GUIDE.md)

---

**项目**: WriteTalent  
**最后更新**: 2025-11-23
