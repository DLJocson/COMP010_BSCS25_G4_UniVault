-- UniVault Banking System - Optimized Database Schema
-- Version: 2.0 - Optimized with proper indexes and naming conventions

CREATE DATABASE IF NOT EXISTS univault_schema;
USE univault_schema;

-- Set proper SQL mode for data integrity
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Drop all tables in correct order (for clean reinstall)
SET FOREIGN_KEY_CHECKS = 0;
-- ... (table drops would go here if needed)
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================
-- REFERENCE TABLES (Lookup Tables)
-- =====================================

-- Civil Status Reference
CREATE TABLE CIVIL_STATUS_TYPE (
    civil_status_code           CHAR(4) NOT NULL PRIMARY KEY,
    civil_status_description    VARCHAR(50) NOT NULL,
    
    -- Constraints
    CONSTRAINT check_civil_status_code CHECK (civil_status_code REGEXP '^CS[0-9]{2}$'),
    CONSTRAINT check_civil_status_description CHECK (civil_status_description REGEXP '^[A-Za-z /(),&.''-]+$')
);

-- Address Type Reference
CREATE TABLE ADDRESS_TYPE (
    address_type_code   CHAR(4) NOT NULL PRIMARY KEY,
    address_type        VARCHAR(20) NOT NULL,
    
    CONSTRAINT check_address_type_code CHECK (address_type_code REGEXP '^AD[0-9]{2}$'),
    CONSTRAINT check_address_type CHECK (address_type REGEXP '^[A-Za-z /(),&.''-]+$')
);

-- Contact Type Reference
CREATE TABLE CONTACT_TYPE (
    contact_type_code            CHAR(4) NOT NULL PRIMARY KEY,
    contact_type_description     VARCHAR(20) NOT NULL,
    
    CONSTRAINT check_contact_type_code CHECK (contact_type_code REGEXP '^CT[0-9]{2}$'),
    CONSTRAINT check_contact_type_description CHECK (contact_type_description REGEXP '^[A-Za-z /(),&.''-]+$')
);

-- Employment Position Reference
CREATE TABLE EMPLOYMENT_POSITION (
    position_code       CHAR(4) NOT NULL PRIMARY KEY,
    employment_type     VARCHAR(50) NOT NULL,
    job_title           VARCHAR(50) NOT NULL,
    
    CONSTRAINT check_position_code CHECK (position_code REGEXP '^EP[0-9]{2}$'),
    CONSTRAINT check_employment_type CHECK (employment_type REGEXP '^[A-Za-z /-]+$'),
    CONSTRAINT check_job_title CHECK (job_title REGEXP '^[A-Za-z /(),&.''-]+$')
);

-- Fund Source Reference
CREATE TABLE FUND_SOURCE_TYPE (
    fund_source_code    CHAR(5) NOT NULL PRIMARY KEY,
    fund_source         VARCHAR(100) NOT NULL,
    
    CONSTRAINT check_fund_source_code CHECK (fund_source_code REGEXP '^FS[0-9]{3}$'),
    CONSTRAINT check_fund_source CHECK (fund_source REGEXP '^[A-Za-z /(),&.''-]+$')
);

-- Work Nature Reference
CREATE TABLE WORK_NATURE_TYPE (
    work_nature_code        CHAR(3) NOT NULL PRIMARY KEY,
    nature_description      VARCHAR(150) NOT NULL,
    
    CONSTRAINT check_work_nature_code CHECK (work_nature_code REGEXP '^[A-Z]{3}$'),
    CONSTRAINT check_nature_description CHECK (nature_description REGEXP '^[A-Za-z /(),&.''-]+$')
);

-- ID Type Reference
CREATE TABLE ID_TYPE (
    id_type_code        CHAR(4) NOT NULL PRIMARY KEY,
    id_description      VARCHAR(50) NOT NULL,
    
    CONSTRAINT check_id_type_code CHECK (id_type_code REGEXP '^ID[0-9]{2}$'),
    CONSTRAINT check_id_description CHECK (id_description REGEXP '^[A-Za-z /(),&.''-]+$')
);

-- Product Type Reference
CREATE TABLE CUSTOMER_PRODUCT_TYPE (
    product_type_code       CHAR(4) NOT NULL PRIMARY KEY,
    product_type_name       VARCHAR(50) NOT NULL,
    product_description     TEXT,
    
    CONSTRAINT check_product_type_code CHECK (product_type_code REGEXP '^PT[0-9]{2}$'),
    CONSTRAINT check_product_type_name CHECK (product_type_name REGEXP '^[A-Za-z /(),&.''-]+$')
);

-- =====================================
-- MAIN ENTITY TABLES
-- =====================================

-- Customer Table (Main entity)
CREATE TABLE CUSTOMER (
    cif_number                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_type               VARCHAR(20) NOT NULL,
    customer_last_name          VARCHAR(50) NOT NULL,
    customer_first_name         VARCHAR(50) NOT NULL,
    customer_middle_name        VARCHAR(50),
    customer_suffix_name        VARCHAR(10),
    customer_username           VARCHAR(50) NOT NULL UNIQUE,
    customer_password           VARCHAR(255) NOT NULL,
    birth_date                  DATE NOT NULL,
    gender                      ENUM('Male', 'Female', 'Other') NOT NULL,
    civil_status_code           CHAR(4) NOT NULL,
    birth_country               VARCHAR(50) NOT NULL,
    citizenship                 VARCHAR(50) NOT NULL,
    
    -- Registration fields
    reg_political_affiliation   VARCHAR(100),
    reg_fatca                   VARCHAR(100),
    reg_dnfbp                   VARCHAR(100),
    reg_online_gaming           VARCHAR(100),
    reg_beneficial_owner        VARCHAR(100),
    
    -- Additional fields
    biometric_type              VARCHAR(50),
    remittance_country          VARCHAR(50),
    remittance_purpose          VARCHAR(100),
    
    -- Status and audit fields
    customer_status             ENUM('Active', 'Inactive', 'Pending Verification', 'Suspended', 'Closed') DEFAULT 'Pending Verification',
    is_deleted                  BOOLEAN DEFAULT FALSE,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                  TIMESTAMP NULL,
    deleted_by                  BIGINT,
    
    -- Foreign Keys
    FOREIGN KEY (civil_status_code) REFERENCES CIVIL_STATUS_TYPE(civil_status_code),
    
    -- Indexes for performance
    INDEX idx_customer_username (customer_username),
    INDEX idx_customer_status (customer_status),
    INDEX idx_customer_name (customer_last_name, customer_first_name),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_status (is_deleted, customer_status)
);

-- Bank Employee Table
CREATE TABLE BANK_EMPLOYEE (
    employee_id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_username       VARCHAR(50) NOT NULL UNIQUE,
    employee_password       VARCHAR(255) NOT NULL,
    employee_first_name     VARCHAR(50) NOT NULL,
    employee_last_name      VARCHAR(50) NOT NULL,
    employee_position       VARCHAR(100) NOT NULL,
    employee_email          VARCHAR(100),
    employee_status         ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    
    -- Audit fields
    is_deleted              BOOLEAN DEFAULT FALSE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_employee_username (employee_username),
    INDEX idx_employee_status (employee_status)
);

-- =====================================
-- CUSTOMER RELATED TABLES
-- =====================================

-- Customer Address
CREATE TABLE CUSTOMER_ADDRESS (
    address_id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    cif_number              BIGINT NOT NULL,
    address_type_code       CHAR(4) NOT NULL,
    address_unit            VARCHAR(20),
    address_building        VARCHAR(100),
    address_street          VARCHAR(100),
    address_subdivision     VARCHAR(100),
    address_barangay        VARCHAR(100) NOT NULL,
    address_city            VARCHAR(100) NOT NULL,
    address_province        VARCHAR(100) NOT NULL,
    address_country         VARCHAR(100) NOT NULL,
    address_zip_code        VARCHAR(20) NOT NULL,
    
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON DELETE CASCADE,
    FOREIGN KEY (address_type_code) REFERENCES ADDRESS_TYPE(address_type_code),
    
    -- Indexes
    INDEX idx_customer_address (cif_number),
    INDEX idx_address_type (address_type_code)
);

-- Customer Contact Details
CREATE TABLE CUSTOMER_CONTACT_DETAILS (
    contact_id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    cif_number              BIGINT NOT NULL,
    contact_type_code       CHAR(4) NOT NULL,
    contact_value           VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON DELETE CASCADE,
    FOREIGN KEY (contact_type_code) REFERENCES CONTACT_TYPE(contact_type_code),
    
    -- Indexes
    INDEX idx_customer_contact (cif_number),
    INDEX idx_contact_type (contact_type_code),
    INDEX idx_contact_value (contact_value)
);

-- Customer ID Documents
CREATE TABLE CUSTOMER_ID (
    customer_id_number      BIGINT AUTO_INCREMENT PRIMARY KEY,
    cif_number              BIGINT NOT NULL,
    id_type_code            CHAR(4) NOT NULL,
    id_number               VARCHAR(50) NOT NULL,
    id_storage              VARCHAR(255),
    id_issue_date           DATE,
    id_expiry_date          DATE,
    
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON DELETE CASCADE,
    FOREIGN KEY (id_type_code) REFERENCES ID_TYPE(id_type_code),
    
    -- Indexes
    INDEX idx_customer_id (cif_number),
    INDEX idx_id_number (id_number),
    INDEX idx_id_type (id_type_code)
);

-- Customer Employment Information
CREATE TABLE CUSTOMER_EMPLOYMENT_INFORMATION (
    customer_employment_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    cif_number              BIGINT NOT NULL,
    employer_business_name  VARCHAR(200) NOT NULL,
    employment_start_date   DATE,
    employment_end_date     DATE,
    employment_status       VARCHAR(50) DEFAULT 'Current',
    position_code           CHAR(4) NOT NULL,
    income_monthly_gross    DECIMAL(15,2) DEFAULT 0,
    
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON DELETE CASCADE,
    FOREIGN KEY (position_code) REFERENCES EMPLOYMENT_POSITION(position_code),
    
    -- Indexes
    INDEX idx_customer_employment (cif_number),
    INDEX idx_position_code (position_code)
);

-- Customer Fund Source
CREATE TABLE CUSTOMER_FUND_SOURCE (
    fund_source_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    cif_number              BIGINT NOT NULL,
    fund_source_code        CHAR(5) NOT NULL,
    
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON DELETE CASCADE,
    FOREIGN KEY (fund_source_code) REFERENCES FUND_SOURCE_TYPE(fund_source_code),
    
    -- Indexes
    INDEX idx_customer_fund_source (cif_number),
    INDEX idx_fund_source_code (fund_source_code)
);

-- Customer Work Nature
CREATE TABLE CUSTOMER_WORK_NATURE (
    work_nature_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_employment_id  BIGINT NOT NULL,
    work_nature_code        CHAR(3) NOT NULL,
    
    FOREIGN KEY (customer_employment_id) REFERENCES CUSTOMER_EMPLOYMENT_INFORMATION(customer_employment_id) ON DELETE CASCADE,
    FOREIGN KEY (work_nature_code) REFERENCES WORK_NATURE_TYPE(work_nature_code),
    
    -- Indexes
    INDEX idx_employment_work_nature (customer_employment_id),
    INDEX idx_work_nature_code (work_nature_code)
);

-- Customer Alias
CREATE TABLE CUSTOMER_ALIAS (
    customer_alias_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    cif_number              BIGINT NOT NULL,
    alias_first_name        VARCHAR(50),
    alias_last_name         VARCHAR(50),
    alias_middle_name       VARCHAR(50),
    
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_customer_alias (cif_number)
);

-- =====================================
-- ACCOUNT RELATED TABLES
-- =====================================

-- Account Details
CREATE TABLE ACCOUNT_DETAILS (
    account_number          VARCHAR(20) NOT NULL PRIMARY KEY,
    product_type_code       CHAR(4) NOT NULL,
    account_status          ENUM('Active', 'Inactive', 'Closed', 'Suspended') DEFAULT 'Active',
    account_open_date       DATE NOT NULL DEFAULT (CURDATE()),
    account_close_date      DATE,
    
    FOREIGN KEY (product_type_code) REFERENCES CUSTOMER_PRODUCT_TYPE(product_type_code),
    
    -- Indexes
    INDEX idx_account_status (account_status),
    INDEX idx_account_open_date (account_open_date),
    INDEX idx_product_type (product_type_code)
);

-- Customer Account Relationship
CREATE TABLE CUSTOMER_ACCOUNT (
    customer_account_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    cif_number              BIGINT NOT NULL,
    account_number          VARCHAR(20) NOT NULL,
    relationship_type       VARCHAR(50) DEFAULT 'Primary Holder',
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON DELETE CASCADE,
    FOREIGN KEY (account_number) REFERENCES ACCOUNT_DETAILS(account_number) ON DELETE CASCADE,
    
    -- Unique constraint for primary relationship
    UNIQUE KEY unique_customer_account (cif_number, account_number),
    
    -- Indexes
    INDEX idx_customer_account_cif (cif_number),
    INDEX idx_customer_account_number (account_number)
);

-- =====================================
-- REQUEST/WORKFLOW TABLES
-- =====================================

-- Close Request Table
CREATE TABLE CLOSE_REQUEST (
    close_request_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    cif_number              BIGINT NOT NULL,
    request_date            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    request_reason          TEXT NOT NULL,
    request_status          ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    processed_by            BIGINT,
    processed_date          TIMESTAMP NULL,
    admin_notes             TEXT,
    
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES BANK_EMPLOYEE(employee_id),
    
    -- Indexes
    INDEX idx_close_request_customer (cif_number),
    INDEX idx_close_request_status (request_status),
    INDEX idx_close_request_date (request_date)
);

-- Review Queue for Admin Actions
CREATE TABLE REVIEW_QUEUE (
    review_id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    cif_number              BIGINT,
    request_type            VARCHAR(50) NOT NULL,
    request_timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_status           ENUM('Pending', 'APPROVED', 'REJECTED') DEFAULT 'Pending',
    review_comment          TEXT,
    reviewed_by_employee_id BIGINT,
    review_date             DATE,
    
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by_employee_id) REFERENCES BANK_EMPLOYEE(employee_id),
    
    -- Indexes
    INDEX idx_review_queue_customer (cif_number),
    INDEX idx_review_queue_status (review_status),
    INDEX idx_review_queue_timestamp (request_timestamp),
    INDEX idx_review_queue_type (request_type)
);

-- =====================================
-- ESSENTIAL TRIGGERS (Reduced from 23)
-- =====================================

-- Trigger: Auto-update customer updated_at field
DELIMITER //
CREATE TRIGGER trg_customer_updated_at
BEFORE UPDATE ON CUSTOMER
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger: Validate employment dates
CREATE TRIGGER trg_employment_date_validation
BEFORE INSERT ON CUSTOMER_EMPLOYMENT_INFORMATION
FOR EACH ROW
BEGIN
    IF NEW.employment_end_date IS NOT NULL AND NEW.employment_start_date > NEW.employment_end_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Employment start date cannot be after end date';
    END IF;
END//

-- Trigger: Validate ID expiry dates
CREATE TRIGGER trg_id_date_validation
BEFORE INSERT ON CUSTOMER_ID
FOR EACH ROW
BEGIN
    IF NEW.id_expiry_date IS NOT NULL AND NEW.id_issue_date > NEW.id_expiry_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ID issue date cannot be after expiry date';
    END IF;
END//

DELIMITER ;

-- =====================================
-- PERFORMANCE OPTIMIZATION
-- =====================================

-- Additional composite indexes for common queries
CREATE INDEX idx_customer_status_created ON CUSTOMER(customer_status, created_at);
CREATE INDEX idx_customer_name_status ON CUSTOMER(customer_last_name, customer_first_name, customer_status);
CREATE INDEX idx_account_status_date ON ACCOUNT_DETAILS(account_status, account_open_date);

-- =====================================
-- NOTES FOR FUTURE IMPROVEMENTS
-- =====================================
-- 1. Consider partitioning large tables by date ranges
-- 2. Implement archival strategy for old records
-- 3. Add full-text search indexes for name/address searches
-- 4. Consider read replicas for reporting queries
-- 5. Implement proper backup and recovery procedures
