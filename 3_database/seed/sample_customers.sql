-- UniVault Sample Customer Data
-- 🎭 This creates realistic test customers with complete profiles
-- Run this AFTER reference_data.sql

USE univault_schema;

-- =====================================
-- SAMPLE BANK EMPLOYEES
-- =====================================

INSERT INTO BANK_EMPLOYEE (employee_position, employee_last_name, employee_first_name, employee_username, employee_password, employee_email) VALUES
('Account Officer', 'Rizal', 'Jose', 'jrizal', '$2a$12$L8Y.A5b2.xP9tN8U7X6e2uSHJ2a7/R/C.b6E3fD4gH5e2uSHJ2a7A.LongerExampleHashValue', 'jose.rizal@univault.com'),
('Branch Manager', 'Bonifacio', 'Andres', 'abonifacio', '$2a$12$K9Z.B6c3.yQ0uO9V8Y7f3vTGI3b8/S/D.c7F4gH6f3vTGI3b8A.AnotherLongerExampleHash', 'andres.bonifacio@univault.com'),
('Compliance Officer', 'Del Pilar', 'Gregorio', 'gdelpilar', '$2a$12$M0A.C7d4.zR1vP0W9Z8g4wUHI4c9/T/E.d8G5hI7g4wUHI4c9A.YetAnotherLongerHashVal', 'gregorio.delpilar@univault.com'),
('New Accounts Specialist', 'Silang', 'Gabriela', 'gsilang', '$2a$12$N1B.D8e5.aS2wQ1X0A9h5xVI5d0/U/F.e9H6iJ8h5xVI5d0/A.AndFinalLongerHashVal', 'gabriela.silang@univault.com');

-- =====================================
-- CUSTOMER 1: Juan Dela Cruz (Standard Profile)
-- =====================================

-- 1. Customer Record
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, citizenship, customer_status)
VALUES ('Account Owner', 'Dela Cruz', 'Juan', 'Protacio', 'juandelacruz', '$2a$12$O2C.E9f6.bT3xR2Y1B0i6yWJ6e1/V/G.f0J7jK9i6yWJ6e1/A', '1990-05-15', 'Male', 'CS02', 'Philippines', 'Filipino', 'Active');
SET @cif1 = LAST_INSERT_ID();

-- 2. Address
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_unit, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif1, 'AD01', 'Unit 1A', '123 Rizal Ave', 'Barangay 176', 'Caloocan', 'Metro Manila', 'Philippines', '1422'),
(@cif1, 'AD03', '10th Floor, BGC Tower', '5th Avenue', 'Fort Bonifacio', 'Taguig', 'Metro Manila', 'Philippines', '1634');

-- 3. Contact Details
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif1, 'CT01', '+639171234567'),
(@cif1, 'CT02', '+63288876543'),
(@cif1, 'CT04', 'juan.delacruz@email.com'),
(@cif1, 'CT05', 'j.delacruz@workplace.com');

-- 4. ID Documents
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif1, 'ID04', 'N02-11-111111', '/ids/juan_dela_cruz_drv.jpg', '2022-08-20', '2027-08-20'),
(@cif1, 'ID06', 'CRN-0111-1111111-1', '/ids/juan_dela_cruz_umd.jpg', '2019-01-25', '2029-01-25');

-- 5. Fund Source
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif1, 'FS001');

-- 6. Employment Information & Work Nature
INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross)
VALUES (@cif1, 'Tech Solutions Inc.', '2018-03-01', 'EP02', 65000.00);
SET @emp1 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp1, 'ICT');

-- 7. Account
INSERT INTO ACCOUNT_DETAILS (account_number, product_type_code, account_status, account_open_date) VALUES
(CONCAT('4000', LPAD(@cif1, 10, '0'), '001'), 'PT01', 'Active', CURDATE());
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif1, CONCAT('4000', LPAD(@cif1, 10, '0'), '001'));

-- =====================================
-- CUSTOMER 2: Maria Clara Santos (Remittance Profile)
-- =====================================

-- 1. Customer (With Remittance Info)
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, citizenship, customer_status, remittance_country, remittance_purpose)
VALUES ('Account Owner', 'Santos', 'Maria Clara', 'maria.santos', '$2a$12$P3D.F0g7.cT4yS3Z2C1j7zXK7f2/W/H.g1K8kL0j7zXK7f2/A', '1985-11-22', 'Female', 'CS06', 'Philippines', 'Filipino', 'Active', 'United States', 'Family Support');
SET @cif2 = LAST_INSERT_ID();

-- 2. Address
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif2, 'AD01', '456 Aguinaldo St.', 'Poblacion', 'Cebu City', 'Cebu', 'Philippines', '6000');

-- 3. Contact Details
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif2, 'CT01', '+639182345678'),
(@cif2, 'CT02', '+63322551234'),
(@cif2, 'CT04', 'mc.santos@email.com');

-- 4. ID Documents
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif2, 'ID02', 'P1234567A', '/ids/maria_santos_npp.jpg', '2023-01-10', '2033-01-09'),
(@cif2, 'ID19', 'SC-54321', '/ids/maria_santos_sen.jpg', '2020-11-22', '2030-11-22');

-- 5. Fund Source
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif2, 'FS004'),
(@cif2, 'FS005');

-- 6. Account
INSERT INTO ACCOUNT_DETAILS (account_number, product_type_code, account_status, account_open_date) VALUES
(CONCAT('4000', LPAD(@cif2, 10, '0'), '001'), 'PT02', 'Active', CURDATE());
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif2, CONCAT('4000', LPAD(@cif2, 10, '0'), '001'));

-- =====================================
-- CUSTOMER 3: Pedro Penduko (Business Owner with Alias)
-- =====================================

-- 1. Customer
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, citizenship, customer_status)
VALUES ('Business Owner', 'Penduko', 'Pedro', 'Reyes', 'pedro.penduko', '$2a$12$Q4E.G1h8.dT5zT4A3D2k8aYL8g3/X/I.h2L9lM1k8aYL8g3/A', '1982-02-20', 'Male', 'CS01', 'Philippines', 'Filipino', 'Active');
SET @cif3 = LAST_INSERT_ID();

-- 2. Customer Alias
INSERT INTO CUSTOMER_ALIAS (cif_number, alias_first_name, alias_last_name) VALUES (@cif3, 'Peter', 'Punzalan');

-- 3. Address
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif3, 'AD01', '789 Malakas St.', 'Diliman', 'Quezon City', 'Metro Manila', 'Philippines', '1101');

-- 4. Contact Details
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif3, 'CT01', '+639203456789'),
(@cif3, 'CT02', '+63279123456'),
(@cif3, 'CT04', 'pedro.p@email.com');

-- 5. ID Documents
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif3, 'ID01', '1234-5678-9012-3456', '/ids/penduko_psy.jpg', '2022-04-12', '2032-04-12'),
(@cif3, 'ID09', '345-678-901-002', '/ids/penduko_tin.jpg', '2005-03-15', '2035-03-15');

-- 6. Fund Source
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif3, 'FS003');

-- 7. Employment Information & Work Nature
INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross)
VALUES (@cif3, 'Penduko\'s Sari-Sari Store', '2010-09-01', 'EP01', 80000.00);
SET @emp3 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp3, 'WRT');

-- 8. Account
INSERT INTO ACCOUNT_DETAILS (account_number, product_type_code, account_status, account_open_date) VALUES
(CONCAT('4000', LPAD(@cif3, 10, '0'), '001'), 'PT03', 'Active', CURDATE());
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif3, CONCAT('4000', LPAD(@cif3, 10, '0'), '001'));

-- =====================================
-- CUSTOMER 4: Sisa Madrigal (Pending Verification)
-- =====================================

-- 1. Customer
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, citizenship, customer_status)
VALUES ('Account Owner', 'Madrigal', 'Sisa', 'sisa.m', '$2a$12$S6G.I3j0.fV7B6F5G4N0o0A1i5/Z/K.j4O1pP3m0o0A1i5/A', '1978-03-25', 'Female', 'CS01', 'Philippines', 'Filipino', 'Pending Verification');
SET @cif4 = LAST_INSERT_ID();

-- 2. Address
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif4, 'AD01', '876 Acacia Ave', 'San Isidro', 'Davao City', 'Davao del Sur', 'Philippines', '8000');

-- 3. Contact Details
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif4, 'CT01', '+639987654321'),
(@cif4, 'CT04', 'sisa.m@email.com');

-- 4. ID Documents
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif4, 'ID06', 'CRN-0555-5555555-5', '/ids/sisa_umd.jpg', '2019-10-05', '2029-10-05'),
(@cif4, 'ID02', 'PH9876543', '/ids/sisa_passport.jpg', '2021-01-15', '2031-01-15');

-- 5. Fund Source
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif4, 'FS001');

-- 6. Account (added for close request functionality)
INSERT INTO ACCOUNT_DETAILS (account_number, product_type_code, account_status, account_open_date) VALUES
(CONCAT('4000', LPAD(@cif4, 10, '0'), '001'), 'PT01', 'Active', '2024-01-15');
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif4, CONCAT('4000', LPAD(@cif4, 10, '0'), '001'));

-- =====================================
-- CUSTOMER 5: Multiple Accounts Example
-- =====================================

-- 1. Customer
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, citizenship, customer_status)
VALUES ('Business Owner', 'Hizon', 'Isagani', 'isagani.h', '$2a$12$T7H.J4k1.gW8C7G6H5O1p1B2j6/A/L.k5P2qQ4n1p1B2j6/A', '1995-07-10', 'Male', 'CS01', 'Philippines', 'Filipino', 'Active');
SET @cif5 = LAST_INSERT_ID();

-- 2. Address
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif5, 'AD01', '321 Bayanihan St.', 'Malate', 'Manila', 'Metro Manila', 'Philippines', '1004');

-- 3. Contact Details
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif5, 'CT01', '+639054321098'),
(@cif5, 'CT04', 'isagani.h@email.com');

-- 4. ID Documents
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif5, 'ID05', '0012345', '/ids/isagani_prc.jpg', '2017-06-01', '2027-06-01'),
(@cif5, 'ID06', 'CRN-0666-6666666-6', '/ids/isagani_umd.jpg', '2018-06-01', '2028-06-01');

-- 5. Fund Source
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif5, 'FS003');

-- 6. Employment Information & Work Nature
INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross)
VALUES (@cif5, 'Hizon Architectural Firm', '2017-08-15', 'EP01', 95000.00);
SET @emp5 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp5, 'ANE');

-- 7. Multiple Accounts
INSERT INTO ACCOUNT_DETAILS (account_number, product_type_code, account_status, account_open_date) VALUES
(CONCAT('4000', LPAD(@cif5, 10, '0'), '001'), 'PT01', 'Active', CURDATE()),         -- Savings
(CONCAT('4000', LPAD(@cif5, 10, '0'), '002'), 'PT02', 'Active', CURDATE()),         -- Checking
(CONCAT('4000', LPAD(@cif5, 10, '0'), '003'), 'PT04', 'Active', CURDATE());         -- Current

INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES 
(@cif5, CONCAT('4000', LPAD(@cif5, 10, '0'), '001')),
(@cif5, CONCAT('4000', LPAD(@cif5, 10, '0'), '002')),
(@cif5, CONCAT('4000', LPAD(@cif5, 10, '0'), '003'));

-- =====================================
-- SAMPLE CLOSE REQUESTS
-- =====================================

INSERT INTO CLOSE_REQUEST (cif_number, request_reason, request_status, request_date) VALUES
(@cif2, 'Moving to different country, no longer need local account', 'Pending', '2024-06-20 10:30:00'),
(@cif4, 'Found better banking alternatives with higher interest rates', 'Pending', '2024-06-22 14:15:00');

-- =====================================
-- SAMPLE REVIEW QUEUE ENTRIES
-- =====================================

INSERT INTO REVIEW_QUEUE (cif_number, request_type, request_timestamp, review_status) VALUES
(@cif4, 'Account Verification', '2024-06-20 09:30:00', 'Pending'),
(@cif2, 'Account Closure', '2024-06-20 10:30:00', 'Pending'),
(@cif1, 'Profile Update', '2024-06-19 16:45:00', 'APPROVED');

-- =====================================
-- VERIFICATION SUMMARY
-- =====================================

SELECT 
    '📊 SAMPLE DATA SUMMARY' as info,
    (SELECT COUNT(*) FROM CUSTOMER) as total_customers,
    (SELECT COUNT(*) FROM ACCOUNT_DETAILS) as total_accounts,
    (SELECT COUNT(*) FROM CLOSE_REQUEST) as close_requests,
    (SELECT COUNT(*) FROM REVIEW_QUEUE) as review_queue_items;

SELECT 
    customer_status,
    COUNT(*) as count
FROM CUSTOMER 
GROUP BY customer_status
ORDER BY customer_status;

SELECT '✅ Sample customer data created successfully!' as status;
