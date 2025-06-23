# UniVault Complete Setup Guide

## 🚀 Quick Start (Recommended)

### Prerequisites
- MySQL Server running on port 3306
- Node.js installed
- Git (if cloning from repository)

### Option 1: Automated Setup
```bash
cd 2_backend
npm install
npm run setup
npm run dev
```

### Option 2: Manual Setup
```bash
cd 2_backend
npm install
npm run validate  # Check system requirements
npm run migrate   # Set up database
npm run dev       # Start development server
```

## 🔧 Detailed Setup Instructions

### 1. Database Setup

#### Start MySQL Server
- **Windows**: Start MySQL through Services or XAMPP/WAMP
- **macOS**: `brew services start mysql` or use MySQL Workbench
- **Linux**: `sudo systemctl start mysql`

#### Create Database User (Optional)
```sql
CREATE USER 'univault_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON univault_schema.* TO 'univault_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Environment Configuration

Create `2_backend/.env` file:
```env
# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=univault_schema

# Security
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
NODE_ENV=development

# Server
PORT=3000
FRONTEND_URL=http://localhost:3000
```

### 3. Backend Setup

```bash
cd 2_backend

# Install dependencies
npm install

# Validate system setup
npm run validate

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### 4. Verify Installation

#### Test System Health
```bash
# In another terminal
npm run test:api
```

#### Access the Application
- **Customer Portal**: http://localhost:3000/Registration-Customer/landing.html
- **Admin Dashboard**: http://localhost:3000/Dashboard-Admin/dashboard.html
- **API Health**: http://localhost:3000/api/health

## 🔑 Default Admin Access

**Username**: `admin`
**Password**: `admin123`

⚠️ **Important**: Change the default admin password immediately after first login!

## 📁 Project Structure

```
UniVault/
├── 1_frontend/                 # Frontend application
│   ├── Registration-Customer/  # Customer registration flow
│   ├── Dashboard-Customer/     # Customer dashboard
│   ├── Dashboard-Admin/        # Admin dashboard
│   └── js/                     # Shared JavaScript utilities
├── 2_backend/                  # Backend API server
│   ├── routes/                 # API route handlers
│   ├── middleware/             # Custom middleware
│   ├── scripts/                # Setup and utility scripts
│   └── server.js               # Main server file
├── 3_database/                 # Database schema and seeds
│   ├── db_univault_schema.sql  # Main database schema
│   ├── db_univault_seed.sql    # Reference data
│   └── migrations/             # Database migrations
└── docker-compose.yml          # Production deployment
```

## 🛠️ Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run validate` - Validate system setup
- `npm run setup` - Complete automated setup
- `npm run test` - Run registration tests
- `npm run test:api` - Test API endpoints

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🚨 Troubleshooting

### Database Connection Issues
1. Ensure MySQL is running: `sudo systemctl status mysql`
2. Check credentials in `.env` file
3. Verify user permissions: `SHOW GRANTS FOR 'your_user'@'localhost';`

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <process_id>

# Or use different port
export PORT=3001
npm run dev
```

### Migration Failures
```bash
# Reset database (WARNING: This deletes all data)
mysql -u root -p -e "DROP DATABASE IF EXISTS univault_schema;"

# Re-run migrations
npm run migrate
```

### Frontend Not Loading
1. Check server is running: http://localhost:3000/api/health
2. Clear browser cache
3. Check browser console for errors

## 🔧 Development Commands

### Useful MySQL Commands
```sql
-- Check database status
SHOW DATABASES;
USE univault_schema;
SHOW TABLES;

-- View customer registrations
SELECT * FROM customer_registration_progress;

-- View customers
SELECT * FROM customer LIMIT 10;

-- Reset admin password
UPDATE admin SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewNF2/c.XqlAOGsq' WHERE admin_id = 'ADMIN001';
```

### API Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Start registration
curl -X POST http://localhost:3000/api/customers/register/start \
  -H "Content-Type: application/json" \
  -d '{}'

# Admin login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"admin123","userType":"admin"}'
```

## 📊 System Features

### ✅ Implemented Features
- **Database Schema**: Complete banking schema with proper relationships
- **Customer Registration**: 15-step registration process with session management
- **Authentication**: JWT-based auth with password hashing
- **Admin Dashboard**: Customer management, registration approval
- **API Security**: Rate limiting, input validation, CORS protection
- **Error Handling**: Comprehensive error logging and user feedback
- **Auto-Migration**: Database setup on server start

### 🚀 Production Deployment

#### Environment Setup
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_secure_password
DB_NAME=univault_schema
JWT_SECRET=your_super_secure_production_jwt_secret
FRONTEND_URL=https://yourdomain.com
```

#### Docker Production
```bash
# Build production image
docker-compose -f docker-compose.yml up -d

# Scale for high availability
docker-compose up -d --scale app=3
```

## 🔒 Security Considerations

1. **Change default passwords** immediately
2. **Use environment variables** for all secrets
3. **Enable HTTPS** in production
4. **Regular database backups**
5. **Monitor logs** for suspicious activity
6. **Keep dependencies updated**

## 📞 Support

For issues and questions:
- Check this guide first
- Review error logs in `2_backend/logs/`
- Run `npm run validate` to check system health
- Check API status: http://localhost:3000/api/health

---

**UniVault Banking Management System**  
*Secure • Scalable • Professional*
