-- ==================================================================
-- UniVault Banking System - Performance Optimization Migration
-- Version: 1.0.0
-- Description: Comprehensive database performance optimization
-- ==================================================================

-- Add additional performance indexes for existing tables
-- Customer table optimizations
CREATE INDEX IF NOT EXISTS idx_customer_registration_date ON CUSTOMER(registration_date);
CREATE INDEX IF NOT EXISTS idx_customer_status_active ON CUSTOMER(customer_status) WHERE customer_status = 'Active';
CREATE INDEX IF NOT EXISTS idx_customer_birth_date ON CUSTOMER(birth_date);
CREATE INDEX IF NOT EXISTS idx_customer_fullname ON CUSTOMER(customer_last_name, customer_first_name);
CREATE INDEX IF NOT EXISTS idx_customer_search ON CUSTOMER(customer_last_name, customer_first_name, customer_username);

-- Customer address optimizations
CREATE INDEX IF NOT EXISTS idx_customer_address_location ON CUSTOMER_ADDRESS(address_city, address_province, address_country);
CREATE INDEX IF NOT EXISTS idx_customer_address_postal ON CUSTOMER_ADDRESS(address_zip_code);
CREATE INDEX IF NOT EXISTS idx_customer_address_type ON CUSTOMER_ADDRESS(address_type_code, cif_number);

-- Contact details optimizations
CREATE INDEX IF NOT EXISTS idx_contact_details_type ON CUSTOMER_CONTACT_DETAILS(contact_type_code, cif_number);
CREATE INDEX IF NOT EXISTS idx_contact_details_value ON CUSTOMER_CONTACT_DETAILS(contact_value);

-- Employment information optimizations
CREATE INDEX IF NOT EXISTS idx_employment_employer ON CUSTOMER_EMPLOYMENT_INFORMATION(employer_business_name);
CREATE INDEX IF NOT EXISTS idx_employment_income ON CUSTOMER_EMPLOYMENT_INFORMATION(income_monthly_gross);
CREATE INDEX IF NOT EXISTS idx_employment_position ON CUSTOMER_EMPLOYMENT_INFORMATION(position_code, cif_number);

-- Account optimizations
CREATE INDEX IF NOT EXISTS idx_account_status ON ACCOUNT(account_status, cif_number);
CREATE INDEX IF NOT EXISTS idx_account_type ON ACCOUNT(account_type_code, account_status);
CREATE INDEX IF NOT EXISTS idx_account_balance ON ACCOUNT(current_balance, account_status);
CREATE INDEX IF NOT EXISTS idx_account_created ON ACCOUNT(account_creation_date, account_status);

-- Transaction optimizations
CREATE INDEX IF NOT EXISTS idx_transaction_date ON TRANSACTION(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_amount ON TRANSACTION(transaction_amount, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON TRANSACTION(transaction_type, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_account_date ON TRANSACTION(account_number, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_reference ON TRANSACTION(transaction_reference_number);
CREATE INDEX IF NOT EXISTS idx_transaction_status ON TRANSACTION(transaction_status, transaction_date DESC);

-- Employee optimizations
CREATE INDEX IF NOT EXISTS idx_employee_department ON BANK_EMPLOYEE(department_code, employee_status);
CREATE INDEX IF NOT EXISTS idx_employee_position ON BANK_EMPLOYEE(position_code, employee_status);
CREATE INDEX IF NOT EXISTS idx_employee_hire_date ON BANK_EMPLOYEE(hire_date);

-- Session management table optimizations (from enhanced system)
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at, status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_activity ON user_sessions(last_activity DESC, status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device ON user_sessions(device_fingerprint, user_id);

-- Login attempts optimizations
CREATE INDEX IF NOT EXISTS idx_login_attempts_time_ip ON login_attempts(attempt_time DESC, ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success, attempt_time DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_time ON login_attempts(identifier, attempt_time DESC);

-- Security events optimizations
CREATE INDEX IF NOT EXISTS idx_security_events_time ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_time ON security_events(user_id, created_at DESC);

-- Registration sessions optimizations
CREATE INDEX IF NOT EXISTS idx_registration_expires ON registration_sessions(expires_at, status);
CREATE INDEX IF NOT EXISTS idx_registration_created ON registration_sessions(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_customer_account_composite ON ACCOUNT(cif_number, account_status, account_type_code);
CREATE INDEX IF NOT EXISTS idx_transaction_account_type_date ON TRANSACTION(account_number, transaction_type, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_contact_composite ON CUSTOMER_CONTACT_DETAILS(cif_number, contact_type_code, contact_value);

-- Reference data table optimizations
CREATE INDEX IF NOT EXISTS idx_country_active ON COUNTRY(is_active, country_name);
CREATE INDEX IF NOT EXISTS idx_state_country ON STATE(country_code, is_active, state_name);
CREATE INDEX IF NOT EXISTS idx_city_state ON CITY(state_code, is_active, city_name);
CREATE INDEX IF NOT EXISTS idx_city_postal ON CITY(postal_code, is_active);

-- Create materialized view-like tables for reporting
CREATE TABLE IF NOT EXISTS customer_summary_cache (
    cif_number INT PRIMARY KEY,
    full_name VARCHAR(255),
    account_count INT DEFAULT 0,
    total_balance DECIMAL(15,2) DEFAULT 0.00,
    last_transaction_date TIMESTAMP NULL,
    registration_date TIMESTAMP,
    status VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_summary_balance (total_balance DESC),
    INDEX idx_summary_accounts (account_count DESC),
    INDEX idx_summary_last_transaction (last_transaction_date DESC),
    INDEX idx_summary_status (status, registration_date DESC)
);

-- Populate customer summary cache
INSERT INTO customer_summary_cache (cif_number, full_name, registration_date, status)
SELECT 
    c.cif_number,
    CONCAT(c.customer_first_name, ' ', IFNULL(c.customer_middle_name, ''), ' ', c.customer_last_name) as full_name,
    c.registration_date,
    c.customer_status
FROM CUSTOMER c
WHERE c.is_deleted = FALSE
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    status = VALUES(status);

-- Transaction summary cache for performance
CREATE TABLE IF NOT EXISTS transaction_summary_cache (
    account_number VARCHAR(20) PRIMARY KEY,
    total_transactions INT DEFAULT 0,
    total_credits DECIMAL(15,2) DEFAULT 0.00,
    total_debits DECIMAL(15,2) DEFAULT 0.00,
    last_transaction_date TIMESTAMP NULL,
    last_transaction_amount DECIMAL(15,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_trans_summary_date (last_transaction_date DESC),
    INDEX idx_trans_summary_amount (last_transaction_amount DESC),
    INDEX idx_trans_summary_count (total_transactions DESC)
);

-- Database configuration optimizations
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB buffer pool
SET GLOBAL query_cache_size = 268435456; -- 256MB query cache
SET GLOBAL tmp_table_size = 67108864; -- 64MB temp table size
SET GLOBAL max_heap_table_size = 67108864; -- 64MB heap table size

-- Create stored procedures for common operations
DELIMITER //

-- Procedure to update customer summary cache
CREATE PROCEDURE IF NOT EXISTS UpdateCustomerSummary(IN customer_cif INT)
BEGIN
    DECLARE account_cnt INT DEFAULT 0;
    DECLARE total_bal DECIMAL(15,2) DEFAULT 0.00;
    DECLARE last_trans_date TIMESTAMP DEFAULT NULL;
    
    -- Get account count and total balance
    SELECT COUNT(*), IFNULL(SUM(current_balance), 0)
    INTO account_cnt, total_bal
    FROM ACCOUNT 
    WHERE cif_number = customer_cif AND account_status = 'Active';
    
    -- Get last transaction date
    SELECT MAX(t.transaction_date)
    INTO last_trans_date
    FROM TRANSACTION t
    INNER JOIN ACCOUNT a ON t.account_number = a.account_number
    WHERE a.cif_number = customer_cif;
    
    -- Update summary cache
    UPDATE customer_summary_cache 
    SET 
        account_count = account_cnt,
        total_balance = total_bal,
        last_transaction_date = last_trans_date,
        last_updated = NOW()
    WHERE cif_number = customer_cif;
    
END//

-- Procedure to update transaction summary cache
CREATE PROCEDURE IF NOT EXISTS UpdateTransactionSummary(IN acc_number VARCHAR(20))
BEGIN
    DECLARE trans_count INT DEFAULT 0;
    DECLARE total_credit DECIMAL(15,2) DEFAULT 0.00;
    DECLARE total_debit DECIMAL(15,2) DEFAULT 0.00;
    DECLARE last_trans_date TIMESTAMP DEFAULT NULL;
    DECLARE last_trans_amount DECIMAL(15,2) DEFAULT 0.00;
    
    -- Get transaction statistics
    SELECT 
        COUNT(*),
        IFNULL(SUM(CASE WHEN transaction_type = 'Credit' THEN transaction_amount ELSE 0 END), 0),
        IFNULL(SUM(CASE WHEN transaction_type = 'Debit' THEN transaction_amount ELSE 0 END), 0),
        MAX(transaction_date),
        (SELECT transaction_amount FROM TRANSACTION WHERE account_number = acc_number ORDER BY transaction_date DESC LIMIT 1)
    INTO trans_count, total_credit, total_debit, last_trans_date, last_trans_amount
    FROM TRANSACTION 
    WHERE account_number = acc_number;
    
    -- Update or insert summary
    INSERT INTO transaction_summary_cache (
        account_number, total_transactions, total_credits, total_debits,
        last_transaction_date, last_transaction_amount
    ) VALUES (
        acc_number, trans_count, total_credit, total_debit,
        last_trans_date, last_trans_amount
    ) ON DUPLICATE KEY UPDATE
        total_transactions = VALUES(total_transactions),
        total_credits = VALUES(total_credits),
        total_debits = VALUES(total_debits),
        last_transaction_date = VALUES(last_transaction_date),
        last_transaction_amount = VALUES(last_transaction_amount),
        last_updated = NOW();
        
END//

-- Function to calculate customer risk score
CREATE FUNCTION IF NOT EXISTS CalculateCustomerRiskScore(customer_cif INT) 
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE risk_score DECIMAL(5,2) DEFAULT 0.00;
    DECLARE account_age_days INT DEFAULT 0;
    DECLARE failed_logins INT DEFAULT 0;
    DECLARE avg_transaction_amount DECIMAL(15,2) DEFAULT 0.00;
    
    -- Account age factor (newer accounts = higher risk)
    SELECT DATEDIFF(NOW(), MIN(account_creation_date))
    INTO account_age_days
    FROM ACCOUNT 
    WHERE cif_number = customer_cif;
    
    IF account_age_days < 30 THEN
        SET risk_score = risk_score + 2.0;
    ELSEIF account_age_days < 90 THEN
        SET risk_score = risk_score + 1.0;
    END IF;
    
    -- Failed login attempts (last 30 days)
    SELECT COUNT(*)
    INTO failed_logins
    FROM login_attempts 
    WHERE identifier = (SELECT customer_username FROM CUSTOMER WHERE cif_number = customer_cif)
    AND success = FALSE 
    AND attempt_time > DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    SET risk_score = risk_score + (failed_logins * 0.5);
    
    -- Large transaction patterns
    SELECT AVG(transaction_amount)
    INTO avg_transaction_amount
    FROM TRANSACTION t
    INNER JOIN ACCOUNT a ON t.account_number = a.account_number
    WHERE a.cif_number = customer_cif
    AND t.transaction_date > DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    IF avg_transaction_amount > 100000 THEN
        SET risk_score = risk_score + 1.5;
    ELSEIF avg_transaction_amount > 50000 THEN
        SET risk_score = risk_score + 0.5;
    END IF;
    
    RETURN LEAST(risk_score, 10.00); -- Cap at 10.00
END//

DELIMITER ;

-- Create triggers to maintain cache tables
CREATE TRIGGER IF NOT EXISTS after_account_update
AFTER UPDATE ON ACCOUNT
FOR EACH ROW
BEGIN
    CALL UpdateCustomerSummary(NEW.cif_number);
    CALL UpdateTransactionSummary(NEW.account_number);
END;

CREATE TRIGGER IF NOT EXISTS after_transaction_insert
AFTER INSERT ON TRANSACTION
FOR EACH ROW
BEGIN
    CALL UpdateTransactionSummary(NEW.account_number);
    -- Update customer summary for the account owner
    CALL UpdateCustomerSummary((SELECT cif_number FROM ACCOUNT WHERE account_number = NEW.account_number));
END;

-- Cleanup old data procedures
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS CleanupOldData()
BEGIN
    -- Clean up old login attempts (older than 1 year)
    DELETE FROM login_attempts 
    WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Clean up old security events (older than 2 years)
    DELETE FROM security_events 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);
    
    -- Clean up expired registration sessions (older than 30 days)
    DELETE FROM registration_sessions 
    WHERE expires_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND status IN ('expired', 'cancelled');
    
    -- Clean up old password reset tokens (older than 7 days)
    DELETE FROM password_reset_tokens 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
    
    -- Archive old transactions (older than 7 years) to archive table
    INSERT INTO transaction_archive 
    SELECT * FROM TRANSACTION 
    WHERE transaction_date < DATE_SUB(NOW(), INTERVAL 7 YEAR);
    
    DELETE FROM TRANSACTION 
    WHERE transaction_date < DATE_SUB(NOW(), INTERVAL 7 YEAR);
    
END//

DELIMITER ;

-- Create archive table for old transactions
CREATE TABLE IF NOT EXISTS transaction_archive (
    transaction_id INT PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL,
    transaction_type ENUM('Credit', 'Debit', 'Transfer', 'Withdrawal', 'Deposit') NOT NULL,
    transaction_amount DECIMAL(15,2) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    transaction_description TEXT,
    transaction_reference_number VARCHAR(50),
    transaction_status ENUM('Pending', 'Completed', 'Failed', 'Cancelled') DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_archive_account (account_number, transaction_date DESC),
    INDEX idx_archive_date (transaction_date DESC),
    INDEX idx_archive_amount (transaction_amount DESC)
);

-- Query optimization views
CREATE VIEW IF NOT EXISTS active_customers_view AS
SELECT 
    c.cif_number,
    c.customer_username,
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) as full_name,
    c.customer_status,
    c.registration_date,
    cs.account_count,
    cs.total_balance,
    cs.last_transaction_date
FROM CUSTOMER c
LEFT JOIN customer_summary_cache cs ON c.cif_number = cs.cif_number
WHERE c.customer_status = 'Active' AND c.is_deleted = FALSE;

CREATE VIEW IF NOT EXISTS account_summary_view AS
SELECT 
    a.account_number,
    a.cif_number,
    a.account_type_code,
    a.current_balance,
    a.account_status,
    a.account_creation_date,
    c.customer_username,
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) as customer_name,
    ts.total_transactions,
    ts.last_transaction_date
FROM ACCOUNT a
INNER JOIN CUSTOMER c ON a.cif_number = c.cif_number
LEFT JOIN transaction_summary_cache ts ON a.account_number = ts.account_number
WHERE a.account_status = 'Active' AND c.is_deleted = FALSE;

-- Performance monitoring table
CREATE TABLE IF NOT EXISTS query_performance_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    query_hash VARCHAR(64) NOT NULL,
    query_type VARCHAR(50) NOT NULL,
    execution_time_ms INT NOT NULL,
    rows_examined INT DEFAULT 0,
    rows_sent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_perf_hash (query_hash),
    INDEX idx_perf_time (execution_time_ms DESC),
    INDEX idx_perf_created (created_at DESC)
);

-- Table statistics for query planner
ANALYZE TABLE CUSTOMER;
ANALYZE TABLE ACCOUNT;
ANALYZE TABLE TRANSACTION;
ANALYZE TABLE CUSTOMER_ADDRESS;
ANALYZE TABLE CUSTOMER_CONTACT_DETAILS;
ANALYZE TABLE CUSTOMER_EMPLOYMENT_INFORMATION;
ANALYZE TABLE user_sessions;
ANALYZE TABLE login_attempts;
ANALYZE TABLE security_events;

-- Database maintenance events (if supported)
-- Note: This may need to be set up separately in production
SET GLOBAL event_scheduler = ON;

DELIMITER //

CREATE EVENT IF NOT EXISTS daily_maintenance
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    -- Update all customer summaries
    UPDATE customer_summary_cache cs
    INNER JOIN CUSTOMER c ON cs.cif_number = c.cif_number
    SET cs.last_updated = NOW()
    WHERE cs.last_updated < DATE_SUB(NOW(), INTERVAL 1 DAY);
    
    -- Cleanup old sessions
    CALL CleanupOldData();
    
    -- Update table statistics
    ANALYZE TABLE CUSTOMER;
    ANALYZE TABLE ACCOUNT;
    ANALYZE TABLE TRANSACTION;
END//

DELIMITER ;

-- Final optimization settings
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
SET GLOBAL sync_binlog = 0;
SET GLOBAL innodb_file_per_table = 1;

-- Log completion
INSERT INTO system_configurations (config_key, config_value, description, category) VALUES
('db.optimization_applied', '"true"', 'Database optimization migration applied', 'general'),
('db.optimization_date', CONCAT('"', NOW(), '"'), 'Date when optimization was applied', 'general'),
('db.performance_monitoring', '"enabled"', 'Performance monitoring enabled', 'general')
ON DUPLICATE KEY UPDATE 
    config_value = VALUES(config_value),
    updated_at = NOW();

-- Performance optimization completed
SELECT 'Database performance optimization completed successfully' as Status;
