-- Additional tables for UniVault system completion
USE univault_schema;

-- Add password_hash column to customer table if it doesn't exist
ALTER TABLE customer ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE customer ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE;
ALTER TABLE customer ADD COLUMN IF NOT EXISTS approval_date DATETIME;
ALTER TABLE customer ADD COLUMN IF NOT EXISTS approved_by VARCHAR(50);
ALTER TABLE customer ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(50);
ALTER TABLE customer ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add additional account fields
ALTER TABLE account ADD COLUMN IF NOT EXISTS account_number VARCHAR(20) UNIQUE;
ALTER TABLE account ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE account ADD COLUMN IF NOT EXISTS preferred_branch VARCHAR(100);
ALTER TABLE account ADD COLUMN IF NOT EXISTS employment_info JSON;
ALTER TABLE account ADD COLUMN IF NOT EXISTS fund_source_info JSON;
ALTER TABLE account ADD COLUMN IF NOT EXISTS approval_date DATETIME;
ALTER TABLE account ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE account ADD COLUMN IF NOT EXISTS closure_date DATETIME;

-- Account closure request table
CREATE TABLE IF NOT EXISTS account_closure_request (
    request_id VARCHAR(20) PRIMARY KEY,
    account_id VARCHAR(20) NOT NULL,
    customer_id VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    transfer_to_account VARCHAR(20),
    current_balance DECIMAL(15,2),
    request_date DATETIME NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    approved_by VARCHAR(50),
    rejected_by VARCHAR(50),
    approval_date DATETIME,
    rejection_date DATETIME,
    admin_notes TEXT,
    
    FOREIGN KEY (account_id) REFERENCES account(account_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- Enhanced transaction table
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS recipient_account_id VARCHAR(20);
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(100);
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS sender_account_id VARCHAR(20);
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS sender_name VARCHAR(100);
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS reference_number VARCHAR(50);

-- Admin table (if not exists)
CREATE TABLE IF NOT EXISTS admin (
    admin_id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('SUPER_ADMIN', 'ADMIN', 'REVIEWER') DEFAULT 'ADMIN',
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    created_by VARCHAR(20)
);

-- Insert default admin user (password: admin123456)
-- Note: This will create a default admin. Change the password immediately!
INSERT IGNORE INTO admin (admin_id, username, email, password_hash, full_name, role) 
VALUES (
    'ADMIN001', 
    'admin', 
    'admin@univault.com', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewNF2/c.XqlAOGsq', -- admin123456
    'System Administrator',
    'SUPER_ADMIN'
);

-- Transaction status type table
CREATE TABLE IF NOT EXISTS transaction_status_type (
    transaction_status_code VARCHAR(10) PRIMARY KEY,
    transaction_status_description VARCHAR(50) NOT NULL
);

INSERT IGNORE INTO transaction_status_type VALUES 
('PENDING', 'Pending'),
('COMPLETED', 'Completed'),
('FAILED', 'Failed'),
('CANCELLED', 'Cancelled');

-- Transaction type table  
CREATE TABLE IF NOT EXISTS transaction_type (
    transaction_type_code VARCHAR(10) PRIMARY KEY,
    transaction_type_description VARCHAR(50) NOT NULL
);

INSERT IGNORE INTO transaction_type VALUES 
('DEPOSIT', 'Deposit'),
('WITHDRAWAL', 'Withdrawal'),
('TRANSFER', 'Transfer'),
('FEE', 'Fee'),
('INTEREST', 'Interest');

-- Account status type table
CREATE TABLE IF NOT EXISTS account_status_type (
    account_status_code VARCHAR(10) PRIMARY KEY,
    account_status_description VARCHAR(50) NOT NULL
);

INSERT IGNORE INTO account_status_type VALUES 
('PENDING', 'Pending Approval'),
('ACTIVE', 'Active'),
('CLOSED', 'Closed'),
('SUSPENDED', 'Suspended'),
('REJECTED', 'Rejected'),
('CANCELLED', 'Cancelled');

-- Account type table
CREATE TABLE IF NOT EXISTS account_type (
    account_type_code VARCHAR(10) PRIMARY KEY,
    account_type_description VARCHAR(50) NOT NULL,
    minimum_balance DECIMAL(10,2) DEFAULT 0,
    maintenance_fee DECIMAL(10,2) DEFAULT 0
);

INSERT IGNORE INTO account_type VALUES 
('SAV001', 'Regular Savings Account', 500.00, 0.00),
('CHK001', 'Current/Checking Account', 1000.00, 25.00),
('SAV002', 'High-Yield Savings Account', 10000.00, 0.00),
('TIME001', 'Time Deposit Account', 5000.00, 0.00);

-- Update existing account records to have proper status codes
UPDATE account SET account_status_code = 'PENDING' WHERE account_status_code IS NULL;

-- Update existing transaction records to have proper status codes  
UPDATE transaction SET transaction_status_code = 'COMPLETED' WHERE transaction_status_code IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
CREATE INDEX IF NOT EXISTS idx_customer_status ON customer(status);
CREATE INDEX IF NOT EXISTS idx_account_customer ON account(customer_id);
CREATE INDEX IF NOT EXISTS idx_account_status ON account(account_status_code);
CREATE INDEX IF NOT EXISTS idx_transaction_account ON transaction(account_id);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON transaction(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_status ON transaction(transaction_status_code);

COMMIT;
