# UniVault Banking System - Agent Instructions

## Project Overview
Customer information management system based on BDO Unibank's forms. Full-stack application with Node.js backend, MySQL database, and vanilla JavaScript frontend.

## Commands

### Development
- `npm start` - Start the backend server (port 3000)
- `npm run dev` - Start with nodemon for auto-restart
- `npm install` - Install dependencies

### Database Setup
- `mysql -u root -p -e "SOURCE 3_database/db_univault_schema.sql"`
- `mysql -u root -p -e "SOURCE 3_database/db_univault_seed.sql"`

### Testing
- Currently no automated tests configured
- Manual testing via frontend forms and API endpoints

## Architecture

### Backend (2_backend/)
- **Framework**: Node.js + Express
- **Database**: MySQL with connection pooling
- **Main file**: `server.js`
- **Dependencies**: bcryptjs, dotenv, express, multer, mysql2

### Frontend (1_frontend/)
- **Technology**: Vanilla HTML/CSS/JavaScript
- **Structure**: 
  - `Registration-Customer/` - 15-step registration flow
  - `Dashboard-Customer/` - Customer portal
  - `Dashboard-Admin/` - Admin interface
- **Served by**: Express static middleware

### Database (3_database/)
- **Schema**: `db_univault_schema.sql` - Complex banking tables
- **Seed Data**: `db_univault_seed.sql` - Reference data
- **Key Tables**: CUSTOMER, ACCOUNT_DETAILS, CUSTOMER_ADDRESS, etc.

## Known Issues
1. Frontend login form not connected to backend API
2. Dashboard pages don't fetch real customer data  
3. No authentication/session management
4. Admin features not implemented in backend
5. Missing CORS and security middleware

## Development Priorities
1. Fix frontend-backend API integration
2. Implement JWT authentication
3. Connect dashboard to real data
4. Add admin functionality
5. Improve error handling and security

## Environment Configuration
- Database connection via `.env` file in `2_backend/`
- Default port: 3000
- Frontend served from backend static middleware
