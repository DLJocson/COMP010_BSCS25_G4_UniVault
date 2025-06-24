-- Multiple Accounts per Customer Seed Data
-- This script adds multiple accounts for existing customers to demonstrate the multi-account feature

USE univault_schema;

-- First, let's add more diverse product types for different account types
INSERT IGNORE INTO CUSTOMER_PRODUCT_TYPE (product_type_code, product_type_name) VALUES
('PT01', 'Savings Account'),
('PT02', 'Checking Account'),
('PT03', 'Time Deposit'),
('PT04', 'Current Account'),
('PT05', 'Joint Account');

-- Clear existing account data to ensure clean state
DELETE FROM CUSTOMER_ACCOUNT WHERE cif_number IN (1111222233, 1111222234, 1111222235, 1111222236, 1111222237);
DELETE FROM ACCOUNT_DETAILS WHERE account_number LIKE '4000%' OR account_number LIKE '4001%' OR account_number LIKE '4002%';

-- Customer 1 (CIF: 1111222233) - Chryshella Grace Bautista - 3 accounts
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_close_date, account_status, biometrics_type_code) VALUES
('PT01', 'Walk-in', 1, 2, '2023-01-15', NULL, 'Active', 'BI01'),        -- Savings Account
('PT02', 'Walk-in', 3, 4, '2023-02-01', NULL, 'Active', 'BI02'),        -- Checking Account
('PT03', 'Walk-in', 1, 3, '2023-03-10', NULL, 'Dormant', 'BI01');       -- Time Deposit (Dormant)

SET @account1 = LAST_INSERT_ID();
SET @account2 = @account1 + 1;
SET @account3 = @account1 + 2;

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES
(1111222233, @account1),
(1111222233, @account2),
(1111222233, @account3);

-- Customer 2 (CIF: 1111222234) - Juan Carlos Santos - 2 accounts
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_close_date, account_status, biometrics_type_code) VALUES
('PT01', 'Walk-in', 2, 3, '2023-01-20', NULL, 'Active', 'BI02'),        -- Savings Account
('PT04', 'Walk-in', 4, 1, '2023-04-15', NULL, 'Suspended', 'BI01');     -- Current Account (Suspended)

SET @account4 = LAST_INSERT_ID();
SET @account5 = @account4 + 1;

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES
(1111222234, @account4),
(1111222234, @account5);

-- Customer 3 (CIF: 1111222235) - Maria Elena Rodriguez - 3 accounts
INSERT INTO ACCOUNT_DETAILS (account_number, product_type_code, account_status, account_open_date, account_close_date) VALUES
('40001111222235001', 'PT02', 'Active', '2023-02-28', NULL),        -- Checking Account
('40001111222235002', 'PT01', 'Active', '2023-03-15', NULL),        -- Savings Account
('40001111222235003', 'PT03', 'Closed', '2023-01-10', '2023-11-30'); -- Time Deposit (Closed)

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, relationship_type) VALUES
(1111222235, '40001111222235001', 'Primary Holder'),
(1111222235, '40001111222235002', 'Primary Holder'),
(1111222235, '40001111222235003', 'Primary Holder');

-- Customer 4 (CIF: 1111222236) - Jose Miguel Dela Cruz - 2 accounts
INSERT INTO ACCOUNT_DETAILS (account_number, product_type_code, account_status, account_open_date, account_close_date) VALUES
('40001111222236001', 'PT01', 'Active', '2023-03-01', NULL),        -- Savings Account
('40001111222236002', 'PT05', 'Inactive', '2023-05-20', NULL);      -- Joint Account (Inactive)

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, relationship_type) VALUES
(1111222236, '40001111222236001', 'Primary Holder'),
(1111222236, '40001111222236002', 'Joint Holder');

-- Customer 5 (CIF: 1111222237) - Ana Beatriz Fernandez - 4 accounts (power user)
INSERT INTO ACCOUNT_DETAILS (account_number, product_type_code, account_status, account_open_date, account_close_date) VALUES
('40001111222237001', 'PT01', 'Active', '2023-01-05', NULL),        -- Savings Account
('40001111222237002', 'PT02', 'Active', '2023-01-12', NULL),        -- Checking Account
('40001111222237003', 'PT03', 'Active', '2023-02-15', NULL),        -- Time Deposit
('40001111222237004', 'PT04', 'Closed', '2023-06-01', '2023-12-15'); -- Current Account (Closed)

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, relationship_type) VALUES
(1111222237, '40001111222237001', 'Primary Holder'),
(1111222237, '40001111222237002', 'Primary Holder'),
(1111222237, '40001111222237003', 'Primary Holder'),
(1111222237, '40001111222237004', 'Primary Holder');

-- Add a few more customers with single accounts to test filtering
-- Customer 6 - Single closed account customer
INSERT INTO CUSTOMER (cif_number, customer_type, customer_last_name, customer_first_name, customer_middle_name, 
                      customer_username, customer_password, birth_date, gender, civil_status_code, 
                      birth_country, citizenship, customer_status) VALUES
(1111222238, 'Individual', 'Martinez', 'Ricardo', 'Santos', 'rmartinez', '$2b$10$hashhere', 
 '1985-07-12', 'Male', 'CS01', 'Philippines', 'Filipino', 'Active');

INSERT INTO ACCOUNT_DETAILS (account_number, product_type_code, account_status, account_open_date, account_close_date) VALUES
('40001111222238001', 'PT01', 'Closed', '2022-12-01', '2023-10-31');

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, relationship_type) VALUES
(1111222238, '40001111222238001', 'Primary Holder');

-- Customer 7 - Multiple accounts, one closed
INSERT INTO CUSTOMER (cif_number, customer_type, customer_last_name, customer_first_name, customer_middle_name, 
                      customer_username, customer_password, birth_date, gender, civil_status_code, 
                      birth_country, citizenship, customer_status) VALUES
(1111222239, 'Individual', 'Garcia', 'Isabella', 'Lopez', 'igarcia', '$2b$10$hashhere', 
 '1992-03-25', 'Female', 'CS02', 'Philippines', 'Filipino', 'Active');

INSERT INTO ACCOUNT_DETAILS (account_number, product_type_code, account_status, account_open_date, account_close_date) VALUES
('40001111222239001', 'PT01', 'Active', '2023-01-15', NULL),
('40001111222239002', 'PT02', 'Closed', '2023-02-01', '2023-11-15'),
('40001111222239003', 'PT03', 'Active', '2023-06-10', NULL);

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, relationship_type) VALUES
(1111222239, '40001111222239001', 'Primary Holder'),
(1111222239, '40001111222239002', 'Primary Holder'),
(1111222239, '40001111222239003', 'Primary Holder');

-- Verification: Display the created accounts
SELECT 
    c.cif_number,
    CONCAT(c.customer_last_name, ', ', c.customer_first_name, ' ', COALESCE(c.customer_middle_name, '')) as customer_name,
    ca.account_number,
    pt.product_type_name as account_type,
    ad.account_status,
    ad.account_open_date,
    ad.account_close_date,
    ca.relationship_type
FROM CUSTOMER c
JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
WHERE c.cif_number IN (1111222233, 1111222234, 1111222235, 1111222236, 1111222237, 1111222238, 1111222239)
ORDER BY c.cif_number, ca.account_number;

-- Summary statistics
SELECT 
    COUNT(DISTINCT c.cif_number) as total_customers,
    COUNT(ca.account_number) as total_accounts,
    AVG(account_count.accounts_per_customer) as avg_accounts_per_customer
FROM CUSTOMER c
JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
JOIN (
    SELECT cif_number, COUNT(*) as accounts_per_customer
    FROM CUSTOMER_ACCOUNT
    WHERE cif_number IN (1111222233, 1111222234, 1111222235, 1111222236, 1111222237, 1111222238, 1111222239)
    GROUP BY cif_number
) account_count ON c.cif_number = account_count.cif_number
WHERE c.cif_number IN (1111222233, 1111222234, 1111222235, 1111222236, 1111222237, 1111222238, 1111222239);
