-- Migration: Initial UniVault Schema
-- Version: 1.0.0
-- Date: 2024-01-01

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS univault_schema;
USE univault_schema;

-- Migration tracking table
CREATE TABLE IF NOT EXISTS migration_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT TRUE
);

-- Insert migration record
INSERT INTO migration_history (version, description) 
VALUES ('1.0.0', 'Initial schema creation');

-- Load the main schema
SOURCE db_univault_schema.sql;

-- Insert initial seed data
INSERT IGNORE INTO civil_status_type (civil_status_code, civil_status_description) VALUES
('CS01', 'Single'),
('CS02', 'Married'),
('CS03', 'Divorced'),
('CS04', 'Widowed'),
('CS05', 'Separated');

INSERT IGNORE INTO address_type (address_type_code, address_type) VALUES
('AD01', 'Residential'),
('AD02', 'Business'),
('AD03', 'Mailing'),
('AD04', 'Temporary');

INSERT IGNORE INTO contact_type (contact_type_code, contact_type_description) VALUES
('CT01', 'Mobile Phone'),
('CT02', 'Home Phone'),
('CT03', 'Work Phone'),
('CT04', 'Email');

INSERT IGNORE INTO employment_position (position_code, employment_type, job_title) VALUES
('EP01', 'Full-time', 'Manager'),
('EP02', 'Full-time', 'Supervisor'),
('EP03', 'Full-time', 'Employee'),
('EP04', 'Part-time', 'Consultant'),
('EP05', 'Self-employed', 'Business Owner');

INSERT IGNORE INTO work_nature_type (work_nature_code, nature_description) VALUES
('GOV', 'Government Employee'),
('PRI', 'Private Employee'),
('BUS', 'Business Owner'),
('PRO', 'Professional/Self-employed'),
('RET', 'Retired');

INSERT IGNORE INTO fund_source_type (fund_source_code, fund_source) VALUES
('FS001', 'Salary/Employment Income'),
('FS002', 'Business Income'),
('FS003', 'Investment Income'),
('FS004', 'Inheritance'),
('FS005', 'Savings'),
('FS006', 'Remittance');

-- Mark migration as successful
UPDATE migration_history 
SET success = TRUE 
WHERE version = '1.0.0';
