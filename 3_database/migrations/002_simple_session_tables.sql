-- Simple session management tables for UniVault

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
    device_fingerprint VARCHAR(255)
);

-- Login attempt tracking
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(255) NOT NULL,
    user_type ENUM('customer', 'employee', 'admin') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255),
    session_id VARCHAR(255)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    user_type ENUM('customer', 'employee', 'admin') NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_used BOOLEAN DEFAULT FALSE
);

-- Security events logging
CREATE TABLE IF NOT EXISTS security_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(50),
    user_type ENUM('customer', 'employee', 'admin'),
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account lockout tracking
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
    unlocked_by VARCHAR(50),
    unlock_reason TEXT
);

-- System configurations
CREATE TABLE IF NOT EXISTS system_configurations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSON NOT NULL,
    description TEXT,
    category ENUM('security', 'session', 'rate_limit', 'general') DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(50)
);

-- Insert default configurations
INSERT IGNORE INTO system_configurations (config_key, config_value, description, category) VALUES
('session.max_concurrent_sessions', '3', 'Maximum concurrent sessions per user', 'session'),
('session.idle_timeout_minutes', '30', 'Session idle timeout in minutes', 'session'),
('security.max_login_attempts', '5', 'Maximum failed login attempts before lockout', 'security'),
('security.lockout_duration_minutes', '15', 'Account lockout duration in minutes', 'security'),
('rate_limit.api_requests_per_minute', '100', 'Max API requests per minute per user', 'rate_limit');

-- Create basic indexes
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id, user_type, status);
CREATE INDEX idx_user_sessions_session ON user_sessions(session_id);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, attempt_time);
CREATE INDEX idx_security_events_user ON security_events(user_id, created_at);
CREATE INDEX idx_account_lockouts_user ON account_lockouts(user_id, user_type, is_active);
