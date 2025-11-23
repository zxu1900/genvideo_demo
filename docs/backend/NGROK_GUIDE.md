# ngrok 完整指南

## 🌟 什么是 ngrok？

**ngrok** 是一个反向隧道工具，可以将你本地运行的服务暴露到公网上，让外部服务器（如 n8n）能够访问你的本地开发环境。

### 简单理解

想象一下：
- 你的后端服务运行在 `localhost:3002`（只有本机可以访问）
- n8n 服务器在远程 `49.235.210.6`（无法访问你的本地服务）
- **ngrok 就像一个"桥梁"**，创建一个公网地址，转发到你的本地服务

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  你的本地    │         │   ngrok      │         │  n8n 服务器  │
│  服务器      │────────▶│  云服务器    │────────▶│             │
│ localhost:3002│         │ abc.ngrok.io │         │ 49.235.210.6│
└─────────────┘         └──────────────┘         └─────────────┘
   本地地址                公网地址（临时）           远程服务器
```

---

## 🎯 为什么需要 ngrok？

### 问题场景

在我们的项目中：
1. **后端服务**运行在你的本地开发机：`192.168.2.156:3002`
2. **n8n 工作流**运行在远程服务器：`49.235.210.6:5678`
3. **n8n 需要回调**你的后端：`POST http://你的地址/api/drama/callback/xxx`

**问题：**
- ❌ n8n 服务器无法直接访问你的本地 IP（不在同一网络）
- ❌ 即使在同一网络，也可能被防火墙拦截
- ❌ 本地开发环境通常没有公网 IP

**解决方案：**
- ✅ ngrok 创建一个公网 URL（如 `https://abc123.ngrok.io`）
- ✅ 这个 URL 自动转发到你的 `localhost:3002`
- ✅ n8n 可以通过这个公网 URL 回调你的本地服务

---

## 📦 安装 ngrok

### 方法 1: 直接下载（推荐）

```bash
# 下载 Linux 版本
cd /tmp
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz

# 解压
tar -xvzf ngrok-v3-stable-linux-amd64.tgz

# 移动到系统路径
sudo mv ngrok /usr/local/bin/

# 验证安装
ngrok version
```

### 方法 2: 使用包管理器

```bash
# Ubuntu/Debian (如果 snap 可用)
sudo snap install ngrok

# 或使用包管理器
# 注意：某些发行版可能没有 ngrok 包
```

### 方法 3: 使用 Homebrew (Mac)

```bash
brew install ngrok/ngrok/ngrok
```

---

## 🚀 快速开始

### 基础使用

```bash
# 最简单的用法：暴露本地 3002 端口
ngrok http 3002
```

**输出示例：**
```
ngrok                                                                              
                                                                                   
Session Status                online                                               
Account                       Your Account (Plan: Free)                            
Version                       3.x.x                                                
Region                        United States (us)                                   
Latency                       -                                                   
Web Interface                 http://127.0.0.1:4040                               
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3002
                                                                                   
Connections                   ttl     opn     rt1     rt5     p50     p90           
                              0       0       0.00    0.00    0.00    0.00         
```

**关键信息：**
- ✅ **Forwarding URL**: `https://abc123.ngrok-free.app` - 这是公网地址
- ✅ **Web Interface**: `http://127.0.0.1:4040` - 本地管理界面，可以查看请求日志

### 测试访问

```bash
# 在另一个终端测试
curl https://abc123.ngrok-free.app/api/health

# 应该返回你的本地服务响应
```

---

## 🔧 高级配置

### 1. 使用配置文件

创建配置文件 `~/.ngrok2/ngrok.yml`：

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN  # 从 ngrok.com 获取

tunnels:
  backend:
    addr: 3002
    proto: http
    subdomain: writetalent-backend  # 需要付费计划
```

**使用配置：**
```bash
ngrok start backend
```

### 2. 固定域名（需要付费）

免费版每次启动 URL 都会变化，付费版可以固定域名：

```bash
# 注册账号: https://dashboard.ngrok.com
# 获取 authtoken
ngrok config add-authtoken YOUR_TOKEN

# 使用固定域名
ngrok http 3002 --domain=writetalent-backend.ngrok-free.app
```

### 3. 自定义域名（需要付费计划）

```bash
ngrok http 3002 --domain=your-custom-domain.com
```

---

## 🎯 在我们的项目中使用

### Step 1: 启动后端服务

```bash
cd /home/frankyxu/Code/video/first_book_v2/backend
npm start &
```

### Step 2: 启动 ngrok

```bash
# 暴露 3002 端口
ngrok http 3002
```

**记录输出的 URL**，例如：`https://abc123.ngrok-free.app`

### Step 3: 更新环境变量

```bash
cd /home/frankyxu/Code/video/first_book_v2/backend

# 编辑 .env 文件
nano .env

# 修改这一行：
BACKEND_URL=https://abc123.ngrok-free.app

# 保存并重启后端
pkill -f "node server.js"
npm start &
```

### Step 4: 验证

```bash
# 测试公网访问
curl https://abc123.ngrok-free.app/api/health

# 应该返回：
# {"status":"OK","message":"WriteTalent API is running!","database":"connected"}
```

### Step 5: 测试 n8n 回调

现在 n8n 可以通过这个 URL 回调你的本地服务了！

---

## 📊 ngrok Web 界面

ngrok 启动后会提供一个本地 Web 界面：`http://127.0.0.1:4040`

**功能：**
- 📋 查看所有请求日志
- 🔍 检查请求/响应详情
- 🐛 调试 API 调用
- 📈 查看流量统计

**使用场景：**
- 调试 n8n 回调请求
- 查看请求头、请求体
- 检查响应状态码

---

## ⚠️ 注意事项

### 1. 免费版限制

- ❌ **URL 每次启动都会变化**（除非使用固定域名）
- ❌ **连接数限制**（免费版有并发限制）
- ❌ **会话时长限制**（长时间运行可能断开）
- ❌ **带宽限制**

### 2. 安全性

- ⚠️ **公网暴露**：你的本地服务会暴露到公网
- ✅ **HTTPS**：ngrok 默认使用 HTTPS，数据加密传输
- ⚠️ **访问控制**：建议添加认证或 IP 白名单

**安全建议：**
```bash
# 使用 IP 白名单（需要付费）
ngrok http 3002 --ip-whitelist=49.235.210.6

# 或添加基本认证
ngrok http 3002 --basic-auth="username:password"
```

### 3. 性能

- ⚠️ 所有流量都经过 ngrok 服务器，会有延迟
- ⚠️ 不适合生产环境高并发场景
- ✅ 适合开发和测试环境

---

## 🔄 替代方案

### 1. **localtunnel**（免费，开源）

```bash
npm install -g localtunnel

# 使用
lt --port 3002
# 输出: https://xxx.loca.lt
```

**优点：** 免费、开源、简单  
**缺点：** URL 每次变化、可能不稳定

### 2. **serveo**（免费，无需安装）

```bash
ssh -R 80:localhost:3002 serveo.net
```

**优点：** 无需安装、免费  
**缺点：** 需要 SSH、可能不稳定

### 3. **Cloudflare Tunnel**（免费，稳定）

```bash
# 安装
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared

# 使用
cloudflared tunnel --url http://localhost:3002
```

**优点：** 免费、稳定、速度快  
**缺点：** URL 每次变化

### 4. **frp**（自建，需要服务器）

如果你有自己的服务器，可以使用 frp 自建隧道。

---

## 📝 实际使用示例

### 场景：测试 n8n 回调

```bash
# 1. 启动后端
cd /home/frankyxu/Code/video/first_book_v2/backend
npm start &

# 2. 启动 ngrok（新终端）
ngrok http 3002

# 3. 复制 URL（如：https://abc123.ngrok-free.app）

# 4. 更新 .env
echo "BACKEND_URL=https://abc123.ngrok-free.app" >> .env

# 5. 重启后端
pkill -f "node server.js"
npm start &

# 6. 测试
curl https://abc123.ngrok-free.app/api/health

# 7. 在 n8n 中配置回调 URL
# n8n 现在可以通过 https://abc123.ngrok-free.app/api/drama/callback/xxx 回调
```

### 场景：调试 API

```bash
# 启动 ngrok
ngrok http 3002

# 打开 Web 界面
# 浏览器访问: http://127.0.0.1:4040

# 现在可以看到所有通过 ngrok 的请求：
# - 请求 URL
# - 请求头
# - 请求体
# - 响应状态码
# - 响应内容
```

---

## 🎓 常见问题

### Q1: ngrok URL 每次启动都变化怎么办？

**A:** 
- 免费版确实会变化
- 解决方案：
  1. 使用付费版固定域名
  2. 每次启动后更新 `.env` 文件
  3. 使用脚本自动更新

### Q2: ngrok 连接断开怎么办？

**A:**
- 免费版有会话时长限制
- 解决方案：
  1. 使用 `screen` 或 `tmux` 保持会话
  2. 使用 systemd 服务自动重启
  3. 使用付费版

### Q3: 如何让 ngrok 在后台运行？

**A:**
```bash
# 使用 nohup
nohup ngrok http 3002 > /tmp/ngrok.log 2>&1 &

# 或使用 screen
screen -S ngrok
ngrok http 3002
# Ctrl+A, D 退出（保持运行）

# 重新连接
screen -r ngrok
```

### Q4: 如何查看 ngrok 日志？

**A:**
```bash
# 如果使用 nohup
tail -f /tmp/ngrok.log

# 或访问 Web 界面
# http://127.0.0.1:4040
```

### Q5: ngrok 安全吗？

**A:**
- ✅ HTTPS 加密传输
- ⚠️ 但服务会暴露到公网
- 💡 建议：
  - 仅用于开发测试
  - 不要暴露敏感数据
  - 使用 IP 白名单（付费功能）

---

## 📚 更多资源

- **官网**: https://ngrok.com
- **文档**: https://ngrok.com/docs
- **Dashboard**: https://dashboard.ngrok.com
- **GitHub**: https://github.com/inconshreveable/ngrok

---

## 🎯 总结

**ngrok 是什么？**
- 反向隧道工具，将本地服务暴露到公网

**为什么需要？**
- 让远程服务器（n8n）能够访问本地开发环境

**如何使用？**
1. 安装：`wget ... && tar -xzf ... && sudo mv ngrok /usr/local/bin/`
2. 启动：`ngrok http 3002`
3. 复制 URL，更新 `.env` 中的 `BACKEND_URL`
4. 重启后端服务

**注意事项：**
- ⚠️ 免费版 URL 会变化
- ⚠️ 仅用于开发测试
- ✅ 使用 HTTPS，相对安全

**下一步：**
- 安装并启动 ngrok
- 更新 `BACKEND_URL` 环境变量
- 测试 n8n 回调功能





