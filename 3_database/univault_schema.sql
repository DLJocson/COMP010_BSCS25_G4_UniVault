CREATE DATABASE IF NOT EXISTS univault_schema;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
USE univault_schema;


-- ////////////////
-- REFERENCE_TABLES
-- ////////////////


-- 1. CIVIL_STATUS_TYPE
-- =====================
CREATE TABLE CIVIL_STATUS_TYPE (
	civil_status_code			CHAR(4) NOT NULL,
    civil_status_description	VARCHAR(50) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (civil_status_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_civil_status_code 			CHECK (civil_status_code REGEXP '^CS[0-9]{2}$'),
    CONSTRAINT check_civil_status_description 	CHECK (civil_status_description REGEXP '^[A-Za-z ]+$')
	);


-- 2. ADDRESS_TYPE
-- ================
CREATE TABLE ADDRESS_TYPE (
    address_type_code 	CHAR(4) NOT NULL,
    address_type 		VARCHAR(20) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (address_type_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_address_type_code 		CHECK (address_type_code REGEXP '^AD[0-9]{2}$'),
    CONSTRAINT check_address_type			CHECK (address_type REGEXP '^[A-Za-z ]+$')
	);


-- 3. CONTACT_TYPE
-- ================
CREATE TABLE CONTACT_TYPE (
    contact_type_code 			CHAR(4) NOT NULL,
    contact_type_description 	VARCHAR(20) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (contact_type_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_contact_type_code 				CHECK (contact_type_code REGEXP '^CT[0-9]{2}$'),
    CONSTRAINT check_contact_type_description 		CHECK (contact_type_description REGEXP '^[A-Za-z ]+$')
	);


-- 4. EMPLOYMENT_POSITION
-- ========================
CREATE TABLE EMPLOYMENT_POSITION (
    position_code 		CHAR(4) NOT NULL,
    employment_type 	VARCHAR(50) NOT NULL,
    job_title 			VARCHAR(50) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (position_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_position_code 		CHECK (position_code REGEXP '^EP[0-9]{2}$'),
    CONSTRAINT check_employment_type 	CHECK (employment_type REGEXP '^[A-Za-z /]+$'),
    CONSTRAINT check_job_title 			CHECK (job_title REGEXP '^[A-Za-z /]+$')
	);


-- 5. FUND_SOURCE_TYPE
-- ===================
CREATE TABLE FUND_SOURCE_TYPE (
    fund_source_code 		CHAR(5) NOT NULL,
    source_description 		VARCHAR(100) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (fund_source_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_fund_source_code 		CHECK (fund_source_code REGEXP '^FS[0-9]{3}$'),
    CONSTRAINT chk_source_desccription 		CHECK (source_description REGEXP '^[A-Za-z0-9 /(),\\-]+$')
	);


-- 6. WORK_NATURE_TYPE
-- ===================
CREATE TABLE WORK_NATURE_TYPE (
    work_nature_code 		CHAR(5) NOT NULL,
    nature_description 		VARCHAR(150) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (work_nature_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_work_nature_code		CHECK (work_nature_code REGEXP '^WN[A-Za-z0-9]{3}$'),
    CONSTRAINT check_nature_description		CHECK (nature_description REGEXP '^[A-Za-z /-]+$')
	);


-- 7. BIOMETRIC_TYPE
-- =================
CREATE TABLE BIOMETRIC_TYPE (
    biometrics_type_code 	CHAR(4) NOT NULL,
    biometric_description 	VARCHAR(50) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (biometrics_type_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_biometrics_type_code 		CHECK (biometrics_type_code REGEXP '^BI[0-9]{2}$'),
    CONSTRAINT check_biometrics_description		CHECK (biometric_description REGEXP '^[A-Za-z ]+$')
	);


-- 8. CUSTOMER_PRODUCT_TYPE
-- ========================
CREATE TABLE CUSTOMER_PRODUCT_TYPE (
    product_id 		CHAR(4) NOT NULL,
    product_type 	VARCHAR(30) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (product_id),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_product_id 		CHECK (product_id REGEXP '^PT[0-9]{2}$'),
    CONSTRAINT check_product_type 		CHECK (product_type REGEXP '^[A-Za-z ]+$')
	);


-- 9. ALIAS_DOCUMENTATION_TYPE
-- ===========================
CREATE TABLE ALIAS_DOCUMENTATION_TYPE (
    document_code 			CHAR(6) NOT NULL,
    document_description 	VARCHAR(100) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (document_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_document_code 			CHECK (document_code REGEXP '^DO[0-9]{4}$'),
    CONSTRAINT check_document_description	CHECK (document_description REGEXP '^[A-Za-z ]+$')
	);


-- 10. ID_TYPE
-- ===========
CREATE TABLE ID_TYPE (
    id_type_code 		CHAR(3) NOT NULL,
    id_description 		VARCHAR(255) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (id_type_code),
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_id_type_code 		CHECK (id_type_code REGEXP '^[A-Z]{3}$'),
    CONSTRAINT check_id_description 	CHECK (id_description REGEXP '^[A-Za-z0-9 /\']+$')
	);



-- ////////////////
-- 	  MAIN_TABLES
-- ////////////////


-- 11. CUSTOMER
-- =============
CREATE TABLE CUSTOMER (
	cif_number 					BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	customer_type 				VARCHAR(25) NOT NULL,
	customer_last_name 			CHAR(255) NOT NULL,
	customer_first_name 		CHAR(255) NOT NULL,
	customer_middle_name 		CHAR(255),
	customer_suffix_name 		CHAR(255),
	customer_username 			VARCHAR(50) NOT NULL UNIQUE,
	customer_password 			VARCHAR(255) NOT NULL,
	birth_date 					DATE NOT NULL,
	gender 						VARCHAR(25) NOT NULL,
	civil_status_code 			CHAR(4) NOT NULL,
	birth_country 				VARCHAR(25) NOT NULL,
	residency_status 			VARCHAR(25) NOT NULL,
	citizenship 				VARCHAR(25) NOT NULL,
	tax_identification_number 	INTEGER UNSIGNED NOT NULL,
	customer_status 			VARCHAR(20) NOT NULL DEFAULT 'Active',
	remittance_country 			VARCHAR(25),
	remittance_purpose 			VARCHAR(255),
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number),
    FOREIGN KEY (civil_status_code) REFERENCES CIVIL_STATUS_TYPE(civil_status_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_customer_type 				CHECK (customer_type IN ('Account Owner', 'Business Owner')),
    CONSTRAINT check_customer_last_name 		CHECK (customer_last_name REGEXP '^[A-Za-z \\-]+$'),
    CONSTRAINT check_customer_first_name 		CHECK (customer_first_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_customer_middle_name 		CHECK (customer_middle_name IS NULL OR customer_middle_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_customer_suffix_name 		CHECK (customer_suffix_name IS NULL OR customer_suffix_name REGEXP '^[A-Za-z\\.]+$'),
    CONSTRAINT check_customer_username 			CHECK (customer_username REGEXP '^[A-Za-z0-9]+$'),
    CONSTRAINT check_customer_password 			CHECK (customer_password REGEXP '^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$'),
    CONSTRAINT check_gender 					CHECK (gender IN ('Male', 'Female', 'Non-Binary/Third Gender', 'Prefer not to say', 'Other')),
    CONSTRAINT check_birth_country				CHECK (birth_country REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_residency_status			CHECK (residency_status IN ('Resident', 'Non-Resident')),
    CONSTRAINT check_citizenship				CHECK (citizenship REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_customer_tin				CHECK (tax_identification_number >= 100000000 AND tax_identification_number <= 999999999999),
    CONSTRAINT check_customer_status			CHECK (customer_status IN ('Active', 'Inactive', 'Suspended')),
    CONSTRAINT check_remittance_country			CHECK (remittance_country REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_remittance_purpose			CHECK (remittance_purpose REGEXP '^[A-Za-z0-9 ,.!]+$'),
    CONSTRAINT check_remittance_conditional		CHECK (remittance_country IS NOT NULL AND remittance_purpose IS NOT NULL OR remittance_country IS NULL AND remittance_purpose IS NULL)
	) AUTO_INCREMENT = 1000000000;


DELIMITER $$
CREATE TRIGGER enforce_cif_length BEFORE INSERT ON CUSTOMER
FOR EACH ROW
BEGIN
    IF NEW.cif_number < 1000000000 OR NEW.cif_number > 9999999999 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'cif_number exceeds allowed length';
    END IF;
END $$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER check_customer_age_before_insert
BEFORE INSERT ON CUSTOMER
FOR EACH ROW
BEGIN
  IF NEW.birth_date > DATE_SUB(CURDATE(), INTERVAL 18 YEAR) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Customer must be at least 18 years old.';
  END IF;
END$$
DELIMITER;


DELIMITER $$
CREATE TRIGGER trg_remittance_required
AFTER INSERT ON CUSTOMER_FUND_SOURCE
FOR EACH ROW
BEGIN
  DECLARE rc VARCHAR(25);
  DECLARE rp VARCHAR(255);

  IF NEW.fund_source_code = 'FS005' THEN
    SELECT remittance_country, remittance_purpose
      INTO rc, rp
      FROM CUSTOMER
      WHERE cif_number = NEW.cif_number;

    IF rc IS NULL OR rp IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Remittance source requires country + purpose';
    END IF;
  END IF;
END$$
DELIMITER ;


-- 12. CUSTOMER_ADDRESS
-- =====================
CREATE TABLE CUSTOMER_ADDRESS (
	cif_number 				BIGINT UNSIGNED NOT NULL,
    address_type_code 		CHAR(4) NOT NULL,
    address_unit 			VARCHAR(10),
    address_building 		VARCHAR(100),
    address_street 			VARCHAR(100),
    address_subdivision 	VARCHAR(100),
    address_barangay 		VARCHAR(100) NOT NULL,
    address_city 			VARCHAR(100) NOT NULL,
    address_province 		VARCHAR(100) NOT NULL,
    address_country 		VARCHAR(100) NOT NULL,
    address_zip_code 		CHAR(4) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number, address_type_code),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (address_type_code) REFERENCES ADDRESS_TYPE(address_type_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
	CONSTRAINT check_address_complete 		CHECK (address_unit IS NOT NULL OR address_street IS NOT NULL OR address_subdivision IS NOT NULL),
    CONSTRAINT check_address_barangay 		CHECK (address_barangay REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_address_city 			CHECK (address_city REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_address_province 		CHECK (address_province REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_address_country 		CHECK (address_country REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_address_zipcode 		CHECK (address_zip_code REGEXP '^[0-9]{4}$')
    );

DELIMITER $$
CREATE TRIGGER enforce_home_address_after_address_insert
  AFTER INSERT ON CUSTOMER_ADDRESS
  FOR EACH ROW
BEGIN
	DECLARE cnt INT;
    IF NEW.address_type_code = 'AD01' THEN
    SELECT COUNT(*) INTO cnt
      FROM CUSTOMER_ADDRESS
      WHERE cif_number = NEW.cif_number
        AND address_type_code = 'AD01';
    IF cnt > 1 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot have more than one home address';
    END IF;
  END IF;
END$$
DELIMITER ;

    
-- 13. CUSTOMER_CONTACT_DETAILS
-- ============================
CREATE TABLE CUSTOMER_CONTACT_DETAILS(
	cif_number 			BIGINT UNSIGNED NOT NULL,
    contact_type_code 	CHAR(4) NOT NULL,
    contact_value		VARCHAR(255) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number, contact_type_code),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (contact_type_code) REFERENCES CONTACT_TYPE(contact_type_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_contact_value CHECK (contact_value REGEXP '^\\+[1-9][0-9]{1,14}$' OR contact_value REGEXP '^\\([0-9]{2}\\) [0-9]{4}-[0-9]{4}$' OR contact_value REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
	);


DELIMITER $$
CREATE TRIGGER trg_customer_contact_insert_check
AFTER INSERT ON CUSTOMER_CONTACT_DETAILS
FOR EACH ROW
BEGIN
    DECLARE mobile_count INT DEFAULT 0;
    DECLARE phone_count INT DEFAULT 0;
    DECLARE personal_email_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO mobile_count
    FROM CUSTOMER_CONTACT_DETAILS
    WHERE cif_number = NEW.cif_number
      AND contact_type_code = 'CT01';
    
    SELECT COUNT(*) INTO phone_count
    FROM CUSTOMER_CONTACT_DETAILS
    WHERE cif_number = NEW.cif_number
      AND contact_type_code = 'CT02';
    
    SELECT COUNT(*) INTO personal_email_count
    FROM CUSTOMER_CONTACT_DETAILS
    WHERE cif_number = NEW.cif_number
      AND contact_type_code = 'CT03';
    
    IF mobile_count = 0 OR phone_count = 0 OR personal_email_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Customer must have at least one mobile (CT01), one telephone (CT02), and one personal email (CT03)';
    END IF;
END$$

CREATE TRIGGER trg_customer_contact_update_check
AFTER UPDATE ON CUSTOMER_CONTACT_DETAILS
FOR EACH ROW
BEGIN
    DECLARE mobile_count INT DEFAULT 0;
    DECLARE phone_count INT DEFAULT 0;
    DECLARE personal_email_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO mobile_count
    FROM CUSTOMER_CONTACT_DETAILS
    WHERE cif_number = NEW.cif_number
      AND contact_type_code = 'CT01';
    
    SELECT COUNT(*) INTO phone_count
    FROM CUSTOMER_CONTACT_DETAILS
    WHERE cif_number = NEW.cif_number
      AND contact_type_code = 'CT02';
    
    SELECT COUNT(*) INTO personal_email_count
    FROM CUSTOMER_CONTACT_DETAILS
    WHERE cif_number = NEW.cif_number
      AND contact_type_code = 'CT03';
    
    IF mobile_count = 0 OR phone_count = 0 OR personal_email_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Customer must have at least one mobile (CT01), one telephone (CT02), and one personal email (CT03)';
    END IF;
END$$

CREATE TRIGGER trg_customer_contact_delete_check
AFTER DELETE ON CUSTOMER_CONTACT_DETAILS
FOR EACH ROW
BEGIN
    DECLARE mobile_count INT DEFAULT 0;
    DECLARE phone_count INT DEFAULT 0;
    DECLARE personal_email_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO mobile_count
    FROM CUSTOMER_CONTACT_DETAILS
    WHERE cif_number = OLD.cif_number
      AND contact_type_code = 'CT01';
    
    SELECT COUNT(*) INTO phone_count
    FROM CUSTOMER_CONTACT_DETAILS
    WHERE cif_number = OLD.cif_number
      AND contact_type_code = 'CT02';
    
    SELECT COUNT(*) INTO personal_email_count
    FROM CUSTOMER_CONTACT_DETAILS
    WHERE cif_number = OLD.cif_number
      AND contact_type_code = 'CT03';
    
    IF mobile_count = 0 OR phone_count = 0 OR personal_email_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete: Customer must maintain at least one mobile (CT01), one telephone (CT02), and one personal email (CT03)';
    END IF;
END$$
DELIMITER ;


-- 14. CUSTOMER_EMPLOYMENT_INFORMATION
-- ===================================
CREATE TABLE CUSTOMER_EMPLOYMENT_INFORMATION (
    customer_employment_id 		INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    cif_number				 	BIGINT UNSIGNED NOT NULL,
    employer_business_name 		VARCHAR(255) NOT NULL,
    employment_start_date 		DATE NOT NULL,
    employment_end_date 		DATE,
    employment_status 			VARCHAR(20) NOT NULL DEFAULT 'Current',
    position_code 				CHAR(4) NOT NULL,
    income_monthly_gross 		DECIMAL(12, 2) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (customer_employment_id),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (position_code) REFERENCES EMPLOYMENT_POSITION(position_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_employer_business_name 	CHECK (employer_business_name REGEXP '^[A-Za-z0-9 ,.\\-()&]+$'),
    CONSTRAINT check_employment_status 			CHECK (employment_status IN ('Current', 'Previous')),
    CONSTRAINT check_employment_dates 			CHECK (employment_end_date IS NULL OR employment_end_date >= employment_start_date),
    CONSTRAINT check_income_positive 			CHECK (income_monthly_gross >= 0)
);


DELIMITER $$
CREATE TRIGGER trg_employment_date_insert_check
BEFORE INSERT ON CUSTOMER_EMPLOYMENT_INFORMATION
FOR EACH ROW
BEGIN
    IF NEW.employment_start_date > CURRENT_DATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Employment start date cannot be in the future';
    END IF;
    
    IF NEW.employment_end_date IS NOT NULL THEN
        IF NEW.employment_end_date > CURRENT_DATE() THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Employment end date cannot be in the future';
        END IF;
        
        IF NEW.employment_end_date < NEW.employment_start_date THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Employment end date cannot be before start date';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_employment_date_update_check
BEFORE UPDATE ON CUSTOMER_EMPLOYMENT_INFORMATION
FOR EACH ROW
BEGIN
    IF NEW.employment_start_date > CURRENT_DATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Employment start date cannot be in the future';
    END IF;
    
    IF NEW.employment_end_date IS NOT NULL THEN
        IF NEW.employment_end_date > CURRENT_DATE() THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Employment end date cannot be in the future';
        END IF;
        
        IF NEW.employment_end_date < NEW.employment_start_date THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Employment end date cannot be before start date';
        END IF;
    END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER trg_employment_no_status_update
BEFORE UPDATE ON CUSTOMER_EMPLOYMENT_INFORMATION
FOR EACH ROW
BEGIN
  IF OLD.employment_status <> NEW.employment_status
     OR OLD.employment_end_date <> NEW.employment_end_date THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'To change employment status, insert a new row—do not update existing record';
  END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER trg_cust_fund_source_delete_check
BEFORE DELETE ON CUSTOMER_FUND_SOURCE
FOR EACH ROW
BEGIN
  DECLARE cnt INT;
  SELECT COUNT(*) INTO cnt
    FROM CUSTOMER_FUND_SOURCE
    WHERE cif_number = OLD.cif_number;
  IF cnt <= 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Customer must have at least one fund source.';
  END IF;
END$$
DELIMITER ;



-- 15. CUSTOMER_FUND_SOURCE
-- ========================
CREATE TABLE CUSTOMER_FUND_SOURCE (
   cif_number 			BIGINT UNSIGNED NOT NULL,
   fund_source_code 	CHAR(5) NOT NULL,
   
   -- KEY CONSTRAINTS
   PRIMARY KEY (cif_number, fund_source_code),
   FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
   FOREIGN KEY (fund_source_code) REFERENCES FUND_SOURCE_TYPE(fund_source_code) ON UPDATE CASCADE ON DELETE RESTRICT
);


-- 16. CUSTOMER_WORK_NATURE
-- ========================
CREATE TABLE CUSTOMER_WORK_NATURE (
	customer_employment_id 		INTEGER UNSIGNED NOT NULL,
    work_nature_code 			CHAR(5) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (customer_employment_id, work_nature_code),
	FOREIGN KEY (customer_employment_id) REFERENCES CUSTOMER_EMPLOYMENT_INFORMATION(customer_employment_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (work_nature_code) REFERENCES WORK_NATURE_TYPE(work_nature_code) ON UPDATE CASCADE ON DELETE RESTRICT
);


-- 17. CUSTOMER_ALIAS
-- ==================
CREATE TABLE CUSTOMER_ALIAS (
	alias_section_id 		INT AUTO_INCREMENT PRIMARY KEY,
	customer_alias_id 		CHAR(10) UNIQUE,
    cif_number 				BIGINT UNSIGNED NOT NULL,
    alias_last_name 		VARCHAR(255) NOT NULL,
    alias_first_name 		VARCHAR(255) NOT NULL,
    alias_middle_name 		VARCHAR(255),
    alias_suffix_name 		VARCHAR(255),
    
    -- KEY CONSTRAINTS
	FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    
    -- CHECK CONSTRAINTS
	CONSTRAINT check_alias_last_name 				CHECK (alias_last_name REGEXP '^[A-Za-z \\-]+$'),
    CONSTRAINT check_alias_first_name 				CHECK (alias_first_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_alias_middle_name 				CHECK (alias_middle_name IS NULL OR alias_middle_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT check_alias_suffix_name 				CHECK (alias_suffix_name IS NULL OR alias_suffix_name REGEXP '^[A-Za-z\\.]+$'),
    CONSTRAINT unique_alias_per_customer			UNIQUE (cif_number, alias_last_name(100), alias_first_name(100), alias_middle_name(100), alias_suffix_name(100))
);


DELIMITER $$
CREATE TRIGGER trg_alias_documentation_auto_insert
    AFTER INSERT ON CUSTOMER_ALIAS
    FOR EACH ROW
BEGIN
    INSERT INTO ALIAS_DOCUMENTATION (
        alias_section_id,
        customer_alias_id,
        document_code
    ) VALUES (
        NEW.alias_section_id,
        NEW.customer_alias_id,
        'DOC001'  -- Default document type - replace with your default
    );
END$$
DELIMITER ;


-- 18. ALIAS_DOCUMENTATION
-- =======================
CREATE TABLE ALIAS_DOCUMENTATION (
	alias_section_id 		INT AUTO_INCREMENT PRIMARY KEY,
	customer_alias_id  CHAR(10) UNIQUE,
	issuing_authority  VARCHAR(100),
    document_issue_date 	DATE,
    document_expiry_date 	DATE,
    document_storage 		VARCHAR(255),
    document_code 			CHAR(6) NOT NULL,
    
    -- KEY CONSTRAINTS
	FOREIGN KEY (alias_section_id) REFERENCES CUSTOMER_ALIAS(alias_section_id) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (customer_alias_id) REFERENCES CUSTOMER_ALIAS(customer_alias_id) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (document_code) REFERENCES ALIAS_DOCUMENTATION_TYPE(document_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
	CONSTRAINT chk_issuing_authority_chars 		CHECK (issuing_authority IS NULL OR issuing_authority REGEXP '^[A-Za-z0-9 ,.\\-()]+$'),
    CONSTRAINT chk_doc_dates_valid 				CHECK (document_expiry_date IS NULL OR document_issue_date IS NULL OR document_expiry_date > document_issue_date)
);


DELIMITER $$
CREATE TRIGGER trg_alias_doc_insert_validation
    BEFORE INSERT ON ALIAS_DOCUMENTATION
    FOR EACH ROW
BEGIN
    IF NEW.document_issue_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Document issue date cannot be in the future';
    END IF;
    
    IF NEW.document_expiry_date IS NOT NULL AND NEW.document_expiry_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Document expiry date cannot be in the past for new documents';
    END IF;
    
    IF NEW.document_expiry_date IS NOT NULL THEN
        IF NEW.document_expiry_date < CURDATE() THEN
            SET NEW.document_status = 'EXPIRED';
        ELSEIF NEW.document_expiry_date >= CURDATE() THEN
            SET NEW.document_status = 'ACTIVE';
        END IF;
    ELSE
        SET NEW.document_status = 'ACTIVE';
    END IF;
END$$

CREATE TRIGGER trg_alias_doc_update_validation
    BEFORE UPDATE ON ALIAS_DOCUMENTATION
    FOR EACH ROW
BEGIN
    IF NEW.document_issue_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Document issue date cannot be in the future';
    END IF;
    
    IF NEW.document_expiry_date IS NOT NULL THEN
        IF NEW.document_expiry_date < CURDATE() THEN
            SET NEW.document_status = 'EXPIRED';
        ELSEIF NEW.document_expiry_date >= CURDATE() THEN
            SET NEW.document_status = 'ACTIVE';
        END IF;
    ELSE
        SET NEW.document_status = 'ACTIVE';
    END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER trg_after_insert_customer_alias
AFTER INSERT ON CUSTOMER_ALIAS
FOR EACH ROW
BEGIN
  UPDATE CUSTOMER_ALIAS
     SET customer_alias_id = CONCAT('CA', LPAD(NEW.alias_section_id, 5, '0'))
   WHERE alias_section_id = NEW.alias_section_id;
END$$
DELIMITER ;


-- 19. BANK_EMPLOYEE
-- ================
CREATE TABLE BANK_EMPLOYEE (
    employee_section_id 	INT AUTO_INCREMENT PRIMARY KEY,
    employee_id 			CHAR(7) UNIQUE,
    employee_position 		VARCHAR(50) NOT NULL,
    employee_last_name 		CHAR(255) NOT NULL,
    employee_first_name 	CHAR(255) NOT NULL,
    employee_middle_name 	CHAR(255),
    employee_suffix_name 	VARCHAR(255),
    employee_username 		VARCHAR(50) NOT NULL UNIQUE,
    employee_password 		VARCHAR(255) NOT NULL,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_employee_id			CHECK (employee_id REGEXP '^E[0-9]{6}$'),
    CONSTRAINT check_employee_position 		CHECK (employee_position REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT chk_employee_last_name 		CHECK (employee_last_name REGEXP '^[A-Za-z \\-]+$'),
    CONSTRAINT chk_employee_first_name 		CHECK (employee_first_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT chk_employee_middle_name 	CHECK (employee_middle_name IS NULL OR employee_middle_name REGEXP '^[A-Za-z ]+$'),
    CONSTRAINT chk_employee_suffix 			CHECK (employee_suffix_name IS NULL OR employee_suffix_name REGEXP '^[A-Za-z\\.]+$'),
    CONSTRAINT chk_employee_username 		CHECK (employee_username REGEXP '^[A-Za-z0-9.]+$'),
	CONSTRAINT check_employee_password 		CHECK (employee_password REGEXP '^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$')
	);


DELIMITER $$
CREATE TRIGGER trg_after_insert_bank_employee
AFTER INSERT ON BANK_EMPLOYEE
FOR EACH ROW
BEGIN
  UPDATE BANK_EMPLOYEE
     SET employee_id = CONCAT('E', LPAD(NEW.employee_section_id, 6, '0'))
   WHERE employee_section_id = NEW.employee_section_id;
END$$
DELIMITER ;


-- 20. ACCOUNT_DETAILS
-- ===================
CREATE TABLE ACCOUNT_DETAILS (
    account_number 			BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id 				CHAR(4) NOT NULL,
    referral_type 			VARCHAR(30) NOT NULL,
    referral_source 		VARCHAR(255),
    verified_by_employee 	CHAR(7) NOT NULL,
    approved_by_employee 	CHAR(7) NOT NULL,
    account_open_date 		DATE NOT NULL,
    account_status 			VARCHAR(10) NOT NULL,
    biometrics_type_code 	CHAR(4) NOT NULL,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (account_number),
	FOREIGN KEY (product_id) REFERENCES CUSTOMER_PRODUCT_TYPE(product_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (verified_by_employee) REFERENCES BANK_EMPLOYEE(employee_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (approved_by_employee) REFERENCES BANK_EMPLOYEE(employee_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (biometrics_type_code) REFERENCES BIOMETRIC_TYPE(biometrics_type_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_referral_type1 				CHECK (referral_type REGEXP '^[A-Za-z\\-]+$'),
    CONSTRAINT check_referral_type2 				CHECK (referral_type IN ('Walk-in', 'Referred')),
    CONSTRAINT check_referral_source_condition 		CHECK ((referral_type = 'Referred' AND referral_source IS NOT NULL AND referral_source REGEXP '^[A-Za-z ]+$') OR(referral_type = 'Walk-in' AND referral_source IS NULL)),
    CONSTRAINT check_account_status 				CHECK (account_status IN ('Active', 'Dormant', 'Closed', 'Suspended'))
) AUTO_INCREMENT = 100000000000;


DELIMITER $$
CREATE TRIGGER trg_validate_account_num
    BEFORE INSERT ON ACCOUNT_DETAILS
    FOR EACH ROW
BEGIN
    IF NEW.account_number < 100000000000 OR NEW.account_number > 999999999999 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Account number must be exactly 12 digits (100000000000-999999999999)';
    END IF;
END$$

CREATE TRIGGER trg_validate_account_num_update
    BEFORE UPDATE ON ACCOUNT_DETAILS
    FOR EACH ROW
BEGIN
    IF NEW.account_number < 100000000000 OR NEW.account_number > 999999999999 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Account number must be exactly 12 digits (100000000000-999999999999)';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_account_details_no_same_employee
BEFORE INSERT ON ACCOUNT_DETAILS
FOR EACH ROW
BEGIN
  IF NEW.verified_by_employee = NEW.approved_by_employee THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'verified_by_employee and approved_by_employee must differ';
  END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER trg_customer_account_insert_validation
    BEFORE INSERT ON ACCOUNT_DETAILS
    FOR EACH ROW
BEGIN
    IF NEW.account_number < 100000000000 OR NEW.account_number > 999999999999 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Account number must be exactly 12 digits (100000000000-999999999999)';
    END IF;
    
    IF NEW.account_open_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Account open date cannot be in the future';
    END IF;
    
    IF NEW.account_open_date < DATE_SUB(CURDATE(), INTERVAL 10 YEAR) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Account open date cannot be more than 10 years in the past';
    END IF;
END$$

CREATE TRIGGER trg_customer_account_update_validation
    BEFORE UPDATE ON ACCOUNT_DETAILS
    FOR EACH ROW
BEGIN
    IF NEW.account_number < 100000000000 OR NEW.account_number > 999999999999 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Account number must be exactly 12 digits (100000000000-999999999999)';
    END IF;
    
    IF NEW.account_open_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Account open date cannot be in the future';
    END IF;
    
    IF OLD.account_open_date != NEW.account_open_date THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Account open date cannot be modified after account creation';
    END IF;
END$$
DELIMITER ;


-- 21. CUSTOMER_ACCOUNT
-- ====================
CREATE TABLE CUSTOMER_ACCOUNT (
	cif_number 			BIGINT UNSIGNED NOT NULL,
	account_number 		BIGINT UNSIGNED NOT NULL,
        
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number, account_number),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (account_number) REFERENCES ACCOUNT_DETAILS(account_number) ON UPDATE CASCADE ON DELETE CASCADE
);


-- 22. CUSTOMER_ID
-- ===============
CREATE TABLE CUSTOMER_ID (
	cif_number 			BIGINT UNSIGNED NOT NULL,
	id_type_code 		CHAR(3) NOT NULL,
    id_number 			VARCHAR(20) NOT NULL,
    id_storage 			VARCHAR(255) NOT NULL,
    id_issue_date 		DATE NOT NULL,
    id_expiry_date 		DATE,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (cif_number, id_type_code),
    FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_type_code) REFERENCES ID_TYPE(id_type_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- CHECK CONSTRAINTS
    CONSTRAINT check_id_number 		CHECK (id_number REGEXP '^[A-Za-z0-9\\-]+$'),
	CONSTRAINT check_id_storage 	CHECK (id_storage REGEXP '^(https?|ftp)://.+' OR id_storage REGEXP '^[A-Za-z]:(\\\\[A-Za-z0-9_\\\\/\\.-]+)+$' OR id_storage REGEXP '^/[A-Za-z0-9_\\/\\.-]+$'),
	CONSTRAINT check_id_date 		CHECK (id_issue_date < id_expiry_date)
);


DELIMITER $$
CREATE TRIGGER trg_customer_id_dates_insert
    BEFORE INSERT ON CUSTOMER_ID
    FOR EACH ROW
BEGIN
    -- Check issue date is not in future
    IF NEW.id_issue_date > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ID issue date cannot be in the future';
    END IF;
    
    -- Check expiry date is in future (if provided)
    IF NEW.id_expiry_date IS NOT NULL AND NEW.id_expiry_date <= CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ID expiry date must be in the future';
    END IF;
END$$

CREATE TRIGGER trg_customer_id_dates_update
    BEFORE UPDATE ON CUSTOMER_ID
    FOR EACH ROW
BEGIN
    -- Check issue date is not in future
    IF NEW.id_issue_date > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ID issue date cannot be in the future';
    END IF;
    
    -- Check expiry date is in future (if provided)
    IF NEW.id_expiry_date IS NOT NULL AND NEW.id_expiry_date <= CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ID expiry date must be in the future';
    END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER trg_limit_two_ids
AFTER INSERT ON CUSTOMER_ID
FOR EACH ROW
BEGIN
  DECLARE cnt INT;
  SELECT COUNT(*) INTO cnt
    FROM CUSTOMER_ID
    WHERE cif_number = NEW.cif_number;
  IF cnt > 2 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A customer may have at most two ID documents.';
  END IF;
END;
DELIMITER ;