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

-- Insert sample customers for testing
INSERT IGNORE INTO CUSTOMER (
    cif_number, customer_type, customer_first_name, customer_last_name, 
    customer_middle_name, customer_suffix_name, customer_username, 
    customer_status, created_at, is_deleted
) VALUES 
(5821947360, 'Individual', 'John', 'Doe', 'Michael', NULL, 'johndoe', 'Pending Verification', '2024-06-15 10:30:00', FALSE),
(1234567890, 'Individual', 'Jane', 'Smith', 'Rose', NULL, 'janesmith', 'Active', '2024-06-10 14:20:00', FALSE),
(9876543210, 'Business', 'Robert', 'Johnson', 'William', 'Jr.', 'rjohnson', 'Suspended', '2024-06-12 09:15:00', FALSE),
(1111222233, 'Individual', 'Maria', 'Garcia', 'Elena', NULL, 'mgarcia', 'Pending Verification', '2024-06-14 16:45:00', FALSE),
(4444555566, 'Business', 'David', 'Wilson', 'James', NULL, 'dwilson', 'Active', '2024-06-11 11:30:00', FALSE),
(7777888899, 'Individual', 'Sarah', 'Brown', 'Ann', NULL, 'sbrown', 'Inactive', '2024-06-13 13:20:00', FALSE),
(2222333344, 'Individual', 'Michael', 'Davis', 'Thomas', NULL, 'mdavis', 'Pending Verification', '2024-06-16 08:10:00', FALSE),
(5555666677, 'Individual', 'Lisa', 'Martinez', 'Catherine', NULL, 'lmartinez', 'Active', '2024-06-09 15:40:00', FALSE),
(8888999900, 'Business', 'James', 'Anderson', 'Robert', 'Sr.', 'janderson', 'Suspended', '2024-06-08 12:25:00', FALSE),
(3333444455, 'Individual', 'Emma', 'Taylor', 'Grace', NULL, 'etaylor', 'Pending Verification', '2024-06-17 17:30:00', FALSE);

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

-- Insert additional employees for testing
INSERT IGNORE INTO BANK_EMPLOYEE (
    employee_username, employee_password, employee_position, 
    employee_first_name, employee_last_name, created_at
) VALUES 
('manager', '$2b$10$N9qo8uLOickgx2ZMRZoMye.SemKgOj5YJlJ5xq6fQ6.O/66i0.aFK', 'Branch Manager', 'Alice', 'Johnson', '2024-01-15 09:00:00'),
('teller1', '$2b$10$N9qo8uLOickgx2ZMRZoMye.SemKgOj5YJlJ5xq6fQ6.O/66i0.aFK', 'Teller', 'Bob', 'Williams', '2024-02-01 09:00:00'),
('supervisor', '$2b$10$N9qo8uLOickgx2ZMRZoMye.SemKgOj5YJlJ5xq6fQ6.O/66i0.aFK', 'Supervisor', 'Carol', 'Davis', '2024-01-20 09:00:00'),
('analyst', '$2b$10$N9qo8uLOickgx2ZMRZoMye.SemKgOj5YJlJ5xq6fQ6.O/66i0.aFK', 'Financial Analyst', 'David', 'Miller', '2024-03-01 09:00:00');

-- Insert sample close requests
INSERT IGNORE INTO CLOSE_REQUEST (cif_number, request_reason, request_status, request_date) VALUES
(5821947360, 'Customer wishes to close account due to relocation', 'Pending', '2024-06-18 10:30:00'),
(1234567890, 'Dissatisfied with service quality', 'Pending', '2024-06-17 14:20:00'),
(9876543210, 'Found better banking alternatives', 'Approved', '2024-06-16 09:15:00'),
(7777888899, 'Moving to different country', 'Pending', '2024-06-19 11:45:00');

-- Create some closed accounts (set is_deleted = TRUE)
UPDATE CUSTOMER SET is_deleted = TRUE, deleted_at = '2024-06-15 16:30:00' WHERE cif_number = 8888999900;

-- Add verification submissions (this might need a separate table in real implementation)
-- For now, we'll use customer_status to indicate verification needs

SELECT 'Sample data inserted successfully!' as result;
