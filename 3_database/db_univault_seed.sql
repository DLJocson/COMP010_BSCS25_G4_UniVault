USE univault_schema;

-- ////////////////
-- REFERENCE_TABLES
-- ////////////////

-- 1. CIVIL_STATUS_TYPE
-- ==============================================
INSERT INTO CIVIL_STATUS_TYPE (civil_status_code, civil_status_description) VALUES
		('CS01','Single'),
		('CS02','Married'),
		('CS03','Legally Separated'),
		('CS04','Divorced'),
		('CS05','Annulled'),
		('CS06','Widow/er');


-- 2. ADDRESS_TYPE
-- ==============================================
INSERT INTO ADDRESS_TYPE (address_type_code, address_type) VALUES
		('AD01','Home'),
		('AD02','Alternative'),
		('AD03','Work'),
		('AD04','Other');


-- 3. CONTACT_TYPE
-- ==============================================
INSERT INTO CONTACT_TYPE (contact_type_code, contact_type_description) VALUES
		('CT01','Mobile Number'),
		('CT02','Telephone Number'),
		('CT03','Work Number'),
		('CT04','Personal Email'),
		('CT05','Work Email'),
		('CT06','Other');


-- 4. EMPLOYMENT_POSITION
-- ==============================================
INSERT INTO EMPLOYMENT_POSITION (position_code, employment_type, job_title) VALUES
 ('EP01', 'Private/Self-Employed', 'Owner/Director/Officer'),
 ('EP02', 'Private/Self-Employed', 'Non-Officer/Employee'),
 ('EP03', 'Private/Self-Employed', 'Contractual/Part-Time'),
 ('EP04', 'Government Employed', 'Elected/Appointee'),
 ('EP05', 'Government Employed', 'Employee'),
 ('EP06', 'Government Employed', 'Contractual/Part-Time');


-- 5. FUND_SOURCE_TYPE
-- ==============================================
INSERT INTO FUND_SOURCE_TYPE (fund_source_code, fund_source) VALUES
	 ('FS001', 'Employed - Fixed Income'),
	 ('FS002', 'Employed - Variable Income'),
	 ('FS003', 'Self-Employed - Business Income'),
	 ('FS004', 'Remittances'),
	 ('FS005', 'Pension'),
	 ('FS006', 'Personal Savings / Retirement Proceeds'),
	 ('FS007', 'Allowance'),
	 ('FS008', 'Inheritance'),
	 ('FS009', 'Investment/Dividend Income'),
	 ('FS010', 'Rental Income'),
	 ('FS011', 'Sale of Asset / Property'),
	 ('FS012', 'Other Sources (Lottery, Donations, Tax Refunds, and Insurance/Legal Claims)');


-- 6. WORK_NATURE_TYPE
-- ==============================================
INSERT INTO WORK_NATURE_TYPE (work_nature_code, nature_description) VALUES
	 ('ACT', 'Accounting/Auditing/Tax Practice Services'),
	 ('LEG', 'Legal Services'),
	 ('ANE', 'Architecture/Engineering'),
	 ('SVC', 'Other Professional Services / Consultancy/Coaching'),
	 ('PWN', 'Pawnshop'),
	 ('LDG', 'Lending'),
	 ('MSE', 'Money Service Business - Electronic Money Issuer'),
	 ('MSV', 'Money Service Business - Virtual Currency Exchange'),
	 ('MSR', 'Money Service Business - Remittance Transfer Company'),
	 ('MSF', 'Money Service Business - Foreign Exchange Dealer / Money Changer'),
	 ('BAN', 'Banking'),
	 ('INS', 'Insurance'),
	 ('SBD', 'Securities Broker / Dealer'),
	 ('CON', 'Construction and Civil Engineering'),
	 ('REL', 'Real Estate Brokerage and Sales'),
	 ('MED', 'Media'),
	 ('ENT', 'Arts/Entertainment/Recreation'),
	 ('SPO', 'Sports/eSports'),
	 ('GAM', 'Gambling/Casino/eGames'),
	 ('HEA', 'Healthcare (Doctor, Dentist, Nurse, Psychiatrist and others)'),
	 ('SOC', 'Social Work / Non-Government and Non-Profit Organizations'),
	 ('EDU', 'Education/ Online Education'),
	 ('COM', 'Information/Communication/Telecommunication'),
	 ('PUB', 'Publishing/Printing'),
	 ('ADV', 'Advertising/Marketing'),
	 ('ICT', 'Robotics/AI/Cloud/Data Engineering/ Software Development/Cybersecurity'),
	 ('MFG', 'Manufacturing/Packaging'),
	 ('MFF', 'Manufacturing/Trading of Firearms and Ammunition'),
	 ('ART', 'Art / Antiques Dealership'),
	 ('CAR', 'Car/Boat/Plane Dealership'),
	 ('JEW', 'Jewelry / Precious Metals / Precious Stones Dealership'),
	 ('WRT', 'Wholesale / Retail Trade (Distribution & Sales) / E-Commerce / Online Selling'),
	 ('REP', 'Repair Services'),
	 ('TRN', 'Transportation (Land, Sea and Air)'),
	 ('SHI', 'Shipping/Cargo / Storage'),
	 ('SEA', 'Seaman / Seafarer'),
	 ('AGR', 'Agriculture / Fishing'),
	 ('FOR', 'Forestry'),
	 ('MIN', 'Mining/Quarrying'),
	 ('UTL', 'Electric Utilities'),
	 ('OIL', 'Oil/Gasoline'),
	 ('WAT', 'Water Supply/Sewerage/Waste Management'),
	 ('PAD', 'Public Administration / Government'),
	 ('MIL', 'Peace and Order (Military, Police, Fireman, Jail Warden and Others)'),
	 ('AFS', 'Hotel/Accommodation/Restaurant/Food Services'),
	 ('EMB', 'Embassies/Diplomatic Services / Attached Offices'),
	 ('TRA', 'Travel / Travel Agencies'),
	 ('AGY', 'Employment Agency / Human Resources'),
	 ('SEC', 'Security Agency / Services'),
	 ('OTS', 'Other Service Activities (Hairdresser, Manicurist, Masseuse and others)'),
	 ('HOU', 'Private Household / Household Employee / Household Staff'),
	 ('RLG', 'Religious Organization'),
	 ('DFP', 'Designated Non Financial Business And Professions (DNFBP)'),
	 ('OGB', 'Direct OGB/POGO Licensee and Authorized Gaming Agent'),
	 ('OGI', 'Indirect OGB/POGO Allied Service Provider');


-- 7. BIOMETRIC_TYPE
-- ==============================================
INSERT INTO BIOMETRIC_TYPE (biometrics_type_code, biometric_description) VALUES
	('BI01','Face'),
	('BI02','Fingerprint');


-- 8. CUSTOMER_PRODUCT_TYPE
-- ==============================================
INSERT INTO CUSTOMER_PRODUCT_TYPE (product_type_code, product_type_name) VALUES
	('PR01', 'Deposits'),
	('PR02', 'Cards'),
	('PR03', 'Loans'),
	('PR04', 'Wealth Management'),
	('PR05', 'Insurance');


-- 9. ALIAS_DOCUMENTATION_TYPE
-- ==============================================
INSERT INTO ALIAS_DOCUMENTATION_TYPE (document_code, document_description) VALUES
	('D01','Government-Issued ID'),
	('D02','Company- or School-Issued IDs'),
	('D03','Alien or Foreign Identification Documents'),
	('D04','Special Regulatory or Professional IDs'),
	('D05','Other Supporting Documents');


-- 10. ID_TYPE
-- ==============================================
INSERT INTO ID_TYPE (id_type_code, id_description) VALUES
 ('PSY', 'PhilSys ID'),
 ('NPP', 'New Philippine Passport (Signature and photo are on separate pages)'),
 ('OPP', 'Old Philippine Passport (Signature and photo are on the same page)'),
 ('DRV', 'Driver''s License'),
 ('PRC', 'PRC ID'),
 ('UMD', 'UMID'),
 ('SSS', 'SSS ID'),
 ('POS', 'Postal ID'),
 ('TIN', 'TIN ID'),
 ('BRG', 'Barangay Certification / ID'),
 ('GSI', 'GSIS ID'),
 ('PHL', 'PhilHealth ID'),
 ('OWW', 'OWWA ID'),
 ('OFW', 'OFW ID'),
 ('IBP', 'IBP ID'),
 ('COM', 'Company ID'),
 ('MAR', 'MARINA ID'),
 ('VOT', 'Voter''s ID'),
 ('SEN', 'Senior Citizen ID'),
 ('SEA', 'Seaman''s Book'),
 ('GOV', 'Government Office and GOCC ID (e.g., AFP, HDMF)'),
 ('DSW', 'DSWD Certification'),
 ('NCW', 'Certification from the National Council for the Welfare of Disabled Persons (NCWDP)'),
 ('PWD', 'Person with Disability (PWD) ID issued by National Council on Disability Affairs (NCDA)');



-- ////////////////
-- MAIN TABLES
-- ////////////////

INSERT INTO BANK_EMPLOYEE (employee_position, employee_last_name, employee_first_name, employee_username, employee_password) VALUES
('Account Officer', 'Rizal', 'Jose', 'jrizal', '$2a$12$L8Y.A5b2.xP9tN8U7X6e2uSHJ2a7/R/C.b6E3fD4gH5e2uSHJ2a7A.LongerExampleHashValue'),
('Branch Manager', 'Bonifacio', 'Andres', 'abonifacio', '$2a$12$K9Z.B6c3.yQ0uO9V8Y7f3vTGI3b8/S/D.c7F4gH6f3vTGI3b8A.AnotherLongerExampleHash'),
('Compliance Officer', 'Del Pilar', 'Gregorio', 'gdelpilar', '$2a$12$M0A.C7d4.zR1vP0W9Z8g4wUHI4c9/T/E.d8G5hI7g4wUHI4c9A.YetAnotherLongerHashVal'),
('New Accounts Specialist', 'Silang', 'Gabriela', 'gsilang', '$2a$12$N1B.D8e5.aS2wQ1X0A9h5xVI5d0/U/F.e9H6iJ8h5xVI5d0/A.AndFinalLongerHashVal');


-- /////////////////////////////////////////////////////////////////////////////////////////////////
-- ||                             CUSTOMER 1: Juan Dela Cruz (Standard Profile)                     ||
-- /////////////////////////////////////////////////////////////////////////////////////////////////

-- 1. CUSTOMER
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status)
VALUES ('Account Owner', 'Dela Cruz', 'Juan', 'Protacio', 'juandelacruz', '$2a$12$O2C.E9f6.bT3xR2Y1B0i6yWJ6e1/V/G.f0J7jK9i6yWJ6e1/A', '1990-05-15', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123-456-789-000', 'Active');
SET @cif1 = LAST_INSERT_ID();

-- 2. CUSTOMER ADDRESS (Home and Work)
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_unit, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif1, 'AD01', 'Unit 1A', '123 Rizal Ave', 'Barangay 176', 'Caloocan', 'Metro Manila', 'Philippines', '1422'),
(@cif1, 'AD03', '10th Floor, BGC Tower', '5th Avenue', 'Fort Bonifacio', 'Taguig', 'Metro Manila', 'Philippines', '1634');

-- 3. CUSTOMER CONTACT DETAILS
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif1, 'CT01', '+639171234567'),
(@cif1, 'CT02', '+63288876543'),
(@cif1, 'CT04', 'juan.delacruz@email.com'),
(@cif1, 'CT05', 'j.delacruz@workplace.com');

-- 4. CUSTOMER ID
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif1, 'DRV', 'N02-11-111111', '/ids/juan_dela_cruz_drv.jpg', '2022-08-20', '2027-08-20'),
(@cif1, 'UMD', 'CRN-0111-1111111-1', '/ids/juan_dela_cruz_umd.jpg', '2019-01-25', '2029-01-25');

-- 5. CUSTOMER FUND SOURCE
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif1, 'FS001');

-- 6. CUSTOMER EMPLOYMENT INFORMATION & WORK NATURE
INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross)
VALUES (@cif1, 'Tech Solutions Inc.', '2018-03-01', 'EP02', 65000.00);
SET @emp1 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp1, 'ICT');

-- 7. ACCOUNT
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code)
VALUES ('PR01', 'Walk-in', 1, 2, CURDATE(), 'Active', 'BI01');
SET @acc1 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif1, @acc1);


-- /////////////////////////////////////////////////////////////////////////////////////////////////
-- ||                        CUSTOMER 2: Maria Clara Santos (Remittance Profile)                    ||
-- /////////////////////////////////////////////////////////////////////////////////////////////////

-- 1. CUSTOMER (With Remittance Info)
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status, remittance_country, remittance_purpose)
VALUES ('Account Owner', 'Santos', 'Maria Clara', 'maria.santos', '$2a$12$P3D.F0g7.cT4yS3Z2C1j7zXK7f2/W/H.g1K8kL0j7zXK7f2/A', '1985-11-22', 'Female', 'CS06', 'Philippines', 'Resident', 'Filipino', '234-567-890-001', 'Active', 'United States', 'Family Support');
SET @cif2 = LAST_INSERT_ID();

-- 2. CUSTOMER ADDRESS
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif2, 'AD01', '456 Aguinaldo St.', 'Poblacion', 'Cebu City', 'Cebu', 'Philippines', '6000');

-- 3. CUSTOMER CONTACT DETAILS
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif2, 'CT01', '+639182345678'),
(@cif2, 'CT02', '+63322551234'),
(@cif2, 'CT04', 'mc.santos@email.com');

-- 4. CUSTOMER ID
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif2, 'NPP', 'P1234567A', '/ids/maria_santos_npp.jpg', '2023-01-10', '2033-01-09'),
(@cif2, 'SEN', 'SC-54321', '/ids/maria_santos_sen.jpg', '2020-11-22', '2030-11-22');

-- 5. CUSTOMER FUND SOURCE
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif2, 'FS004'),
(@cif2, 'FS005');

-- 6. ACCOUNT
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code)
VALUES ('PR02', 'Walk-in', 3, 2, CURDATE(), 'Active', 'BI02');
SET @acc2 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif2, @acc2);


-- /////////////////////////////////////////////////////////////////////////////////////////////////
-- ||                      CUSTOMER 3: Pedro Penduko (Alias and Self-Employed)                      ||
-- /////////////////////////////////////////////////////////////////////////////////////////////////

-- 1. CUSTOMER
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status)
VALUES ('Business Owner', 'Penduko', 'Pedro', 'Reyes', 'pedro.penduko', '$2a$12$Q4E.G1h8.dT5zT4A3D2k8aYL8g3/X/I.h2L9lM1k8aYL8g3/A', '1982-02-20', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '345-678-901-002', 'Active');
SET @cif3 = LAST_INSERT_ID();

-- 2. CUSTOMER ALIAS & DOCUMENTATION
INSERT INTO CUSTOMER_ALIAS (cif_number, alias_first_name, alias_last_name) VALUES (@cif3, 'Peter', 'Punzalan');
SET @alias1_cif3 = LAST_INSERT_ID();
INSERT INTO ALIAS_DOCUMENTATION (customer_alias_id, issuing_authority, document_issue_date, document_code, document_storage)
VALUES (@alias1_cif3, 'Philippine Statistics Authority', '2021-06-30', 'D05', '/docs/penduko_alias_cert.pdf');

-- 3. CUSTOMER ADDRESS
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif3, 'AD01', '789 Malakas St.', 'Diliman', 'Quezon City', 'Metro Manila', 'Philippines', '1101');

-- 4. CUSTOMER CONTACT DETAILS
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif3, 'CT01', '+639203456789'),
(@cif3, 'CT02', '+63279123456'),
(@cif3, 'CT04', 'pedro.p@email.com');

-- 5. CUSTOMER ID
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif3, 'PSY', '1234-5678-9012-3456', '/ids/penduko_psy.jpg', '2022-04-12', '2032-04-12'), -- Completed expiry date
(@cif3, 'TIN', '345-678-901-002', '/ids/penduko_tin.jpg', '2005-03-15', '2035-03-15');

-- 6. CUSTOMER FUND SOURCE
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif3, 'FS003');

-- 7. CUSTOMER EMPLOYMENT INFORMATION (Self-Employed) & WORK NATURE
INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross)
VALUES (@cif3, 'Penduko''s Sari-Sari Store', '2010-09-01', 'EP01', 80000.00);
SET @emp3 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp3, 'WRT');

-- 8. ACCOUNT
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code)
VALUES ('PR03', 'Walk-in', 4, 2, CURDATE(), 'Active', 'BI01');
SET @acc3 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif3, @acc3);

-- /////////////////////////////////////////////////////////////////////////////////////////////////
-- ||                         CUSTOMER 4: Basilio Dimaguiba (Inactive Account)                      ||
-- /////////////////////////////////////////////////////////////////////////////////////////////////

-- 1. CUSTOMER
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_suffix_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status)
VALUES ('Account Owner', 'Dimaguiba', 'Basilio', 'Salazar', NULL, 'basilio.d', '$2a$12$R5F.H2i9.eU6A5E4F3L9m9Z0h4/Y/J.i3M0nN2l9m9Z0h4/A', '1950-09-01', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '901-234-567-008', 'Dormant'); -- Added TIN, Changed 'Inactive' to 'Dormant'
SET @cif4 = LAST_INSERT_ID();

-- 2. CUSTOMER ADDRESS
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif4, 'AD01', '1 Bonifacio Drive', 'San Roque', 'Marikina', 'Metro Manila', 'Philippines', '1801');

-- 3. CUSTOMER CONTACT DETAILS
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif4, 'CT01', '+639171112233'),
(@cif4, 'CT02', '+63289411234'),
(@cif4, 'CT04', 'basilio.dimaguiba@email.com');

-- 4. CUSTOMER ID
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif4, 'SEN', 'SC-98765', '/ids/dimaguiba_sen.jpg', '2015-09-09', '2025-09-09'),
(@cif4, 'DRV', 'N02-65-987654', '/ids/dimaguiba_drv.jpg', '2018-01-20', '2028-01-20');

-- 5. CUSTOMER FUND SOURCE
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif4, 'FS005');

-- 6. ACCOUNT
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code)
VALUES ('PR04', 'Walk-in', 1, 3, '2020-01-01', 'Dormant', 'BI02'); -- Changed 'Inactive' to 'Dormant'
SET @acc4 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif4, @acc4);


-- /////////////////////////////////////////////////////////////////////////////////////////////////
-- ||                         CUSTOMER 5: Sisa Madrigal (Pending Verification)                      ||
-- /////////////////////////////////////////////////////////////////////////////////////////////////

-- 1. CUSTOMER
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status)
VALUES ('Account Owner', 'Madrigal', 'Sisa', NULL, 'sisa.m', '$2a$12$S6G.I3j0.fV7B6F5G4N0o0A1i5/Z/K.j4O1pP3m0o0A1i5/A', '1978-03-25', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '987-654-321-009', 'Pending Verification'); -- Added TIN
SET @cif5 = LAST_INSERT_ID();

-- 2. CUSTOMER ADDRESS
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif5, 'AD01', '876 Acacia Ave', 'San Isidro', 'Davao City', 'Davao del Sur', 'Philippines', '8000');

-- 3. CUSTOMER CONTACT DETAILS
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif5, 'CT01', '+639987654321'),
(@cif5, 'CT04', 'sisa.m@email.com');

-- 4. CUSTOMER ID
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif5, 'UMD', 'CRN-0555-5555555-5', '/ids/sisa_umd.jpg', '2019-10-05', '2029-10-05'),
(@cif5, 'NPP', 'PH9876543', '/ids/sisa_passport.jpg', '2021-01-15', '2031-01-15'); -- Added a second ID

-- 5. CUSTOMER FUND SOURCE
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif5, 'FS001');

-- 6. ACCOUNT
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code)
VALUES ('PR05', 'Walk-in', 4, 3, CURDATE(), 'Pending Verification', 'BI01');
SET @acc5 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif5, @acc5);

-- /////////////////////////////////////////////////////////////////////////////////////////////////
-- ||                         CUSTOMER 6: Isagani Hizon (Business Owner)                            ||
-- /////////////////////////////////////////////////////////////////////////////////////////////////

-- 1. CUSTOMER
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status)
VALUES ('Business Owner', 'Hizon', 'Isagani', 'isagani.h', '$2a$12$T7H.J4k1.gW8C7G6H5O1p1B2j6/A/L.k5P2qQ4n1p1B2j6/A', '1995-07-10', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '456-789-012-003', 'Active');
SET @cif6 = LAST_INSERT_ID();

-- 2. CUSTOMER ADDRESS
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif6, 'AD01', '321 Bayanihan St.', 'Malate', 'Manila', 'Metro Manila', 'Philippines', '1004');

-- 3. CUSTOMER CONTACT DETAILS
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif6, 'CT01', '+639054321098'),
(@cif6, 'CT04', 'isagani.h@email.com');

-- 4. CUSTOMER ID
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif6, 'PRC', '0012345', '/ids/isagani_prc.jpg', '2017-06-01', '2027-06-01'),
(@cif6, 'UMD', 'CRN-0666-6666666-6', '/ids/isagani_umd.jpg', '2018-06-01', '2028-06-01');

-- 5. CUSTOMER FUND SOURCE
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif6, 'FS003');

-- 6. CUSTOMER EMPLOYMENT INFORMATION & WORK NATURE
INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross)
VALUES (@cif6, 'Hizon Architectural Firm', '2017-08-15', 'EP01', 95000.00);
SET @emp6 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp6, 'ANE');

-- 7. ACCOUNT
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, referral_source, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code) 
VALUES ('PR01', 'Referred', 'Friend Recommendation', 1, 2, CURDATE(), 'Active', 'BI01');
SET @acc6 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif6, @acc6);

-- /////////////////////////////////////////////////////////////////////////////////////////////////
-- ||                         CUSTOMER 7: Don Rafael (High Net Worth)                               ||
-- /////////////////////////////////////////////////////////////////////////////////////////////////

-- 1. CUSTOMER
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status)
VALUES ('Account Owner', 'Ibarra', 'Crisostomo', 'Magsalin', 'crisostomo.i', '$2a$12$U8I.K5l2.hX9D8H7I6P2q2C3k7/B/M.l6Q3rR5o2q2C3k7/B', '1970-01-01', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '567-890-123-004', 'Active');
SET @cif7 = LAST_INSERT_ID();

-- 2. CUSTOMER ADDRESS
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_unit, address_building, address_street, address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif7, 'AD01', 'Penthouse', 'Luxury Residences', 'Ayala Avenue', 'Salcedo Village', 'Bel-Air', 'Makati', 'Metro Manila', 'Philippines', '1226');

-- 3. CUSTOMER CONTACT DETAILS
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif7, 'CT01', '+639170000001'),
(@cif7, 'CT02', '+63288888888'),
(@cif7, 'CT04', 'crisostomo.i@email.com');

-- 4. CUSTOMER ID
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif7, 'NPP', 'P9876543Z', '/ids/crisostomo_npp.jpg', '2020-03-01', '2030-03-01'),
(@cif7, 'UMD', 'CRN-0777-7777777-7', '/ids/crisostomo_umd.jpg', '2018-05-10', '2028-05-10');

-- 5. CUSTOMER FUND SOURCE
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif7, 'FS009'),
(@cif7, 'FS010');

-- 6. CUSTOMER EMPLOYMENT INFORMATION & WORK NATURE (Investor/Landlord)
INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross)
VALUES (@cif7, 'Self-Employed (Investor/Landlord)', '1990-01-01', 'EP01', 500000.00);
SET @emp7 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp7, 'REL');

-- 7. ACCOUNT
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, referral_source, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code)
VALUES ('PR04', 'Referred', 'Private Banker A', 1, 2, CURDATE(), 'Active', 'BI01');
SET @acc7 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif7, @acc7);

-- /////////////////////////////////////////////////////////////////////////////////////////////////
-- ||                         CUSTOMER 8: Capitan Tiago (Business Owner)                            ||
-- /////////////////////////////////////////////////////////////////////////////////////////////////

-- 1. CUSTOMER
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status)
VALUES ('Business Owner', 'De Los Santos', 'Santiago', NULL, 'capitan.t', '$2a$12$V9J.L6m3.iY0E9I8J7Q3r3D4l8/C/N.m7R4sS6p3r3D4l8/C', '1965-12-05', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '678-901-234-005', 'Active');
SET @cif8 = LAST_INSERT_ID();

-- 2. CUSTOMER ADDRESS
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif8, 'AD01', '987 Padre Faura St.', 'Ermita', 'Manila', 'Metro Manila', 'Philippines', '1000');

-- 3. CUSTOMER CONTACT DETAILS
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif8, 'CT01', '+639179998877'),
(@cif8, 'CT02', '+63287654321'),
(@cif8, 'CT04', 'capitan.t@email.com');

-- 4. CUSTOMER ID
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif8, 'NPP', 'PH1234567', '/ids/capitan_passport.jpg', '2019-02-14', '2029-02-14'),
(@cif8, 'TIN', '678-901-234-005', '/ids/capitan_tin.jpg', '2015-03-10', '2035-03-10');

-- 5. CUSTOMER FUND SOURCE
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif8, 'FS003');

-- 6. CUSTOMER EMPLOYMENT INFORMATION & WORK NATURE (Businessman)
INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross)
VALUES (@cif8, 'Various Businesses', '1985-01-01', 'EP01', 300000.00);
SET @emp8 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp8, 'WRT');

-- 7. ACCOUNT
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code)
VALUES ('PR03', 'Walk-in', 3, 4, CURDATE(), 'Active', 'BI02');
SET @acc8 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif8, @acc8);

-- /////////////////////////////////////////////////////////////////////////////////////////////////
-- ||                         CUSTOMER 9: Pilosopo Tasio (Retired)                                ||
-- /////////////////////////////////////////////////////////////////////////////////////////////////

-- 1. CUSTOMER
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status)
VALUES ('Account Owner', 'Tasio', 'Pilosopo', NULL, 'pilosopo.t', '$2a$12$W0K.M7n4.jZ1F0J9K8R4s4E5m9/D/O.n8S5tT7q4s4E5m9/D', '1940-04-10', 'Male', 'CS06', 'Philippines', 'Resident', 'Filipino', '789-012-345-006', 'Inactive'); -- Customer status 'Inactive' is not allowed by the Enum. Changing to 'Dormant'
SET @cif9 = LAST_INSERT_ID();

-- 2. CUSTOMER ADDRESS
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif9, 'AD01', '543 Philosopher''s Lane', 'San Roque', 'San Pablo City', 'Laguna', 'Philippines', '4000');

-- 3. CUSTOMER CONTACT DETAILS
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif9, 'CT02', '+63495678901'),
(@cif9, 'CT04', 'pilosopo.t@email.com');

-- 4. CUSTOMER ID
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif9, 'SEN', 'SC-12345', '/ids/tasio_sen.jpg', '2020-01-01', '2030-01-01'),
(@cif9, 'TIN', '789-012-345-006', '/ids/tasio_tin.jpg', '2010-02-15', '2030-02-15');

-- 5. CUSTOMER FUND SOURCE
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif9, 'FS005'),
(@cif9, 'FS006');

-- 6. ACCOUNT
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code)
VALUES ('PR01', 'Walk-in', 2, 1, '2020-01-01', 'Dormant', 'BI01'); -- Account status 'Inactive' is not allowed by the Enum. Changing to 'Dormant'
SET @acc9 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif9, @acc9);

-- /////////////////////////////////////////////////////////////////////////////////////////////////
-- ||                         CUSTOMER 10: Placido Penitente (Student)                              ||
-- /////////////////////////////////////////////////////////////////////////////////////////////////

-- 1. CUSTOMER
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status)
VALUES ('Account Owner', 'Penitente', 'Placido', NULL, 'placido.p', '$2a$12$X1L.N8o5.kW9G9K0L9S5t5F6n0/E/P.o9T6uU8r5t5F6n0/E', '2000-10-10', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '890-123-456-007', 'Active');
SET @cif10 = LAST_INSERT_ID();

-- 2. CUSTOMER ADDRESS
INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code) VALUES
(@cif10, 'AD01', '123 University Ave', 'UP Campus', 'Quezon City', 'Metro Manila', 'Philippines', '1100');

-- 3. CUSTOMER CONTACT DETAILS
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(@cif10, 'CT01', '+639178765432'),
(@cif10, 'CT04', 'placido.p@email.com');

-- 4. CUSTOMER ID
INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date) VALUES
(@cif10, 'COM', '2020-00123', '/ids/placido_student.jpg', '2025-02-01', '2029-02-01'),
(@cif10, 'PSY', '1234-2222-3333-4444', '/ids/placido_psy.jpg', '2020-10-10', '2030-10-10');

-- 5. CUSTOMER FUND SOURCE
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
(@cif10, 'FS007');

-- 6. ACCOUNT
INSERT INTO ACCOUNT_DETAILS (product_type_code, referral_type, verified_by_employee, approved_by_employee, account_open_date, account_status, biometrics_type_code)
VALUES ('PR01', 'Walk-in', 2, 1, '2020-01-01', 'Dormant', 'BI01'); -- Changed 'Inactive' to 'Dormant'
SET @acc10 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES (@cif10, @acc10);


-- //////////////////////////////

USE univault_schema;

-- Reference Tables
SELECT * FROM CIVIL_STATUS_TYPE;
SELECT * FROM ADDRESS_TYPE;
SELECT * FROM CONTACT_TYPE;
SELECT * FROM EMPLOYMENT_POSITION;
SELECT * FROM FUND_SOURCE_TYPE;
SELECT * FROM WORK_NATURE_TYPE;
SELECT * FROM BIOMETRIC_TYPE;
SELECT * FROM CUSTOMER_PRODUCT_TYPE;
SELECT * FROM ALIAS_DOCUMENTATION_TYPE;
SELECT * FROM ID_TYPE;

USE univault_schema;

-- Main Entity Tables
SELECT * FROM CUSTOMER;
SELECT * FROM CUSTOMER_ADDRESS;
SELECT * FROM CUSTOMER_CONTACT_DETAILS;
SELECT * FROM CUSTOMER_EMPLOYMENT_INFORMATION;
SELECT * FROM CUSTOMER_FUND_SOURCE;
SELECT * FROM CUSTOMER_WORK_NATURE;
SELECT * FROM CUSTOMER_ALIAS;
SELECT * FROM CUSTOMER_ID;
SELECT * FROM ALIAS_DOCUMENTATION;

-- Accounts and Related Tables
SELECT * FROM BANK_EMPLOYEE;
SELECT * FROM ACCOUNT_DETAILS;
SELECT * FROM CUSTOMER_ACCOUNT;

-- Review and Logging
SELECT * FROM REVIEW_QUEUE;



-- //////////////////////////////
USE univault_schema;

-- Temporarily disable foreign key checks to allow truncation of tables
-- without worrying about referential integrity constraints during the process.
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate data from main tables (dependent tables first)
TRUNCATE TABLE REVIEW_QUEUE;
TRUNCATE TABLE CUSTOMER_ACCOUNT;
TRUNCATE TABLE ALIAS_DOCUMENTATION;
TRUNCATE TABLE CUSTOMER_WORK_NATURE;
TRUNCATE TABLE CUSTOMER_FUND_SOURCE;
TRUNCATE TABLE CUSTOMER_ID;
TRUNCATE TABLE CUSTOMER_CONTACT_DETAILS;
TRUNCATE TABLE CUSTOMER_ADDRESS;
TRUNCATE TABLE CUSTOMER_ALIAS;
TRUNCATE TABLE CUSTOMER_EMPLOYMENT_INFORMATION;
TRUNCATE TABLE ACCOUNT_DETAILS;
TRUNCATE TABLE CUSTOMER;
TRUNCATE TABLE BANK_EMPLOYEE;


-- Truncate data from reference tables
TRUNCATE TABLE ID_TYPE;
TRUNCATE TABLE ALIAS_DOCUMENTATION_TYPE;
TRUNCATE TABLE CUSTOMER_PRODUCT_TYPE;
TRUNCATE TABLE BIOMETRIC_TYPE;
TRUNCATE TABLE WORK_NATURE_TYPE;
TRUNCATE TABLE FUND_SOURCE_TYPE;
TRUNCATE TABLE EMPLOYMENT_POSITION;
TRUNCATE TABLE CONTACT_TYPE;
TRUNCATE TABLE ADDRESS_TYPE;
TRUNCATE TABLE CIVIL_STATUS_TYPE;

-- Re-enable foreign key checks to ensure data integrity for subsequent operations
SET FOREIGN_KEY_CHECKS = 1;