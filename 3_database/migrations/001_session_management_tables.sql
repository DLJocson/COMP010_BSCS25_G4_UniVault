-- ==================================================================
-- UniVault Banking System - Session Management Tables
-- Version: 1.0.0
-- Description: Comprehensive session management and security tables
-- ==================================================================

-- User authentication sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    user_type ENUM('customer', 'employee', 'admin') NOT NULL,
    access_token VARCHAR(512) NOT NULL,
    refresh_token VARCHAR(512) UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP,
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    device_fingerprint VARCHAR(255),
    location VARCHAR(255),
    
    INDEX idx_session_id (session_id),
    INDEX idx_user_sessions (user_id, user_type, status),
    INDEX idx_refresh_token (refresh_token),
    INDEX idx_session_expires (expires_at, status),
    INDEX idx_last_activity (last_activity)
);

-- Login attempt tracking for security monitoring
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(255) NOT NULL, -- email or username
    user_type ENUM('customer', 'employee', 'admin') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255),
    session_id VARCHAR(255),
    device_fingerprint VARCHAR(255),
    
    INDEX idx_login_attempts_identifier (identifier, attempt_time),
    INDEX idx_login_attempts_ip (ip_address, attempt_time),
    INDEX idx_login_attempts_time (attempt_time),
    INDEX idx_login_security (ip_address, identifier, success, attempt_time)
);

-- Password reset tokens for secure password recovery
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    user_type ENUM('customer', 'employee', 'admin') NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    token_hash VARCHAR(255) NOT NULL, -- Hashed version for security
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_used BOOLEAN DEFAULT FALSE,
    
    INDEX idx_password_reset_token (token),
    INDEX idx_password_reset_user (user_id, user_type),
    INDEX idx_password_reset_expires (expires_at, is_used)
);

-- Security events logging for audit trail
CREATE TABLE IF NOT EXISTS security_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_type ENUM(
        'login_success', 'login_failure', 'logout', 'password_change',
        'password_reset_request', 'password_reset_complete', 
        'account_locked', 'suspicious_activity', 'token_refresh',
        'unauthorized_access', 'session_expired', 'multi_session_detected'
    ) NOT NULL,
    user_id VARCHAR(50),
    user_type ENUM('customer', 'employee', 'admin'),
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON, -- Additional event-specific details
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_security_events_type (event_type, created_at),
    INDEX idx_security_events_user (user_id, user_type, created_at),
    INDEX idx_security_events_session (session_id, created_at),
    INDEX idx_security_events_severity (severity, created_at),
    INDEX idx_security_events_ip (ip_address, created_at)
);

-- Account lockout tracking for brute force protection
CREATE TABLE IF NOT EXISTS account_lockouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    user_type ENUM('customer', 'employee', 'admin') NOT NULL,
    lockout_reason ENUM('failed_attempts', 'suspicious_activity', 'admin_action') NOT NULL,
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlock_at TIMESTAMP,
    attempt_count INT DEFAULT 0,
    ip_address VARCHAR(45),
    is_active BOOLEAN DEFAULT TRUE,
    unlocked_by VARCHAR(50), -- Admin who unlocked the account
    unlock_reason TEXT,
    
    INDEX idx_account_lockouts_user (user_id, user_type, is_active),
    INDEX idx_account_lockouts_time (locked_at, unlock_at, is_active)
);

-- API rate limiting tracking
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(255) NOT NULL, -- IP address or user ID
    identifier_type ENUM('ip', 'user') NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INT DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_request TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_blocked BOOLEAN DEFAULT FALSE,
    block_expires_at TIMESTAMP,
    
    UNIQUE KEY unique_rate_limit (identifier, identifier_type, endpoint, window_start),
    INDEX idx_rate_limit_identifier (identifier, identifier_type, endpoint),
    INDEX idx_rate_limit_window (window_start, endpoint),
    INDEX idx_rate_limit_blocked (is_blocked, block_expires_at)
);

-- Enhanced registration sessions (improvement of existing table)
CREATE TABLE IF NOT EXISTS registration_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    registration_id VARCHAR(255) UNIQUE NOT NULL, -- Maps to existing registration system
    current_step INT DEFAULT 1,
    total_steps INT DEFAULT 15,
    step_data JSON, -- Stores all form data
    step_progress JSON, -- Tracks completed steps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    status ENUM('active', 'completed', 'expired', 'cancelled') DEFAULT 'active',
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    completed_at TIMESTAMP NULL,
    cif_number INT NULL, -- Links to created customer
    
    INDEX idx_registration_session_id (session_id),
    INDEX idx_registration_id (registration_id),
    INDEX idx_registration_status (status, expires_at),
    INDEX idx_registration_ip (ip_address, created_at),
    INDEX idx_registration_expires (expires_at, status)
);

-- Device tracking for enhanced security
CREATE TABLE IF NOT EXISTS user_devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    user_type ENUM('customer', 'employee', 'admin') NOT NULL,
    device_fingerprint VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    device_type ENUM('desktop', 'mobile', 'tablet', 'unknown') DEFAULT 'unknown',
    browser VARCHAR(100),
    os VARCHAR(100),
    is_trusted BOOLEAN DEFAULT FALSE,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_ip VARCHAR(45),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_user_devices_user (user_id, user_type, is_active),
    INDEX idx_user_devices_fingerprint (device_fingerprint),
    INDEX idx_user_devices_trusted (is_trusted, is_active),
    INDEX idx_user_devices_last_seen (last_seen)
);

-- Two-factor authentication (for future implementation)
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    user_type ENUM('customer', 'employee', 'admin') NOT NULL,
    method ENUM('totp', 'sms', 'email') NOT NULL,
    secret_key VARCHAR(255), -- Encrypted TOTP secret
    backup_codes JSON, -- Encrypted backup codes
    is_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    phone_number VARCHAR(20), -- For SMS 2FA
    email VARCHAR(255), -- For email 2FA
    
    UNIQUE KEY unique_user_2fa (user_id, user_type, method),
    INDEX idx_2fa_user (user_id, user_type, is_enabled)
);

-- API access logs for monitoring and debugging
CREATE TABLE IF NOT EXISTS api_access_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(255) UNIQUE,
    user_id VARCHAR(50),
    user_type ENUM('customer', 'employee', 'admin'),
    session_id VARCHAR(255),
    method ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH') NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_body JSON,
    response_status INT,
    response_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    
    INDEX idx_api_logs_user (user_id, user_type, created_at),
    INDEX idx_api_logs_endpoint (endpoint, method, created_at),
    INDEX idx_api_logs_status (response_status, created_at),
    INDEX idx_api_logs_session (session_id, created_at),
    INDEX idx_api_logs_time (created_at)
);

-- System configurations for dynamic settings
CREATE TABLE IF NOT EXISTS system_configurations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSON NOT NULL,
    description TEXT,
    category ENUM('security', 'session', 'rate_limit', 'general') DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    
    INDEX idx_system_config_key (config_key, is_active),
    INDEX idx_system_config_category (category, is_active)
);

-- Insert default system configurations
INSERT INTO system_configurations (config_key, config_value, description, category) VALUES
('session.max_concurrent_sessions', '3', 'Maximum concurrent sessions per user', 'session'),
('session.idle_timeout_minutes', '30', 'Session idle timeout in minutes', 'session'),
('session.absolute_timeout_hours', '24', 'Absolute session timeout in hours', 'session'),
('security.max_login_attempts', '5', 'Maximum failed login attempts before lockout', 'security'),
('security.lockout_duration_minutes', '15', 'Account lockout duration in minutes', 'security'),
('security.password_min_length', '8', 'Minimum password length', 'security'),
('security.require_2fa_for_admin', 'true', 'Require 2FA for admin accounts', 'security'),
('rate_limit.registration_per_ip_per_hour', '5', 'Max registration attempts per IP per hour', 'rate_limit'),
('rate_limit.api_requests_per_minute', '100', 'Max API requests per minute per user', 'rate_limit'),
('rate_limit.password_reset_per_hour', '3', 'Max password reset attempts per hour', 'rate_limit')
ON DUPLICATE KEY UPDATE 
    config_value = VALUES(config_value),
    updated_at = CURRENT_TIMESTAMP;

-- Add indexes for better performance on existing tables
-- Registration progress table indexes (if not already present)
ALTER TABLE CUSTOMER_REGISTRATION_PROGRESS 
ADD INDEX IF NOT EXISTS idx_registration_session (session_id, expires_at),
ADD INDEX IF NOT EXISTS idx_registration_step (current_step, is_completed),
ADD INDEX IF NOT EXISTS idx_registration_created (created_at);

-- Customer table indexes for authentication
ALTER TABLE CUSTOMER 
ADD INDEX IF NOT EXISTS idx_customer_username (customer_username),
ADD INDEX IF NOT EXISTS idx_customer_status (customer_status),
ADD INDEX IF NOT EXISTS idx_customer_auth (customer_username, customer_status);

-- Employee table indexes for authentication  
ALTER TABLE BANK_EMPLOYEE 
ADD INDEX IF NOT EXISTS idx_employee_username (employee_username),
ADD INDEX IF NOT EXISTS idx_employee_status (employee_status),
ADD INDEX IF NOT EXISTS idx_employee_auth (employee_username, employee_status);

-- Admin table indexes for authentication
ALTER TABLE admin 
ADD INDEX IF NOT EXISTS idx_admin_username (username),
ADD INDEX IF NOT EXISTS idx_admin_email (email);

-- Note: Triggers removed for compatibility
-- They can be added separately if needed

-- Create indexes for optimal query performance
CREATE INDEX idx_composite_security_monitoring 
ON login_attempts (ip_address, identifier, attempt_time, success);

CREATE INDEX idx_composite_session_cleanup 
ON user_sessions (status, expires_at, last_activity);

CREATE INDEX idx_composite_audit_trail 
ON security_events (user_id, event_type, created_at, severity);
