-- Add regulatory columns to CUSTOMER
ALTER TABLE CUSTOMER
  ADD COLUMN reg_political_affiliation VARCHAR(10),
  ADD COLUMN reg_fatca VARCHAR(10),
  ADD COLUMN reg_dnfbp VARCHAR(10),
  ADD COLUMN reg_online_gaming VARCHAR(10),
  ADD COLUMN reg_beneficial_owner VARCHAR(10);

-- Add biometric_type to customer table
ALTER TABLE CUSTOMER ADD COLUMN biometric_type VARCHAR(50) NULL;

-- Example: Add columns for alias (if not already present)
-- ALTER TABLE CUSTOMER ADD COLUMN alias_first_name VARCHAR(255), ...

-- Other data (IDs, employment, address, contact, fund source, work nature, etc.)
-- are already normalized in their own tables (see schema), so you should insert into those tables after creating the CUSTOMER record and getting the cif_number.

-- If you want to store images (ID photos, supporting docs), store the file path or URL in the appropriate *_storage column, not the base64 string.

-- You may need to adjust the schema further based on your exact frontend fields.

-- Run this script after updating your backend code to match the new columns.

-- Add alternate address and checkbox fields to CUSTOMER_ADDRESS table
ALTER TABLE CUSTOMER_ADDRESS 
  ADD COLUMN is_alternate_address_same_as_home VARCHAR(3) NULL,
  ADD COLUMN alt_unit VARCHAR(50) NULL,
  ADD COLUMN alt_building VARCHAR(50) NULL,
  ADD COLUMN alt_street VARCHAR(100) NULL,
  ADD COLUMN alt_subdivision VARCHAR(100) NULL,
  ADD COLUMN alt_barangay VARCHAR(100) NULL,
  ADD COLUMN alt_city VARCHAR(100) NULL,
  ADD COLUMN alt_province VARCHAR(100) NULL,
  ADD COLUMN alt_country VARCHAR(100) NULL,
  ADD COLUMN alt_zip VARCHAR(20) NULL;
