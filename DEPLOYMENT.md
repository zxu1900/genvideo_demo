# WriteTalent 部署文档

## 生产环境部署指南

### 服务器信息
- **域名**: www.writetalent.chat
- **服务器**: OpenCloudOS 9
- **Web服务器**: Nginx 1.26.3

### 部署架构

```
外部访问 (80端口)
    ↓
  Nginx反向代理
    ↓
    ├─→ 前端 (localhost:3000) - React应用
    └─→ 后端 (localhost:3001) - API服务器
```

### 部署步骤

#### 1. 安装依赖

```bash
# 安装Nginx
yum install -y nginx-core nginx-filesystem

# 安装Node.js和npm（如果尚未安装）
# 已通过conda安装
```

#### 2. 构建前端应用

```bash
cd /var/www/first_book_v2/frontend
npm install
npm run build
```

#### 3. 部署前端

```bash
# 复制构建文件到生产目录
cp -r build/* /var/www/first_book/frontend/build/
```

#### 4. 配置Nginx

```bash
# 复制Nginx配置文件
cp nginx/writetalent.conf /etc/nginx/conf.d/
cp nginx/nginx.service /etc/systemd/system/

# 注释nginx.conf中的默认server块
# 编辑 /etc/nginx/nginx.conf，将默认server块注释掉

# 测试配置
nginx -t

# 重载systemd并启动nginx
systemctl daemon-reload
systemctl enable nginx
systemctl start nginx
```

#### 5. 启动服务

```bash
# 前端服务 (端口3000)
cd /var/www/first_book/frontend
serve -s build -l 3000 &

# 后端服务 (端口3001)
cd /var/www/first_book_v2/backend
node server.js &
```

### 防火墙配置

```bash
# 确保端口已开放
firewall-cmd --list-all
# 应包含: ports: 80/tcp 443/tcp 3000-3010/tcp
```

### 服务管理

```bash
# 查看Nginx状态
systemctl status nginx

# 重启Nginx
systemctl restart nginx

# 重载Nginx配置（不中断服务）
systemctl reload nginx

# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 验证部署

```bash
# 本地测试
curl http://localhost
curl http://localhost:3000

# 外部访问测试
curl http://www.writetalent.chat
```

### 目录结构

```
/var/www/
├── first_book/               # 生产环境
│   ├── frontend/
│   │   └── build/           # 前端构建文件
│   └── backend/
│       └── src/
│           └── server.js    # 后端服务
└── first_book_v2/           # 开发环境
    ├── frontend/            # React前端源码
    ├── backend/             # 后端源码
    └── nginx/               # Nginx配置文件
```

### 端口使用

- **80**: Nginx (HTTP)
- **443**: Nginx (HTTPS - 待配置SSL)
- **3000**: 前端应用服务
- **3001**: 后端API服务
- **3002**: 开发环境前端服务

### SSL/HTTPS配置（待实施）

TODO: 使用Let's Encrypt配置SSL证书

```bash
# 安装certbot
yum install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d writetalent.chat -d www.writetalent.chat
```

### 更新部署

```bash
# 1. 拉取最新代码
cd /var/www/first_book_v2
git pull

# 2. 重新构建前端
cd frontend
npm install
npm run build

# 3. 部署到生产环境
cp -r build/* /var/www/first_book/frontend/build/

# 4. 重启服务（如有必要）
# 前端服务会自动检测文件变化
# 后端服务需要手动重启
pkill -f "node.*server.js"
cd /var/www/first_book_v2/backend
node server.js &
```

### 故障排查

#### 网站无法访问
1. 检查Nginx状态: `systemctl status nginx`
2. 检查端口监听: `netstat -tlnp | grep 80`
3. 检查防火墙: `firewall-cmd --list-all`
4. 查看错误日志: `tail -f /var/log/nginx/error.log`

#### 前端显示错误
1. 检查前端服务: `ps aux | grep serve`
2. 检查端口3000: `netstat -tlnp | grep 3000`
3. 手动测试: `curl http://localhost:3000`

#### API不工作
1. 检查后端服务: `ps aux | grep node`
2. 检查端口3001: `netstat -tlnp | grep 3001`
3. 查看后端日志

---

**最后更新**: 2025-10-21
**维护者**: WriteTalent Team

