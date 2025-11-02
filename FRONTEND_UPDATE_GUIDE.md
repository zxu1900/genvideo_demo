# 前端更新指南

## 🔄 更新内容

前端代码已更新，从**硬编码的 mock 数据**改为**从后端 API 获取真实数据**。

### 修改的文件

1. ✅ `src/pages/portfolio/ShowYourLights.tsx` - 作品列表页
2. ✅ `src/pages/portfolio/PortfolioDetail.tsx` - 作品详情页
3. ✅ `src/pages/portfolio/ProfilePage.tsx` - 用户资料页
4. ✅ `frontend/.env.example` - 环境变量配置模板

### 主要变化

#### 之前（Mock 数据）
```typescript
import { mockPortfolios } from '../../utils/mockData';
const [portfolios] = useState(mockPortfolios);  // ❌ 硬编码2个作品
```

#### 现在（API 数据）
```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

useEffect(() => {
  fetch(`${API_URL}/api/portfolios`)  // ✅ 从后端获取9个YouTube视频
    .then(res => res.json())
    .then(data => setPortfolios(data));
}, []);
```

---

## 🚀 部署步骤

### Step 1: 配置环境变量（可选）

```bash
cd /var/www/first_book_v2/frontend

# 如果需要自定义API URL，创建 .env 文件
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:3001
EOF
```

**生产环境：**
```bash
# 修改为生产环境的后端地址
REACT_APP_API_URL=https://api.writetalent.chat
```

### Step 2: 重新构建前端

```bash
cd /var/www/first_book_v2/frontend

# 安装依赖（如果需要）
npm install

# 构建生产版本
npm run build
```

**预计时间：** 2-3 分钟

### Step 3: 验证构建

```bash
# 检查 build 目录
ls -lh build/

# 应该看到更新的文件
# -rw-r--r-- 1 root root  XXX Nov  2 XX:XX index.html
# drwxr-xr-x 3 root root  XXX Nov  2 XX:XX static/
```

---

## 🧪 测试步骤

### 1. 确保后端正在运行

```bash
# 检查后端状态
curl http://localhost:3001/api/health

# 预期输出：
# {"status":"OK","message":"WriteTalent API is running!","database":"connected"}
```

### 2. 启动前端开发服务器（测试）

```bash
cd /var/www/first_book_v2/frontend
npm start
```

访问 `http://localhost:3000/portfolio` 应该看到 **9 个 YouTube 视频**而不是 2 个 mock 作品。

### 3. 测试生产构建

```bash
# 使用 serve 测试构建版本
npx serve -s build -p 3000
```

---

## 📊 数据对比

### 之前（Mock 数据）
| 页面 | 数据源 | 作品数量 |
|------|--------|----------|
| Show Your Lights | `mockPortfolios` | 2 个硬编码 |
| Portfolio Detail | `mockPortfolios` | 2 个硬编码 |
| Profile Page | `mockUsers` | 2 个用户 |

### 现在（API 数据）
| 页面 | 数据源 | 作品数量 |
|------|--------|----------|
| Show Your Lights | `GET /api/portfolios` | **9 个 YouTube 视频** |
| Portfolio Detail | `GET /api/portfolios/:id` | 动态加载 |
| Profile Page | `GET /api/users/:id` | **8 个真实用户** |

---

## 🎬 验证 YouTube 视频显示

访问 `http://localhost:3000/portfolio`，你应该看到：

1. ✅ **WriteTalent Introduction**
2. ✅ **Adam's Jet Card Dream**
3. ✅ **Kitty: Korean Fashion Buyer**
4. ✅ **Caterina: Me and AI**
5. ✅ **Jason: Healthy AI Agent**
6. ✅ **Tony: Drone Tour of Fuzhou**
7. ✅ **Sissi: Nature And AI**
8. ✅ **Adam: China Air Force Cards**
9. ✅ **Yania: Eldest Daughter**

---

## 🔧 Nginx 配置（生产环境）

如果使用 Nginx 部署，确保配置正确：

```nginx
server {
    listen 80;
    server_name writetalent.chat;
    
    # 前端静态文件
    location / {
        root /var/www/first_book_v2/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

重载 Nginx：
```bash
sudo nginx -t
sudo nginx -s reload
```

---

## 🚨 常见问题

### 问题 1: API 请求失败（CORS 错误）

**症状：** 浏览器控制台显示 CORS 错误

**解决：** 确保后端已启用 CORS
```javascript
// backend/server.js 已包含
app.use(cors());
```

### 问题 2: 页面显示空白

**症状：** 页面加载但没有内容

**检查：**
1. 后端是否运行：`curl http://localhost:3001/api/portfolios`
2. 浏览器控制台是否有错误
3. 检查环境变量 `REACT_APP_API_URL` 是否正确

### 问题 3: 仍然显示旧的 mock 数据

**原因：** 浏览器缓存

**解决：**
```bash
# 清空构建目录并重新构建
rm -rf build/
npm run build

# 或者强制刷新浏览器（Ctrl + Shift + R）
```

### 问题 4: 构建失败

**检查 Node 版本：**
```bash
node --version  # 需要 >= 14.x
npm --version   # 需要 >= 6.x
```

**重新安装依赖：**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📈 性能优化

### 1. 启用 Gzip 压缩

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 2. 设置缓存头

```nginx
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用 CDN（可选）

将 `build/static/` 文件上传到 CDN，加快全球访问速度。

---

## 📝 总结

### 更新前
- ❌ 显示 2 个硬编码的 mock 作品
- ❌ 数据无法更新
- ❌ 无法显示真实的 YouTube 视频

### 更新后
- ✅ 显示 9 个真实的 YouTube 视频
- ✅ 数据来自 PostgreSQL 数据库
- ✅ 支持动态更新
- ✅ 准备好接入千级视频数据

---

## 🎯 下一步

1. **立即执行：**
   ```bash
   cd /var/www/first_book_v2/frontend
   npm run build
   ```

2. **验证：** 访问前端页面，确认显示 9 个视频

3. **生产部署：** 
   - 更新 Nginx 配置
   - 设置正确的 `REACT_APP_API_URL`
   - 重新构建前端

**预计完成时间：** 5 分钟

🎉 完成后，您的前端将完全连接到 PostgreSQL 数据库！

