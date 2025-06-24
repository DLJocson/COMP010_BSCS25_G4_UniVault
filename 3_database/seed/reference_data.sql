-- UniVault Reference Data Population
-- 📋 This file populates all lookup/reference tables with standard values
-- Run this AFTER creating the database schema

USE univault_schema;

-- =====================================
-- REFERENCE DATA POPULATION
-- =====================================

-- 1. CIVIL_STATUS_TYPE
INSERT INTO CIVIL_STATUS_TYPE (civil_status_code, civil_status_description) VALUES
    ('CS01','Single'),
    ('CS02','Married'),
    ('CS03','Legally Separated'),
    ('CS04','Divorced'),
    ('CS05','Annulled'),
    ('CS06','Widow/er');

-- 2. ADDRESS_TYPE
INSERT INTO ADDRESS_TYPE (address_type_code, address_type) VALUES
    ('AD01','Home'),
    ('AD02','Alternative'),
    ('AD03','Work'),
    ('AD04','Other');

-- 3. CONTACT_TYPE
INSERT INTO CONTACT_TYPE (contact_type_code, contact_type_description) VALUES
    ('CT01','Mobile Number'),
    ('CT02','Telephone Number'),
    ('CT03','Work Number'),
    ('CT04','Personal Email'),
    ('CT05','Work Email'),
    ('CT06','Other');

-- 4. EMPLOYMENT_POSITION
INSERT INTO EMPLOYMENT_POSITION (position_code, employment_type, job_title) VALUES
    ('EP01', 'Private/Self-Employed', 'Owner/Director/Officer'),
    ('EP02', 'Private/Self-Employed', 'Non-Officer/Employee'),
    ('EP03', 'Private/Self-Employed', 'Contractual/Part-Time'),
    ('EP04', 'Government Employed', 'Elected/Appointee'),
    ('EP05', 'Government Employed', 'Employee'),
    ('EP06', 'Government Employed', 'Contractual/Part-Time');

-- 5. FUND_SOURCE_TYPE
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

-- 7. ID_TYPE
INSERT INTO ID_TYPE (id_type_code, id_description) VALUES
    ('ID01', 'PhilSys ID'),
    ('ID02', 'New Philippine Passport'),
    ('ID03', 'Old Philippine Passport'),
    ('ID04', 'Driver\'s License'),
    ('ID05', 'PRC ID'),
    ('ID06', 'UMID'),
    ('ID07', 'SSS ID'),
    ('ID08', 'Postal ID'),
    ('ID09', 'TIN ID'),
    ('ID10', 'Barangay Certification / ID'),
    ('ID11', 'GSIS ID'),
    ('ID12', 'PhilHealth ID'),
    ('ID13', 'OWWA ID'),
    ('ID14', 'OFW ID'),
    ('ID15', 'IBP ID'),
    ('ID16', 'Company ID'),
    ('ID17', 'MARINA ID'),
    ('ID18', 'Voter\'s ID'),
    ('ID19', 'Senior Citizen ID'),
    ('ID20', 'Seaman\'s Book'),
    ('ID21', 'Government Office and GOCC ID'),
    ('ID22', 'DSWD Certification'),
    ('ID23', 'NCWDP Certification'),
    ('ID24', 'PWD ID');

-- 8. CUSTOMER_PRODUCT_TYPE
INSERT INTO CUSTOMER_PRODUCT_TYPE (product_type_code, product_type_name, product_description) VALUES
    ('PT01', 'Savings Account', 'Standard savings account with interest'),
    ('PT02', 'Checking Account', 'Current account with check writing privileges'),
    ('PT03', 'Time Deposit', 'Fixed-term deposit with higher interest rates'),
    ('PT04', 'Current Account', 'Business current account for daily transactions'),
    ('PT05', 'Joint Account', 'Shared account for multiple holders');

-- =====================================
-- VERIFICATION QUERIES
-- =====================================

-- Verify reference data was inserted successfully
SELECT 'Civil Status Types' as table_name, COUNT(*) as record_count FROM CIVIL_STATUS_TYPE
UNION ALL
SELECT 'Address Types', COUNT(*) FROM ADDRESS_TYPE
UNION ALL
SELECT 'Contact Types', COUNT(*) FROM CONTACT_TYPE
UNION ALL
SELECT 'Employment Positions', COUNT(*) FROM EMPLOYMENT_POSITION
UNION ALL
SELECT 'Fund Source Types', COUNT(*) FROM FUND_SOURCE_TYPE
UNION ALL
SELECT 'Work Nature Types', COUNT(*) FROM WORK_NATURE_TYPE
UNION ALL
SELECT 'ID Types', COUNT(*) FROM ID_TYPE
UNION ALL
SELECT 'Product Types', COUNT(*) FROM CUSTOMER_PRODUCT_TYPE;

SELECT '✅ Reference data populated successfully!' as status;
