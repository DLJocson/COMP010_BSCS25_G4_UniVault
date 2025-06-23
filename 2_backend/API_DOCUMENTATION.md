# UniVault Banking System - Enhanced API Documentation

## Overview

This document describes the enhanced API endpoints for the UniVault Banking System, including comprehensive authentication, reference data management, and security features.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Reference Data APIs](#reference-data-apis)
3. [Security Features](#security-features)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Session Management](#session-management)
7. [Health Check Endpoints](#health-check-endpoints)

---

## Authentication System

### Enhanced Authentication Endpoints

#### POST `/api/enhanced-auth/login`

Enhanced login with comprehensive security features including device tracking, suspicious activity detection, and account lockout protection.

**Request Body:**
```json
{
  "identifier": "username or email",
  "password": "user_password",
  "userType": "customer|employee|admin",
  "rememberMe": false,
  "deviceName": "Optional device name"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "sessionId": "uuid",
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "refreshExpiresAt": "2024-12-31T23:59:59.000Z",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "userType": "customer",
    "status": "Active"
  },
  "security": {
    "warning": "Unusual login activity detected",
    "indicators": ["new_ip_address", "new_user_agent"],
    "riskScore": 20
  }
}
```

**Security Features:**
- Device fingerprinting
- IP address tracking
- Failed attempt lockout
- Suspicious activity detection
- Session limiting per user

#### POST `/api/enhanced-auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "new_jwt_token",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "sessionId": "session_uuid"
}
```

#### POST `/api/enhanced-auth/logout`

Logout and revoke session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "logoutAllDevices": false
}
```

**Response:**
```json
{
  "message": "Logout successful",
  "loggedOutAllDevices": false
}
```

#### GET `/api/enhanced-auth/profile`

Get current user profile with session information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "user_id": "customer_id",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "status": "Active"
  },
  "session": {
    "session_id": "uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_activity": "2024-01-01T12:00:00.000Z",
    "expires_at": "2024-01-01T13:00:00.000Z",
    "ip_address": "192.168.1.1",
    "device_fingerprint": "hash"
  },
  "devices": [
    {
      "device_fingerprint": "hash",
      "device_name": "Chrome Browser",
      "device_type": "desktop",
      "browser": "Chrome",
      "os": "Windows",
      "is_trusted": true,
      "last_seen": "2024-01-01T12:00:00.000Z"
    }
  ],
  "userType": "customer"
}
```

#### PUT `/api/enhanced-auth/change-password`

Change user password with enhanced security validation.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "current_password",
  "newPassword": "new_secure_password",
  "confirmPassword": "new_secure_password"
}
```

**Response:**
```json
{
  "message": "Password changed successfully",
  "passwordStrength": "strong",
  "allSessionsRevoked": true
}
```

#### POST `/api/enhanced-auth/request-password-reset`

Request password reset token.

**Request Body:**
```json
{
  "identifier": "email or username",
  "userType": "customer"
}
```

**Response:**
```json
{
  "message": "If the account exists, a password reset link has been sent",
  "code": "RESET_REQUESTED"
}
```

#### POST `/api/enhanced-auth/reset-password`

Reset password using token.

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "new_secure_password",
  "confirmPassword": "new_secure_password"
}
```

**Response:**
```json
{
  "message": "Password reset successfully",
  "passwordStrength": "strong",
  "allSessionsRevoked": true
}
```

#### GET `/api/enhanced-auth/sessions`

Get all active sessions for current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "sessions": [
    {
      "session_id": "uuid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_activity": "2024-01-01T12:00:00.000Z",
      "expires_at": "2024-01-01T13:00:00.000Z",
      "ip_address": "192.168.1.1",
      "device_name": "Chrome Browser",
      "device_type": "desktop",
      "browser": "Chrome",
      "is_trusted": true,
      "isCurrent": true
    }
  ],
  "total": 1
}
```

#### DELETE `/api/enhanced-auth/sessions/:sessionId`

Revoke specific session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Session revoked successfully",
  "sessionId": "uuid"
}
```

---

## Reference Data APIs

### Countries API

#### GET `/api/reference/countries`

Get list of all countries.

**Query Parameters:**
- `search` (optional): Search by country name or code
- `active_only` (optional, default: true): Only return active countries
- `include_calling_codes` (optional, default: false): Include calling codes

**Response:**
```json
{
  "countries": [
    {
      "country_code": "PH",
      "country_name": "Philippines",
      "country_name_local": "Pilipinas",
      "region": "Asia",
      "sub_region": "Southeast Asia",
      "capital": "Manila",
      "currency_code": "PHP",
      "currency_name": "Philippine Peso",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "filters": {
    "search": null,
    "active_only": true,
    "include_calling_codes": false
  }
}
```

#### GET `/api/reference/countries/:countryCode`

Get detailed information about a specific country.

**Response:**
```json
{
  "country_code": "PH",
  "country_name": "Philippines",
  "country_name_local": "Pilipinas",
  "region": "Asia",
  "sub_region": "Southeast Asia",
  "capital": "Manila",
  "currency_code": "PHP",
  "currency_name": "Philippine Peso",
  "total_states": 81,
  "timezones": ["Asia/Manila"],
  "is_active": true
}
```

### States/Provinces API

#### GET `/api/reference/states`

Get states/provinces, optionally filtered by country.

**Query Parameters:**
- `country_code` (optional): Filter by country code
- `search` (optional): Search by state name or code
- `active_only` (optional, default: true): Only return active states

**Response:**
```json
{
  "states": [
    {
      "state_code": "NCR",
      "state_name": "National Capital Region",
      "state_name_local": "Pambansang Punong Rehiyon",
      "country_code": "PH",
      "country_name": "Philippines",
      "state_type": "region",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "filters": {
    "country_code": "PH",
    "search": null,
    "active_only": true
  }
}
```

#### GET `/api/reference/states/:countryCode`

Get all states for a specific country.

**Response:**
```json
{
  "country_code": "PH",
  "states": [
    {
      "state_code": "NCR",
      "state_name": "National Capital Region",
      "state_name_local": "Pambansang Punong Rehiyon",
      "state_type": "region",
      "postal_code_format": "####",
      "is_active": true
    }
  ],
  "total": 1
}
```

### Cities API

#### GET `/api/reference/cities`

Get cities, optionally filtered by state/country.

**Query Parameters:**
- `state_code` (optional): Filter by state code
- `country_code` (optional): Filter by country code
- `search` (optional): Search by city name, code, or postal code
- `limit` (optional, default: 100): Maximum results to return
- `offset` (optional, default: 0): Pagination offset
- `active_only` (optional, default: true): Only return active cities
- `include_coordinates` (optional, default: false): Include latitude/longitude

**Response:**
```json
{
  "cities": [
    {
      "city_code": "MNL",
      "city_name": "Manila",
      "city_name_local": "Maynila",
      "state_code": "NCR",
      "state_name": "National Capital Region",
      "country_code": "PH",
      "country_name": "Philippines",
      "postal_code": "1000",
      "is_active": true
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 100,
    "offset": 0,
    "has_more": false
  },
  "filters": {
    "state_code": "NCR",
    "country_code": null,
    "search": null,
    "active_only": true,
    "include_coordinates": false
  }
}
```

### Other Reference Data APIs

#### GET `/api/reference/civil-status`

Get all civil status types.

**Response:**
```json
{
  "civil_status_types": [
    {
      "civil_status_code": "CS01",
      "civil_status_description": "Single",
      "is_active": true,
      "sort_order": 1
    }
  ],
  "total": 1
}
```

#### GET `/api/reference/address-types`

Get all address types.

#### GET `/api/reference/account-types`

Get all available account types.

**Query Parameters:**
- `customer_type` (optional): Filter by customer type (individual/business)
- `include_requirements` (optional, default: false): Include requirements and documentation needed

#### GET `/api/reference/id-types`

Get all valid identification types.

**Query Parameters:**
- `country_code` (optional): Filter by issuing country
- `is_primary_eligible` (optional): Filter by primary ID eligibility

#### GET `/api/reference/employment-positions`

Get all employment position types.

**Query Parameters:**
- `category` (optional): Filter by position category
- `search` (optional): Search by position name or description

#### GET `/api/reference/fund-sources`

Get all fund source types.

#### GET `/api/reference/contact-types`

Get all contact types.

### Bulk Reference Data API

#### GET `/api/reference/bulk`

Get multiple reference data types in a single request.

**Query Parameters:**
- `types` (required): Comma-separated list of data types to fetch
  - Valid types: countries, states, cities, civil-status, address-types, account-types, id-types, employment-positions, fund-sources, contact-types
- `country_code` (optional): Filter geographic data by country
- `state_code` (optional): Filter cities by state

**Example:**
```
GET /api/reference/bulk?types=countries,civil-status,address-types&country_code=PH
```

**Response:**
```json
{
  "data": {
    "countries": [...],
    "civil_status": [...],
    "address_types": [...]
  },
  "filters": {
    "country_code": "PH",
    "state_code": null
  },
  "requested_types": ["countries", "civil-status", "address-types"],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Security Features

### Rate Limiting

The API implements advanced rate limiting with the following default limits:

- **General API requests**: 100 requests per minute per user/IP
- **Authentication endpoints**: 5 attempts per hour per IP
- **Password reset requests**: 3 requests per hour per IP
- **Registration attempts**: 5 attempts per hour per IP

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T13:00:00.000Z
```

### Account Lockout Protection

- **Failed login attempts**: Account locked after 5 failed attempts
- **Lockout duration**: 15 minutes (configurable)
- **Automatic unlock**: Accounts automatically unlock after duration expires
- **Admin override**: Admins can manually unlock accounts

### Device Tracking

- **Device fingerprinting**: Tracks browser, OS, and device characteristics
- **Trusted devices**: Users can mark devices as trusted
- **New device alerts**: Notifications for logins from new devices
- **Device management**: Users can view and revoke device access

### Security Headers

All responses include comprehensive security headers:
- Content Security Policy (CSP)
- X-XSS-Protection
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy

---

## Error Handling

### Standardized Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/endpoint",
  "requestId": "unique_request_id"
}
```

### Common Error Codes

#### Authentication Errors (401)
- `INVALID_CREDENTIALS`: Invalid username/password
- `TOKEN_EXPIRED`: Access token has expired
- `SESSION_EXPIRED`: Session has expired
- `DEVICE_MISMATCH`: Device fingerprint mismatch

#### Authorization Errors (403)
- `ACCESS_DENIED`: Insufficient permissions
- `ACCOUNT_LOCKED`: Account is locked
- `ACCOUNT_INACTIVE`: Account is not active

#### Validation Errors (400)
- `VALIDATION_ERROR`: Input validation failed
- `WEAK_PASSWORD`: Password doesn't meet requirements
- `INVALID_TOKEN`: Invalid or malformed token

#### Rate Limiting Errors (429)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `ACCOUNT_LOCKED_FAILED_ATTEMPTS`: Account locked due to failed attempts

#### Not Found Errors (404)
- `NOT_FOUND`: Resource not found
- `USER_NOT_FOUND`: User account not found
- `SESSION_NOT_FOUND`: Session not found

#### Conflict Errors (409)
- `CONFLICT`: Resource conflict
- `USERNAME_EXISTS`: Username already exists
- `EMAIL_EXISTS`: Email already exists

### Error Details

For validation errors, additional details are provided:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters",
      "code": "MIN_LENGTH"
    }
  ]
}
```

---

## Session Management

### Session Configuration

- **Access token lifetime**: 15 minutes
- **Refresh token lifetime**: 7 days
- **Maximum concurrent sessions**: 3 per user (configurable)
- **Session idle timeout**: 30 minutes
- **Session absolute timeout**: 24 hours

### Session Security Features

- **Automatic cleanup**: Expired sessions are automatically removed
- **Concurrent session limiting**: Old sessions are revoked when limit is exceeded
- **Device fingerprinting**: Sessions tied to specific device characteristics
- **IP address validation**: Sessions validated against originating IP
- **Suspicious activity detection**: Unusual session patterns are flagged

### Session Data Stored

- Session ID and tokens
- User identification and type
- Device information and fingerprint
- IP address and location
- Creation and expiry timestamps
- Last activity timestamp

---

## Health Check Endpoints

### GET `/api/health`

Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected",
  "environment": "development"
}
```

### GET `/api/status`

Detailed service status information.

**Response:**
```json
{
  "service": "UniVault API",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600
}
```

---

## Cache Management

### Reference Data Caching

Reference data is cached for improved performance:

- **Cache duration**: 1 hour for most reference data
- **Cache keys**: Based on endpoint and query parameters
- **Cache invalidation**: Automatic expiry and manual clearing

### Cache Management Endpoints

#### POST `/api/reference/cache/clear`

Clear reference data cache (admin only).

**Request Body:**
```json
{
  "pattern": "countries" // Optional: clear specific pattern
}
```

#### GET `/api/reference/cache/info`

Get cache information and statistics.

**Response:**
```json
{
  "total_entries": 25,
  "entries": [
    {
      "key": "countries_{}",
      "timestamp": 1234567890,
      "age_ms": 150000
    }
  ],
  "memory_usage": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## API Usage Examples

### Frontend Integration

```javascript
// Enhanced authentication example
const authService = {
  async login(credentials) {
    const response = await fetch('/api/enhanced-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const data = await response.json();
    
    // Store tokens securely
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch('/api/enhanced-auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      // Redirect to login
      this.logout();
      throw new Error('Session expired');
    }
    
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  },

  async apiCall(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      // Try to refresh token
      try {
        await this.refreshToken();
        // Retry original request
        return this.apiCall(url, options);
      } catch (error) {
        this.logout();
        throw error;
      }
    }
    
    return response;
  }
};

// Reference data usage
const referenceService = {
  async getCountries() {
    const response = await fetch('/api/reference/countries');
    return response.json();
  },

  async getStates(countryCode) {
    const response = await fetch(`/api/reference/states/${countryCode}`);
    return response.json();
  },

  async getBulkData(types, filters = {}) {
    const params = new URLSearchParams({ types, ...filters });
    const response = await fetch(`/api/reference/bulk?${params}`);
    return response.json();
  }
};
```

### Error Handling Best Practices

```javascript
// Comprehensive error handling
async function handleApiCall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific error codes
    switch (error.code) {
      case 'TOKEN_EXPIRED':
        // Refresh token automatically handled by authService
        break;
      case 'ACCOUNT_LOCKED':
        showNotification('Account locked. Please contact support.', 'error');
        break;
      case 'RATE_LIMIT_EXCEEDED':
        showNotification('Too many requests. Please wait and try again.', 'warning');
        break;
      case 'VALIDATION_ERROR':
        displayValidationErrors(error.details);
        break;
      default:
        showNotification('An error occurred. Please try again.', 'error');
    }
    
    throw error;
  }
}
```

---

## Configuration

### Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=univault_schema

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_MAX_CONCURRENT=3
SESSION_IDLE_TIMEOUT_MINUTES=30
SESSION_ABSOLUTE_TIMEOUT_HOURS=24

# Security Settings
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
PASSWORD_MIN_LENGTH=8
REQUIRE_2FA_FOR_ADMIN=true

# Application Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
```

### System Configurations (Database)

The system uses database-stored configurations that can be updated at runtime:

```sql
INSERT INTO system_configurations (config_key, config_value, description, category) VALUES
('session.max_concurrent_sessions', '3', 'Maximum concurrent sessions per user', 'session'),
('session.idle_timeout_minutes', '30', 'Session idle timeout in minutes', 'session'),
('security.max_login_attempts', '5', 'Maximum failed login attempts before lockout', 'security'),
('rate_limit.api_requests_per_minute', '100', 'Max API requests per minute per user', 'rate_limit');
```

---

This documentation covers the enhanced API system for UniVault. The system provides enterprise-grade security, comprehensive error handling, and scalable architecture suitable for a banking application.
