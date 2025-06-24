-- Multiple Accounts per Customer Seed Data (Fixed)
-- This script adds multiple accounts for existing customers to demonstrate the multi-account feature

USE univault_schema;

-- First, let's add more diverse product types for different account types
INSERT IGNORE INTO CUSTOMER_PRODUCT_TYPE (product_type_code, product_type_name) VALUES
('PT01', 'Savings Account'),
('PT02', 'Checking Account'),
('PT03', 'Time Deposit'),
('PT04', 'Current Account'),
('PT05', 'Joint Account');

-- Check what existing customers we have
SELECT cif_number, customer_last_name, customer_first_name FROM CUSTOMER LIMIT 5;

-- Create accounts for existing customers
-- Customer 1 - Multiple accounts
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code) VALUES
('PT01', 'Walk-in', 1, 2, '2023-01-15', 'Active', 'BI01'),        -- Savings Account
('PT02', 'Walk-in', 3, 4, '2023-02-01', 'Active', 'BI02'),        -- Checking Account
('PT03', 'Walk-in', 1, 3, '2023-03-10', 'Dormant', 'BI01');       -- Time Deposit (Dormant)

-- Get the generated account numbers and link to first customer
SET @first_cif = (SELECT MIN(cif_number) FROM CUSTOMER LIMIT 1);
SET @account1 = LAST_INSERT_ID();
SET @account2 = @account1 + 1;
SET @account3 = @account1 + 2;

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES
(@first_cif, @account1),
(@first_cif, @account2),
(@first_cif, @account3);

-- Customer 2 - Two accounts
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code) VALUES
('PT01', 'Walk-in', 2, 3, '2023-01-20', 'Active', 'BI02'),        -- Savings Account
('PT04', 'Walk-in', 4, 1, '2023-04-15', 'Suspended', 'BI01');     -- Current Account (Suspended)

SET @second_cif = (SELECT cif_number FROM CUSTOMER WHERE cif_number > @first_cif LIMIT 1);
SET @account4 = LAST_INSERT_ID();
SET @account5 = @account4 + 1;

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES
(@second_cif, @account4),
(@second_cif, @account5);

-- Customer 3 - Three accounts with one closed
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_close_date, account_status, biometrics_type_code) VALUES
('PT02', 'Walk-in', 1, 4, '2023-02-28', NULL, 'Active', 'BI01'),        -- Checking Account
('PT01', 'Walk-in', 2, 1, '2023-03-15', NULL, 'Active', 'BI02'),        -- Savings Account
('PT03', 'Walk-in', 3, 2, '2023-01-10', '2023-11-30', 'Closed', 'BI01'); -- Time Deposit (Closed)

SET @third_cif = (SELECT cif_number FROM CUSTOMER WHERE cif_number > @second_cif LIMIT 1);
SET @account6 = LAST_INSERT_ID();
SET @account7 = @account6 + 1;
SET @account8 = @account6 + 2;

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES
(@third_cif, @account6),
(@third_cif, @account7),
(@third_cif, @account8);

-- Customer 4 - Single closed account (for testing closed accounts page)
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_close_date, account_status, biometrics_type_code) VALUES
('PT01', 'Walk-in', 4, 3, '2022-12-01', '2023-10-31', 'Closed', 'BI02');

SET @fourth_cif = (SELECT cif_number FROM CUSTOMER WHERE cif_number > @third_cif LIMIT 1);
SET @account9 = LAST_INSERT_ID();

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES
(@fourth_cif, @account9);

-- Verification: Display the created accounts
SELECT 
    c.cif_number,
    CONCAT(c.customer_last_name, ', ', c.customer_first_name, ' ', COALESCE(c.customer_middle_name, '')) as customer_name,
    ca.account_number,
    pt.product_type_name as account_type,
    ad.account_status,
    ad.account_open_date,
    ad.account_close_date
FROM CUSTOMER c
JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
ORDER BY c.cif_number, ca.account_number;

-- Summary statistics
SELECT 
    'Multi-Account Statistics' as info,
    COUNT(DISTINCT c.cif_number) as customers_with_accounts,
    COUNT(ca.account_number) as total_accounts,
    ROUND(AVG(account_count.accounts_per_customer), 2) as avg_accounts_per_customer
FROM CUSTOMER c
JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
JOIN (
    SELECT cif_number, COUNT(*) as accounts_per_customer
    FROM CUSTOMER_ACCOUNT
    GROUP BY cif_number
) account_count ON c.cif_number = account_count.cif_number;
