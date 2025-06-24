-- Add all common fund source codes for UniVault
INSERT INTO fund_source_type (fund_source_code, fund_source_description) VALUES
('remittances', 'Remittances'),
('allowance', 'Allowance'),
('salary', 'Salary'),
('business', 'Business Income'),
('investment', 'Investment Income'),
('pension', 'Pension'),
('savings', 'Savings'),
('sale', 'Sale of Property/Assets'),
('rental', 'Rental Income'),
('commission', 'Commission'),
('dividends', 'Dividends'),
('others', 'Others')
ON DUPLICATE KEY UPDATE fund_source_description = VALUES(fund_source_description);
