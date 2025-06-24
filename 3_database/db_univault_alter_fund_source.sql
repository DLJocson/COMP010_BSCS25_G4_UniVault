-- Migration: Update FUND_SOURCE_TYPE and CUSTOMER_FUND_SOURCE to support descriptive codes

-- 1. Drop foreign key constraint from CUSTOMER_FUND_SOURCE (if exists)
ALTER TABLE CUSTOMER_FUND_SOURCE DROP FOREIGN KEY CUSTOMER_FUND_SOURCE_ibfk_2;

-- 2. Change fund_source_code type in FUND_SOURCE_TYPE and CUSTOMER_FUND_SOURCE
ALTER TABLE FUND_SOURCE_TYPE MODIFY fund_source_code VARCHAR(50) NOT NULL;
ALTER TABLE CUSTOMER_FUND_SOURCE MODIFY fund_source_code VARCHAR(50) NOT NULL;

-- 3. Update primary/foreign key constraints
ALTER TABLE FUND_SOURCE_TYPE DROP PRIMARY KEY;
ALTER TABLE FUND_SOURCE_TYPE ADD PRIMARY KEY (fund_source_code);
ALTER TABLE CUSTOMER_FUND_SOURCE DROP PRIMARY KEY;
ALTER TABLE CUSTOMER_FUND_SOURCE ADD PRIMARY KEY (cif_number, fund_source_code);
ALTER TABLE CUSTOMER_FUND_SOURCE ADD CONSTRAINT fk_fund_source_code FOREIGN KEY (fund_source_code) REFERENCES FUND_SOURCE_TYPE(fund_source_code) ON UPDATE CASCADE ON DELETE RESTRICT;

-- 4. Remove check constraint if exists
ALTER TABLE FUND_SOURCE_TYPE DROP CHECK check_fund_source_code;

-- 5. Insert allowed fund source values
INSERT IGNORE INTO FUND_SOURCE_TYPE (fund_source_code, fund_source) VALUES
  ('employed_fixed', 'Employed - Fixed Income'),
  ('employed_variable', 'Employed - Variable Income'),
  ('self_employed_fixed', 'Self-Employed - Fixed Income'),
  ('remittances', 'Remittances'),
  ('pension', 'Pension'),
  ('savings_retirement', 'Personal Savings / Retirement Proceeds'),
  ('allowance', 'Allowance'),
  ('inheritance', 'Inheritance'),
  ('investment_income', 'Investment / Dividend Income'),
  ('rental_income', 'Rental Income'),
  ('asset_sale', 'Sale of Asset / Property'),
  ('other', 'Other Sources');

-- Done. Now you can use descriptive codes in the backend/frontend and keep referential integrity.
