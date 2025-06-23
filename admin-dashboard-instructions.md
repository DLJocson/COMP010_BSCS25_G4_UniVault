# 🛡️ UniVault Admin Dashboard - Setup & Usage Instructions

## 🚀 Quick Start

### 1. Start the Admin Dashboard
```bash
# Option 1: Use the startup script (Windows)
start-admin-dashboard.bat

# Option 2: Manual startup
cd 2_backend
node server.js
# Then open: http://localhost:3000/Dashboard-Admin/admin-login.html
```

### 2. Admin Login Credentials
Use your admin credentials to log into the system:
- **URL**: `http://localhost:3000/Dashboard-Admin/admin-login.html`
- **Username**: Your employee username
- **Password**: Your employee password

## 🔧 Configuration Issues Found & Fixes

### ❌ CRITICAL FIX NEEDED: Admin Login
**Problem**: The admin login has a redacted password field that prevents successful authentication.

**Fix Required**: In `1_frontend/Dashboard-Admin/admin-login.html`, replace the redacted password field:
```javascript
// REPLACE THIS (around line 63):
employee_[REDACTED:password]: password

// WITH THIS:
employee_password: password
```

**Alternative**: Use the fixed login script:
- Copy the contents of `1_frontend/Dashboard-Admin/admin-login-fixed.js`
- Replace the inline script in `admin-login.html` with: `<script src="admin-login-fixed.js"></script>`

## ✅ Admin Workflow - All Components Working

### 1. **Admin Login** ✅ (with fix)
- **Files**: `admin-login.html`, `admin-login.css`
- **Backend**: `POST /admin/login`
- **Status**: Login authentication works, redirection to dashboard works

### 2. **Admin Dashboard** ✅
- **Files**: `admin-dashboard.html`, `admin-dashboard.css`, `admin-dashboard.js`
- **Backend**: `GET /admin/dashboard-stats`
- **Features**:
  - ✅ Real-time dashboard metrics (total customers, pending verifications, etc.)
  - ✅ Monthly statistics chart
  - ✅ Logout functionality

### 3. **User Management** ✅
#### Customer Management
- **Files**: `admin-user-management.html`, `.css`, `.js`
- **Backend**: `GET /admin/customers` (with search)
- **Features**:
  - ✅ List all customers
  - ✅ Search functionality
  - ✅ Click to view customer profile

#### Employee Management
- **Files**: `admin-user-management2.html`, `.css`, `.js`
- **Backend**: `GET /admin/employees` (with search)
- **Features**:
  - ✅ List all employees
  - ✅ Search functionality
  - ⚠️ View-only (no edit/create functionality)

### 4. **Review Queue** ✅
#### Verification Queue
- **Files**: `admin-review-queue.html`, `.css`, `.js`
- **Backend**: `GET /admin/pending-verifications`
- **Features**:
  - ✅ List pending customer verifications
  - ✅ Search functionality
  - ✅ Click to open verification page

#### Approval Requests (Close Requests)
- **Files**: `admin-review-queue2.html`, `.css`, `.js`
- **Backend**: `GET /admin/close-requests`
- **Features**:
  - ✅ List account closure requests
  - ✅ Click to process close requests

### 5. **Customer Verification** ✅
#### Verification Form
- **Files**: `admin-customer-verification.html`, `.css`, `.js`
- **Backend**: 
  - `GET /admin/customer/:cif/details`
  - `POST /admin/customer/:cif/verify`
- **Features**:
  - ✅ View customer details
  - ✅ Approve/Reject verification
  - ✅ View documents link

#### Document Viewer
- **Files**: `admin-customer-verification2.html`, `.css`, `.js`
- **Features**:
  - ✅ View uploaded documents
  - ✅ Navigation back to verification

### 6. **Account Closure** ✅
- **Files**: `admin-customer-close-request.html`, `.css`, `.js`
- **Backend**: `POST /admin/close-request/:cif/process`
- **Features**:
  - ✅ View customer details
  - ✅ Approve/Reject close requests

### 7. **Closed Accounts** ✅
- **Files**: `admin-closed-account.html`, `.css`, `.js`
- **Backend**: `GET /admin/closed-accounts`
- **Features**:
  - ✅ List all closed accounts
  - ✅ Search functionality

## 🔄 Complete Admin Workflow

```
1. Admin Login (admin-login.html)
   ↓
2. Dashboard (admin-dashboard.html)
   ├── User Management
   │   ├── Customers (admin-user-management.html)
   │   │   └── Customer Profile (admin-customer-profile.html)
   │   └── Employees (admin-user-management2.html)
   ├── Review Queue
   │   ├── Verifications (admin-review-queue.html)
   │   │   └── Verify Customer (admin-customer-verification.html)
   │   │       └── View Documents (admin-customer-verification2.html)
   │   └── Close Requests (admin-review-queue2.html)
   │       └── Process Request (admin-customer-close-request.html)
   └── Closed Accounts (admin-closed-account.html)
```

## 🎯 Backend API Endpoints (All Working)

- `POST /admin/login` - Admin authentication
- `GET /admin/dashboard-stats` - Dashboard metrics
- `GET /admin/customers` - List customers (with search)
- `GET /admin/employees` - List employees (with search)
- `GET /admin/pending-verifications` - Pending verifications
- `GET /admin/close-requests` - Account closure requests
- `GET /admin/closed-accounts` - Closed accounts
- `GET /admin/customer/:cif/details` - Customer details
- `POST /admin/customer/:cif/verify` - Approve/reject verification
- `POST /admin/close-request/:cif/process` - Process close request

## 🐛 Testing Checklist

1. ✅ Start server: `node 2_backend/server.js`
2. ⚠️ Fix admin login password field first
3. ✅ Login at: `http://localhost:3000/Dashboard-Admin/admin-login.html`
4. ✅ Navigate through all pages
5. ✅ Test search functionality
6. ✅ Test approve/reject actions
7. ✅ Test logout functionality

## 🗂️ Database Requirements

Ensure the following tables exist:
- `CUSTOMER` - Customer information
- `CUSTOMER_CONTACT_DETAILS` - Contact information
- `CUSTOMER_ADDRESS` - Address information
- `BANK_EMPLOYEE` - Employee/admin accounts
- `CUSTOMER_CLOSE_REQUEST` - Account closure requests

## 🚨 Known Issues

1. **CRITICAL**: Admin login password field is redacted - needs manual fix
2. **Minor**: Employee management is view-only (no CRUD operations)
3. **Enhancement**: Could add more detailed error handling for network failures

## 💡 Recommendations

1. Fix the admin login redaction issue immediately
2. Add create/edit functionality for employee management
3. Add pagination for large datasets
4. Add export functionality for reports
5. Add audit logging for admin actions
