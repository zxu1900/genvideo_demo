# 快速停止前端服务

## ❌ 为什么 `pkill -f "react-scripts start"` 不工作？

**原因：**
- 实际进程名是：`node .../react-scripts/scripts/start.js`
- 不包含字符串 `"react-scripts start"`
- 所以 `pkill -f "react-scripts start"` 无法匹配

---

## ✅ 正确的停止方法

### 方法 1: 通过端口查找并停止（推荐）

```bash
# 查找占用 3000 端口的进程
lsof -ti:3000

# 停止进程
kill $(lsof -ti:3000)

# 或者强制停止
kill -9 $(lsof -ti:3000)
```

### 方法 2: 使用正确的匹配模式

```bash
# 匹配 react-scripts/scripts/start
pkill -f "react-scripts/scripts/start"

# 或者匹配 start.js
pkill -f "start.js"
```

### 方法 3: 使用脚本（已创建）

```bash
cd /home/frankyxu/Code/video/first_book_v2/frontend
./stop_frontend.sh
```

### 方法 4: 手动查找并停止

```bash
# 查找进程
ps aux | grep react-scripts

# 找到 PID（例如 4843）
kill 4843

# 如果不行，强制停止
kill -9 4843
```

---

## 🚀 快速重启

### 使用脚本（推荐）

```bash
cd /home/frankyxu/Code/video/first_book_v2/frontend
./restart_frontend.sh
```

### 手动重启

```bash
# 1. 停止
kill $(lsof -ti:3000) 2>/dev/null

# 2. 等待
sleep 2

# 3. 启动
npm start
```

---

## 📝 一行命令

```bash
# 停止并重启
kill $(lsof -ti:3000) 2>/dev/null; sleep 2; cd /home/frankyxu/Code/video/first_book_v2/frontend && npm start &
```

---

## 🔍 验证

```bash
# 检查端口
lsof -ti:3000

# 检查进程
ps aux | grep react-scripts | grep -v grep
```

---

## 💡 提示

- 如果普通 `kill` 不行，使用 `kill -9` 强制停止
- 停止后等待 1-2 秒再启动，确保端口释放
- 使用脚本可以自动处理这些步骤




