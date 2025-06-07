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
INSERT INTO FUND_SOURCE_TYPE (fund_source_code, source_description) VALUES
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
INSERT INTO CUSTOMER_PRODUCT_TYPE (product_id, product_type) VALUES
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


INSERT INTO BANK_EMPLOYEE (
  employee_position, employee_last_name, employee_first_name, employee_middle_name, employee_suffix_name,
  employee_username, employee_password
) VALUES
  ('Manager', 'Santos', 'Maria', 'Luz', NULL, 'msantos', 'Manag3r!23'),
  ('Clerk', 'Dela Cruz', 'Juan', 'Miguel', NULL, 'jdelacruz', 'Cl3rkPwd$'),
  ('Teller', 'Reyes', 'Ana', 'Victoria', NULL, 'areyes', 'Pwd4Teller!'),
  ('Officer', 'Garcia', 'Carlos', 'Antonio', NULL, 'cgarcia', 'Off1cerPwd!'),
  ('Teller', 'Lopez', 'Jasmine', 'Diana', NULL, 'jlopez', 'T3ll3rAna!'),
  ('Assistant Manager', 'Fernandez', 'Mark', 'Emmanuel', NULL, 'mfernandez', 'AssistM9!'),
  ('Clerk', 'Torres', 'Lorenzo', 'Paulo', NULL, 'ltorres', 'Cl3rkTor#'),
  ('Officer', 'Navarro', 'Emmanuel', NULL, NULL, 'enavarro', 'OffEmm!2025'),
  ('Teller', 'Mendoza', 'Liza', 'Katrina', NULL, 'lmendoza', 'T3ll3rK!9'),
  ('Teller', 'Cruz', 'Roberto', 'Samuel', NULL, 'rcruz', 'TellerRob@1'),
  ('Manager', 'Castro', 'Andrea', 'Veronica', NULL, 'acastro', 'MngrAndr3@'),
  ('Clerk', 'Villanueva', 'Joseph', 'Nathaniel', NULL, 'jvillanueva', 'ClerkJo$e2'),
  ('Officer', 'Rosales', 'Bea', 'Marian', NULL, 'brosales', 'OffRos!889'),
  ('Teller', 'Gutierrez', 'Paolo', 'Javier', NULL, 'pgutierrez', 'PaoT3ll3r!'),
  ('Assistant Manager', 'Alvarez', 'Cecilia', 'Teresa', NULL, 'calvarez', 'AsstCeci@1'),
  ('Clerk', 'Domingo', 'Nico', 'Ramon', NULL, 'ndomingo', 'DomingoPwd$3'),
  ('Officer', 'Salazar', 'Isabel', 'Gabriela', NULL, 'isalazar', 'IsaOff2025!'),
  ('Teller', 'Rivera', 'Marco', 'Francisco', NULL, 'mrivera', 'TellMarco#9');


INSERT INTO CUSTOMER (
  customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_suffix_name,
  customer_username, customer_password, birth_date, gender, civil_status_code,
  birth_country, residency_status, citizenship, tax_identification_number,
  remittance_country, remittance_purpose
) VALUES
  ('Account Owner', 'Dela Cruz', 'Juan', 'Miguel', NULL, 'jdelacruz', 'P@ssword123', '1985-03-15', 'Male', 'CS01', 'Philippines', 'Resident', 'Philippines', 123456789, NULL, NULL),
  ('Business Owner', 'Reyes', 'Ana', 'Leticia', NULL, 'areyes', 'AnaSecure!1', '1982-06-10', 'Female', 'CS02', 'Philippines', 'Resident', 'Philippines', 987654321, NULL, NULL),
  ('Account Owner', 'Santos', 'Miguel', 'Andres', NULL, 'msantos', 'MigP@ss321', '1990-11-05', 'Male', 'CS03', 'Philippines', 'Resident', 'Philippines', 1122334455, NULL, NULL),
  ('Business Owner', 'Lopez', 'Catherine', 'Rosario', NULL, 'clopez', 'Cath#2024', '1978-08-20', 'Female', 'CS04', 'Philippines', 'Resident', 'Philippines', 6677889900, NULL, NULL),
  ('Account Owner', 'Garcia', 'Paolo', 'Jose', 'Jr.', 'pgarcia', 'P@oloG#pass1', '1995-12-01', 'Male', 'CS05', 'Philippines', 'Resident', 'Philippines', 9988776655, 'USA', 'Family Support');


-- 13. CUSTOMER_ADDRESS
-- ==============================================
INSERT INTO CUSTOMER_ADDRESS (
  cif_number, address_type_code, address_unit, address_building, address_street,
  address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
) VALUES
  (1000000000, 'AD01', 'Unit 3A', 'Camella Residences', 'Roxas Boulevard', NULL, 'Barangay 76', 'Pasay City', 'Metro Manila', 'Philippines', '1300'),
  (1000000001, 'AD01', 'Blk 5 Lot 18', 'Deca Homes', 'P. Del Rosario Street', 'Sudlon', 'Barangay Kalubihan', 'Cebu City', 'Cebu', 'Philippines', '6000'),
  (1000000002, 'AD01', 'Unit 12C', 'Abreeza Residences', 'JP Laurel Avenue', NULL, 'Barangay Bajada', 'Davao City', 'Davao del Sur', 'Philippines', '8000'),
  (1000000003, 'AD01', 'Lot 3', 'Savannah Subdivision', 'Santa Barbara Road', 'Phase 2', 'Barangay Ungka', 'Iloilo City', 'Iloilo', 'Philippines', '5000'),
  (1000000004, 'AD01', 'Tower 1', 'Sunshine Garden Condos', 'Shaw Boulevard', NULL, 'Barangay Wack-Wack', 'Mandaluyong City', 'Metro Manila', 'Philippines', '1550'),
  (1000000000, 'AD03', '8F', 'TechPoint Corporate Tower', 'Ayala Avenue', NULL, 'Barangay San Lorenzo', 'Makati City', 'Metro Manila', 'Philippines', '1226'),
  (1000000001, 'AD03', NULL, 'Cebu Trade Hall', 'Colon Street', NULL, 'Barangay Santo Nio', 'Cebu City', 'Cebu', 'Philippines', '6000'),
  (1000000002, 'AD03', '6B', 'LANDBANK Building', 'CM Recto Avenue', NULL, 'Barangay 27-C', 'Davao City', 'Davao del Sur', 'Philippines', '8000'),
  (1000000004, 'AD03', 'Suite 203', 'Reliance Business Center', 'EDSA', NULL, 'Barangay Highway Hills', 'Mandaluyong City', 'Metro Manila', 'Philippines', '1552'),
  (1000000003, 'AD02', 'Warehouse B', 'Lopez Industrial Complex', 'Coastal Road', NULL, 'Barangay Loboc', 'Lapuz', 'Iloilo', 'Philippines', '5000');


-- 14. CUSTOMER_CONTACT_DETAILS
-- ==============================================
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
 (1000000000, 'CT01', '+639171234567'),
 (1000000000, 'CT02', '(02)8365-1234'),
 (1000000000, 'CT03', '+639175001234'),
 (1000000000, 'CT04', 'juan.delacruz@example.ph'),
 (1000000000, 'CT05', 'juan.d@phtech.com'),
 (1000000000, 'CT06', '+639175001234'),
 (1000000001, 'CT01', '+639181234567'),
 (1000000001, 'CT02', '(032)232-4567'),
 (1000000001, 'CT03', '(032)232-9999'),
 (1000000001, 'CT04', 'ana.reyes@business.ph'),
 (1000000001, 'CT05', 'areyes@reyestrading.ph'),
 (1000000001, 'CT06', 'ana.reyes.ph'),
 (1000000002, 'CT01', '+639191234567'),
 (1000000002, 'CT02', '(082)300-8901'),
 (1000000002, 'CT04', 'miguel.santos@mail.ph'),
 (1000000002, 'CT06', '+639191234567'),
 (1000000003, 'CT01', '+639171234568'),
 (1000000003, 'CT02', '(033)320-4455'),
 (1000000003, 'CT03', '(033)320-0011'),
 (1000000003, 'CT04', 'catherine.lopez@corp.ph'),
 (1000000003, 'CT05', 'clopez@lopezdigital.ph'),
 (1000000003, 'CT06', '+639171234568'),
 (1000000004, 'CT01', '+639181234568'),
 (1000000004, 'CT02', '(02)8334-5808'),
 (1000000004, 'CT03', '(02)8000-5808'), 
 (1000000004, 'CT04', 'paolo.garcia@legacy.ph'),
 (1000000004, 'CT05', 'pgarcia@garciacreative.ph'),
 (1000000004, 'CT06', 'paologarcia@gmail.com');
 
 
-- 15. CUSTOMER_EMPLOYMENT_INFORMATION
-- ==============================================
INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (
 cif_number, employer_business_name, employment_start_date, employment_end_date,
 employment_status, position_code, income_monthly_gross
) VALUES
 (1000000000, 'PH Tech Solutions Inc.', '2012-04-01', NULL, 'Current', 'EP01', 120000.00),
 (1000000001, 'Reyes Trading Corp.', '2005-09-15', NULL, 'Current', 'EP05', 38000.00),
 (1000000002, 'Mindanao AgroWorks', '2018-01-20', NULL, 'Current', 'EP03', 18000.00),
 (1000000003, 'Lopez Digital Services', '2023-01-05', NULL, 'Current', 'EP02', 28000.00);


-- 16. CUSTOMER_FUND_SOURCE
-- ==============================================
INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code) VALUES
 (1000000000, 'FS001'),
 (1000000000, 'FS006'),
 (1000000001, 'FS003'),
 (1000000001, 'FS009'),
 (1000000002, 'FS001'),
 (1000000002, 'FS007'),
 (1000000003, 'FS002'),
 (1000000003, 'FS010'),
 (1000000004, 'FS004'),
 (1000000004, 'FS008');


-- 17. CUSTOMER_WORK_NATURE
-- ==============================================
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES
 (1, 'ICT'),
 (1, 'BAN'),
 (2, 'TRN'),
 (2, 'SVC'),
 (3, 'AGR'),
 (4, 'ICT'),
 (4, 'SVC');


-- 18. CUSTOMER_ALIAS
-- ==============================================
INSERT INTO CUSTOMER_ALIAS (cif_number, alias_last_name, alias_first_name, alias_middle_name, alias_suffix_name) VALUES
 -- Two examples only
 (1000000000, 'Cruz',  'Juanito', NULL, NULL),
 (1000000003, 'Lopez', 'Cat',  'R', NULL);


-- 19. ALIAS_DOCUMENTATION
-- ==============================================
INSERT INTO ALIAS_DOCUMENTATION (
  customer_alias_id, issuing_authority, document_issue_date, document_expiry_date, document_storage, document_code
) VALUES
 (1, 'Philippine Statistics Authority', '2010-05-10', '2030-05-10', 'https://docs.example.ph/alias1_psa.pdf', 'D01'),
 (2, 'Social Security System',     '2008-11-05', '2028-11-05', 'https://docs.example.ph/alias4_sss.pdf', 'D05');


-- 20. CUSTOMER_ID
-- ==============================================
INSERT INTO CUSTOMER_ID (
    cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date
) VALUES
    (1000000000, 'DRV', 'D1234567', 'https://docs.example.com/id/1000000000_DRV.pdf', '2025-03-01', '2035-03-01'),
    (1000000000, 'TIN', '123-456-789', 'https://docs.example.com/id/1000000000_TIN.pdf', '2010-01-01', NULL),
    (1000000001, 'PRC', 'PRC-987654', 'https://docs.example.com/id/1000000001_PRC.pdf', '2012-06-15', '2027-06-15'),
    (1000000001, 'UMD', 'UMID-0001', 'https://docs.example.com/id/1000000001_UMD.pdf', '2018-02-20', NULL),
    (1000000002, 'NPP', 'NP-112233', 'https://docs.example.com/id/1000000002_NPP.pdf', '2016-11-05', '2026-11-05'),
    (1000000002, 'SSS', '34-5678910-1', 'https://docs.example.com/id/1000000002_SSS.pdf', '2013-08-10', NULL),
    (1000000003, 'GSI', 'GSI-778899', 'https://docs.example.com/id/1000000003_GSI.pdf', '2009-09-01', '2029-09-01'),
    (1000000003, 'POS', 'POS-456789', 'https://docs.example.com/id/1000000003_POS.pdf', '2021-04-22', '2031-04-22'),
    (1000000004, 'BRG', 'BRG-990011', 'https://docs.example.com/id/1000000004_BRG.pdf', '2019-01-15', NULL),
    (1000000004, 'PHL', 'PHL-776655', 'https://docs.example.com/id/1000000004_PHL.pdf', '2017-07-07', NULL);


-- 21. ACCOUNT_DETAILS
-- ==============================================
INSERT INTO ACCOUNT_DETAILS (
    account_number, -- ADDED THIS COLUMN
    product_id, referral_type, referral_source,
    verified_by_employee, approved_by_employee,
    account_open_date, account_close_date, account_status, biometrics_type_code
) VALUES
    (100000000005, 'PR01', 'Walk-in', NULL, 5, 1, '2024-06-01', NULL, 'Active', 'BI01'),
    (100000000009, 'PR03', 'Referred', 'Agent B', 3, 4, '2024-06-15', NULL, 'Active', 'BI02'),
    (100000000006, 'PR05', 'Walk-in', NULL, 2, 3, '2024-07-01', NULL, 'Active', 'BI01'),
    (100000000010, 'PR02', 'Referred', 'Agent A', 4, 5, '2024-07-15', NULL, 'Active', 'BI01'),
    (100000000007, 'PR04', 'Walk-in', NULL, 1, 2, '2024-08-01', NULL, 'Active', 'BI02'),
    (100000000008, 'PR02', 'Walk-in', NULL, 3, 1, '2024-08-05', NULL, 'Active', 'BI02'),
    (100000000011, 'PR05', 'Referred', 'Agent C', 2, 5, '2024-08-10', NULL, 'Active', 'BI01'),
    (100000000012, 'PR03', 'Walk-in', NULL, 5, 4, '2024-08-12', NULL, 'Active', 'BI02'),
    (100000000013, 'PR01', 'Referred', 'Agent D', 1, 3, '2024-08-15', NULL, 'Active', 'BI01');


-- 22. CUSTOMER_ACCOUNT
-- ==============================================
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number) VALUES
 (1000000000, 100000000005),
 (1000000000, 100000000009),
 (1000000001, 100000000006),
 (1000000001, 100000000010),
 (1000000002, 100000000007),
 (1000000003, 100000000008),
 (1000000003, 100000000011),
 (1000000003, 100000000012),
 (1000000004, 100000000013);