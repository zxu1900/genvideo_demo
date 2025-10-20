# 端口占用问题修复记录

## 问题描述
- `localhost:3000` 一直显示旧页面内容
- 端口3000被旧项目 `/var/www/first_book` 的serve进程占用
- 导致无法正常访问当前项目的最新内容

## 解决方案
1. **问题根因**: 端口3000被旧项目的serve进程占用
2. **解决方法**: 使用端口3002启动React开发服务器
3. **命令**: `PORT=3002 npm start`

## 当前状态
- ✅ `localhost:3002` - 当前项目的React开发服务器 (推荐使用)
- ❌ `localhost:3000` - 被旧项目占用，显示旧内容
- ✅ `localhost:3001` - 后端API服务

## 访问地址
- **前端开发**: http://localhost:3002
- **后端API**: http://localhost:3001
- **线上版本**: http://writetalent.chat

## 修复时间
2025-10-20 19:30

## 备注
如果将来需要清理端口3000，可以：
1. 找到占用进程: `lsof -i :3000`
2. 终止进程: `kill <PID>`
3. 或使用: `fuser -k 3000/tcp`
