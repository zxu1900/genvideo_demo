#!/bin/bash

# WriteTalent Frontend Build Script
# 一键构建前端并显示 9 个 YouTube 视频

set -e

echo "🚀 WriteTalent Frontend Build"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$(dirname "$0")"

echo "📋 Step 1: Checking backend availability..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend is running${NC}"
else
  echo -e "${YELLOW}⚠️  Warning: Backend is not running at http://localhost:3001${NC}"
  echo "   Please start the backend first:"
  echo "   cd /var/www/first_book_v2/backend && npm start"
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""
echo "📦 Step 2: Installing dependencies..."
npm install

echo ""
echo "🔨 Step 3: Building frontend..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Build completed successfully!${NC}"
  echo ""
  echo "📊 Build output:"
  ls -lh build/ | head -10
  echo ""
  echo "🎉 Next steps:"
  echo ""
  echo "1. Test locally:"
  echo "   npx serve -s build -p 3000"
  echo "   Then visit: http://localhost:3000/portfolio"
  echo ""
  echo "2. Deploy to production:"
  echo "   - Update Nginx to serve from: $(pwd)/build"
  echo "   - Reload Nginx: sudo nginx -s reload"
  echo ""
  echo "✨ Expected: 9 YouTube videos instead of 2 mock stories"
else
  echo ""
  echo "❌ Build failed. Please check the errors above."
  exit 1
fi

