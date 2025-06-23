USE univault_schema;

-- Insert reference data for contact types
INSERT IGNORE INTO CONTACT_TYPE (contact_type_code, contact_type_description) VALUES 
('CT01', 'Email'),
('CT02', 'Phone'),
('CT03', 'Mobile'),
('CT04', 'Fax');

-- Insert reference data for address types  
INSERT IGNORE INTO ADDRESS_TYPE (address_type_code, address_type) VALUES 
('AD01', 'Home'),
('AD02', 'Work'),
('AD03', 'Mailing'),
('AD04', 'Business');

-- Insert civil status types
INSERT IGNORE INTO CIVIL_STATUS_TYPE (civil_status_code, civil_status_description) VALUES 
('CS01', 'Single'),
('CS02', 'Married'),
('CS03', 'Divorced'),
('CS04', 'Widowed');

-- Insert sample customers with all required fields
INSERT IGNORE INTO CUSTOMER (
    cif_number, customer_type, customer_last_name, customer_first_name, 
    customer_middle_name, customer_suffix_name, customer_username, customer_password,
    birth_date, gender, civil_status_code, birth_country, residency_status, 
    citizenship, tax_identification_number, customer_status, is_deleted
) VALUES 
(5821947360, 'Account Owner', 'Doe', 'John', 'Michael', NULL, 'johndoe', 'hashedpassword123', '1990-05-15', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', 'TIN123456789', 'Pending Verification', FALSE),
(1234567890, 'Account Owner', 'Smith', 'Jane', 'Rose', NULL, 'janesmith', 'hashedpassword123', '1985-08-22', 'Female', 'CS02', 'Philippines', 'Resident', 'Filipino', 'TIN987654321', 'Active', FALSE),
(9876543210, 'Business Owner', 'Johnson', 'Robert', 'William', 'Jr.', 'rjohnson', 'hashedpassword123', '1980-12-10', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', 'TIN456789123', 'Suspended', FALSE),
(1111222233, 'Account Owner', 'Garcia', 'Maria', 'Elena', NULL, 'mgarcia', 'hashedpassword123', '1992-03-18', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', 'TIN321654987', 'Pending Verification', FALSE),
(4444555566, 'Business Owner', 'Wilson', 'David', 'James', NULL, 'dwilson', 'hashedpassword123', '1978-09-25', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', 'TIN654321987', 'Active', FALSE),
(7777888899, 'Account Owner', 'Brown', 'Sarah', 'Ann', NULL, 'sbrown', 'hashedpassword123', '1988-07-14', 'Female', 'CS03', 'Philippines', 'Resident', 'Filipino', 'TIN789123456', 'Inactive', FALSE),
(2222333344, 'Account Owner', 'Davis', 'Michael', 'Thomas', NULL, 'mdavis', 'hashedpassword123', '1995-11-03', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', 'TIN147258369', 'Pending Verification', FALSE),
(5555666677, 'Account Owner', 'Martinez', 'Lisa', 'Catherine', NULL, 'lmartinez', 'hashedpassword123', '1987-04-29', 'Female', 'CS02', 'Philippines', 'Resident', 'Filipino', 'TIN963852741', 'Active', FALSE),
(8888999900, 'Business Owner', 'Anderson', 'James', 'Robert', 'Sr.', 'janderson', 'hashedpassword123', '1975-06-08', 'Male', 'CS04', 'Philippines', 'Resident', 'Filipino', 'TIN852741963', 'Suspended', FALSE),
(3333444455, 'Account Owner', 'Taylor', 'Emma', 'Grace', NULL, 'etaylor', 'hashedpassword123', '1993-01-20', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', 'TIN741852963', 'Pending Verification', FALSE);

-- Insert contact details for customers
INSERT IGNORE INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
(5821947360, 'CT01', 'john.doe@email.com'),
(5821947360, 'CT02', '+63 9171112222'),
(1234567890, 'CT01', 'jane.smith@email.com'),
(1234567890, 'CT02', '+63 9171113333'),
(9876543210, 'CT01', 'robert.johnson@business.com'),
(9876543210, 'CT02', '+63 9171114444'),
(1111222233, 'CT01', 'maria.garcia@email.com'),
(1111222233, 'CT02', '+63 9171115555'),
(4444555566, 'CT01', 'david.wilson@company.com'),
(4444555566, 'CT02', '+63 9171116666'),
(7777888899, 'CT01', 'sarah.brown@email.com'),
(7777888899, 'CT02', '+63 9171117777'),
(2222333344, 'CT01', 'michael.davis@email.com'),
(2222333344, 'CT02', '+63 9171118888'),
(5555666677, 'CT01', 'lisa.martinez@email.com'),
(5555666677, 'CT02', '+63 9171119999'),
(8888999900, 'CT01', 'james.anderson@corp.com'),
(8888999900, 'CT02', '+63 9171110000'),
(3333444455, 'CT01', 'emma.taylor@email.com'),
(3333444455, 'CT02', '+63 9171111111');

-- Insert additional employees for testing (if the table exists)
INSERT IGNORE INTO BANK_EMPLOYEE (
    employee_username, employee_password, employee_position, 
    employee_first_name, employee_last_name
) VALUES 
('manager', '$2b$10$N9qo8uLOickgx2ZMRZoMye.SemKgOj5YJlJ5xq6fQ6.O/66i0.aFK', 'Branch Manager', 'Alice', 'Johnson'),
('teller1', '$2b$10$N9qo8uLOickgx2ZMRZoMye.SemKgOj5YJlJ5xq6fQ6.O/66i0.aFK', 'Teller', 'Bob', 'Williams'),
('supervisor', '$2b$10$N9qo8uLOickgx2ZMRZoMye.SemKgOj5YJlJ5xq6fQ6.O/66i0.aFK', 'Supervisor', 'Carol', 'Davis'),
('analyst', '$2b$10$N9qo8uLOickgx2ZMRZoMye.SemKgOj5YJlJ5xq6fQ6.O/66i0.aFK', 'Financial Analyst', 'David', 'Miller');

-- Create some closed accounts (set is_deleted = TRUE)
UPDATE CUSTOMER SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE cif_number = 8888999900;

SELECT 'Simple test data inserted successfully!' as result;
SELECT 'Customer count:', COUNT(*) as count FROM CUSTOMER WHERE is_deleted = FALSE;
SELECT 'Active customers:', COUNT(*) as count FROM CUSTOMER WHERE customer_status = 'Active' AND is_deleted = FALSE;
SELECT 'Pending verifications:', COUNT(*) as count FROM CUSTOMER WHERE customer_status = 'Pending Verification' AND is_deleted = FALSE;
