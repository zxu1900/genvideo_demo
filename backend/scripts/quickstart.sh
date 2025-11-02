#!/bin/bash

# WriteTalent Quick Start Script
# 一键安装 PostgreSQL 并初始化数据库

set -e  # Exit on error

echo "🚀 WriteTalent Database Quick Start"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${YELLOW}⚠️  This script requires root privileges. Please run with sudo.${NC}"
  exit 1
fi

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

echo "📋 Step 1: Checking system requirements..."
echo ""

# Check if Docker is available
if command_exists docker; then
  echo -e "${GREEN}✅ Docker is installed${NC}"
  USE_DOCKER=true
else
  echo -e "${YELLOW}⚠️  Docker not found. Will install PostgreSQL directly.${NC}"
  USE_DOCKER=false
fi

echo ""
echo "📦 Step 2: Installing PostgreSQL..."
echo ""

if [ "$USE_DOCKER" = true ]; then
  # Use Docker
  echo "Using Docker for PostgreSQL..."
  
  # Check if container already exists
  if docker ps -a | grep -q writetalent-postgres; then
    echo "Removing existing PostgreSQL container..."
    docker rm -f writetalent-postgres
  fi
  
  # Start PostgreSQL container
  docker run --name writetalent-postgres \
    -e POSTGRES_PASSWORD=writetalent2024 \
    -e POSTGRES_DB=writetalent \
    -e POSTGRES_USER=writetalent_user \
    -p 5432:5432 \
    -d postgres:15
  
  echo -e "${GREEN}✅ PostgreSQL container started${NC}"
  
  # Wait for PostgreSQL to be ready
  echo "Waiting for PostgreSQL to be ready..."
  sleep 5
  
else
  # Install PostgreSQL directly
  echo "Installing PostgreSQL..."
  
  # Detect OS
  if [ -f /etc/redhat-release ]; then
    # CentOS/RHEL
    echo "Detected CentOS/RHEL"
    yum install -y postgresql-server postgresql-contrib
    postgresql-setup initdb
    systemctl start postgresql
    systemctl enable postgresql
  elif [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    echo "Detected Debian/Ubuntu"
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
  else
    echo -e "${RED}❌ Unsupported OS. Please install PostgreSQL manually.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ PostgreSQL installed${NC}"
  
  # Create database and user
  echo "Creating database and user..."
  sudo -u postgres psql << EOF
CREATE DATABASE writetalent;
CREATE USER writetalent_user WITH PASSWORD 'writetalent2024';
GRANT ALL PRIVILEGES ON DATABASE writetalent TO writetalent_user;
\q
EOF
  
fi

echo ""
echo "⚙️  Step 3: Configuring environment..."
echo ""

# Create .env file
cd /var/www/first_book_v2/backend
cat > .env << 'EOF'
# Server
PORT=3001
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=writetalent
DB_USER=writetalent_user
DB_PASSWORD=writetalent2024

# Email (update these)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOF

chmod 600 .env
echo -e "${GREEN}✅ Environment configured${NC}"

echo ""
echo "🎬 Step 4: Fetching YouTube videos and initializing database..."
echo ""

# Run initialization script
node scripts/initDatabase.js

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Database initialized successfully!${NC}"
else
  echo ""
  echo -e "${RED}❌ Database initialization failed. Please check the error messages above.${NC}"
  exit 1
fi

echo ""
echo "🔄 Step 5: Switching to new backend..."
echo ""

# Backup old server.js
if [ -f server.js ]; then
  cp server.js server_old_mock.js
  echo "Backed up old server.js to server_old_mock.js"
fi

# Use new server
cp server_new.js server.js
echo -e "${GREEN}✅ Switched to PostgreSQL backend${NC}"

echo ""
echo "🎉 ============================================"
echo "    Installation Complete!"
echo "   ============================================"
echo ""
echo "✨ Next steps:"
echo ""
echo "1. Test the API:"
echo "   curl http://localhost:3001/api/health"
echo ""
echo "2. View all portfolios:"
echo "   curl http://localhost:3001/api/portfolios"
echo ""
echo "3. Start the server:"
echo "   cd /var/www/first_book_v2/backend"
echo "   npm start"
echo ""
echo "   Or with PM2:"
echo "   pm2 restart writetalent-backend"
echo ""
echo "📊 Database Summary:"
echo "   - 9 YouTube videos imported"
echo "   - 8 users created"
echo "   - Database: writetalent"
echo "   - User: writetalent_user"
echo "   - Password: writetalent2024"
echo ""
echo -e "${YELLOW}⚠️  Remember to update EMAIL_USER and EMAIL_PASS in .env${NC}"
echo ""
echo "📖 For more details, see:"
echo "   - IMPLEMENTATION_SUMMARY.md"
echo "   - DATABASE_SETUP.md"
echo ""

