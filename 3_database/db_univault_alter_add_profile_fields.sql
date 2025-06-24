-- Add new columns for extended employment and profile details
ALTER TABLE customer
ADD COLUMN work_contact_code VARCHAR(20),
ADD COLUMN currently_employed VARCHAR(10),
ADD COLUMN remittance_country VARCHAR(100),
ADD COLUMN remittance_purpose VARCHAR(100),
ADD COLUMN source_of_funds_multi TEXT,
ADD COLUMN business_nature_multi TEXT;

-- Allow 'Non-binary' and other values for gender
ALTER TABLE customer 
DROP CONSTRAINT IF EXISTS check_gender;
ALTER TABLE customer 
ADD CONSTRAINT check_gender CHECK (gender IN ('Male', 'Female', 'Non-binary', 'Prefer not to say'));
