USE univault_schema;

-- Clean up existing test data
DELETE FROM CUSTOMER_CONTACT_DETAILS WHERE cif_number IN (1234567891, 1234567892, 1234567893, 1234567894, 1234567895, 1234567896, 1234567897, 1234567898, 2234567891, 2234567892, 2234567893, 2234567894, 2234567895);
DELETE FROM CUSTOMER WHERE cif_number IN (1234567891, 1234567892, 1234567893, 1234567894, 1234567895, 1234567896, 1234567897, 1234567898, 2234567891, 2234567892, 2234567893, 2234567894, 2234567895);
DELETE FROM CLOSE_REQUEST WHERE cif_number IN (1234567891, 1234567892, 1234567893, 1234567894, 1234567895, 1234567896, 1234567897, 1234567898, 2234567891, 2234567892, 2234567893, 2234567894, 2234567895);

-- Add customers with 'Pending Verification' status - using minimal required fields
INSERT INTO CUSTOMER (
    cif_number, customer_username, customer_password, customer_type, customer_first_name, customer_last_name, 
    customer_middle_name, customer_suffix_name, birth_date, gender, 
    citizenship, birth_country, civil_status_code, customer_status, is_deleted
) VALUES 
-- Unverified Accounts for Verification Queue
(1234567891, 'maria_santos91', 'temp_password', 'Individual', 'Maria', 'Santos', 'dela Cruz', NULL, '1990-05-15', 'Female', 'Filipino', 'Philippines', 'CS01', 'Pending Verification', FALSE),
(1234567892, 'juan_reyes92', 'temp_password', 'Individual', 'Juan', 'Reyes', 'Mendoza', 'Jr.', '1985-12-03', 'Male', 'Filipino', 'Philippines', 'CS02', 'Pending Verification', FALSE),
(1234567893, 'ana_garcia93', 'temp_password', 'Business Owner', 'Ana', 'Garcia', 'Rodriguez', NULL, '1978-08-22', 'Female', 'Filipino', 'Philippines', 'CS01', 'Pending Verification', FALSE),
(1234567894, 'carlos_lopez94', 'temp_password', 'Individual', 'Carlos', 'Lopez', 'Fernandez', NULL, '1992-03-10', 'Male', 'Filipino', 'Philippines', 'CS01', 'Pending Verification', FALSE),
(1234567895, 'sofia_martinez95', 'temp_password', 'Business Owner', 'Sofia', 'Martinez', 'Gonzalez', NULL, '1983-11-28', 'Female', 'Filipino', 'Philippines', 'CS03', 'Pending Verification', FALSE),

-- Active Customers for Close Requests  
(2234567891, 'lisa_wong91', 'temp_password', 'Individual', 'Lisa', 'Wong', 'Chen', NULL, '1991-04-12', 'Female', 'Filipino', 'Philippines', 'CS01', 'Active', FALSE),
(2234567892, 'roberto_silva92', 'temp_password', 'Business Owner', 'Roberto', 'Silva', 'Pereira', NULL, '1980-06-08', 'Male', 'Filipino', 'Philippines', 'CS02', 'Active', FALSE),
(2234567893, 'elena_vargas93', 'temp_password', 'Individual', 'Elena', 'Vargas', 'Castillo', NULL, '1987-10-16', 'Female', 'Filipino', 'Philippines', 'CS01', 'Active', FALSE);

-- Add contact details for these customers
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
-- Email addresses (CT01)
(1234567891, 'CT01', 'maria.santos@email.com'),
(1234567892, 'CT01', 'juan.reyes@email.com'),
(1234567893, 'CT01', 'ana.garcia@business.com'),
(1234567894, 'CT01', 'carlos.lopez@email.com'),
(1234567895, 'CT01', 'sofia.martinez@company.com'),
(2234567891, 'CT01', 'lisa.wong@email.com'),
(2234567892, 'CT01', 'roberto.silva@business.com'),
(2234567893, 'CT01', 'elena.vargas@email.com'),

-- Phone numbers (CT02)
(1234567891, 'CT02', '+63 9171234567'),
(1234567892, 'CT02', '+63 9182345678'),
(1234567893, 'CT02', '+63 9193456789'),
(1234567894, 'CT02', '+63 9204567890'),
(1234567895, 'CT02', '+63 9215678901'),
(2234567891, 'CT02', '+63 9259012345'),
(2234567892, 'CT02', '+63 9260123456'),
(2234567893, 'CT02', '+63 9271234567');

-- Clear existing close requests and add new ones
DELETE FROM CLOSE_REQUEST;

-- Add close requests for the active customers
INSERT INTO CLOSE_REQUEST (
    cif_number, request_reason, request_status, request_date
) VALUES 
(2234567891, 'Moving to another country for work', 'Pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2234567892, 'Business closure due to market conditions', 'Pending', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2234567893, 'Found better banking services elsewhere', 'Pending', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(5821947360, 'Personal reasons - switching to digital-only banking', 'Pending', DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- Update timestamps to make them more realistic
UPDATE CUSTOMER 
SET created_at = DATE_SUB(NOW(), INTERVAL FLOOR(1 + RAND() * 10) DAY)
WHERE customer_status = 'Pending Verification';
