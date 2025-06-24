USE univault_schema;

-- First, let's add some customers with 'Pending Verification' status for the verification queue
INSERT INTO CUSTOMER (
    cif_number, customer_type, customer_first_name, customer_last_name, 
    customer_middle_name, customer_suffix_name, birth_date, 
    gender, civil_status_code, customer_status, is_deleted
) VALUES 
-- Unverified Accounts for Verification Queue
(1234567891, 'Individual', 'Maria', 'Santos', 'dela Cruz', NULL, '1990-05-15', 'Female', 'CS01', 'Pending Verification', FALSE),
(1234567892, 'Individual', 'Juan', 'Reyes', 'Mendoza', 'Jr.', '1985-12-03', 'Male', 'CS02', 'Pending Verification', FALSE),
(1234567893, 'Business Owner', 'Ana', 'Garcia', 'Rodriguez', NULL, '1978-08-22', 'Female', 'CS01', 'Pending Verification', FALSE),
(1234567894, 'Individual', 'Carlos', 'Lopez', 'Fernandez', NULL, '1992-03-10', 'Male', 'CS01', 'Pending Verification', FALSE),
(1234567895, 'Business Owner', 'Sofia', 'Martinez', 'Gonzalez', NULL, '1983-11-28', 'Female', 'CS03', 'Pending Verification', FALSE),
(1234567896, 'Individual', 'Miguel', 'Torres', 'Jimenez', 'III', '1995-07-14', 'Male', 'CS01', 'Pending Verification', FALSE),
(1234567897, 'Individual', 'Carmen', 'Flores', 'Morales', NULL, '1988-01-20', 'Female', 'CS02', 'Pending Verification', FALSE),
(1234567898, 'Business Owner', 'Pedro', 'Valdez', 'Herrera', NULL, '1975-09-05', 'Male', 'CS02', 'Pending Verification', FALSE),

-- Active Customers for Close Requests
(2234567891, 'Individual', 'Lisa', 'Wong', 'Chen', NULL, '1991-04-12', 'Female', 'CS01', 'Active', FALSE),
(2234567892, 'Business Owner', 'Roberto', 'Silva', 'Pereira', NULL, '1980-06-08', 'Male', 'CS02', 'Active', FALSE),
(2234567893, 'Individual', 'Elena', 'Vargas', 'Castillo', NULL, '1987-10-16', 'Female', 'CS01', 'Active', FALSE),
(2234567894, 'Individual', 'Diego', 'Moreno', 'Ramirez', 'Jr.', '1993-02-25', 'Male', 'CS01', 'Active', FALSE),
(2234567895, 'Business Owner', 'Isabel', 'Gutierrez', 'Mendez', NULL, '1982-12-30', 'Female', 'CS03', 'Active', FALSE);

-- Add contact details for these customers
INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value) VALUES
-- Email addresses (CT01)
(1234567891, 'CT01', 'maria.santos@email.com'),
(1234567892, 'CT01', 'juan.reyes@email.com'),
(1234567893, 'CT01', 'ana.garcia@business.com'),
(1234567894, 'CT01', 'carlos.lopez@email.com'),
(1234567895, 'CT01', 'sofia.martinez@company.com'),
(1234567896, 'CT01', 'miguel.torres@email.com'),
(1234567897, 'CT01', 'carmen.flores@email.com'),
(1234567898, 'CT01', 'pedro.valdez@enterprise.com'),
(2234567891, 'CT01', 'lisa.wong@email.com'),
(2234567892, 'CT01', 'roberto.silva@business.com'),
(2234567893, 'CT01', 'elena.vargas@email.com'),
(2234567894, 'CT01', 'diego.moreno@email.com'),
(2234567895, 'CT01', 'isabel.gutierrez@company.com'),

-- Phone numbers (CT02)
(1234567891, 'CT02', '+63 9171234567'),
(1234567892, 'CT02', '+63 9182345678'),
(1234567893, 'CT02', '+63 9193456789'),
(1234567894, 'CT02', '+63 9204567890'),
(1234567895, 'CT02', '+63 9215678901'),
(1234567896, 'CT02', '+63 9226789012'),
(1234567897, 'CT02', '+63 9237890123'),
(1234567898, 'CT02', '+63 9248901234'),
(2234567891, 'CT02', '+63 9259012345'),
(2234567892, 'CT02', '+63 9260123456'),
(2234567893, 'CT02', '+63 9271234567'),
(2234567894, 'CT02', '+63 9282345678'),
(2234567895, 'CT02', '+63 9293456789');

-- Clear existing close requests and add new ones
DELETE FROM CLOSE_REQUEST;

-- Add close requests for the active customers
INSERT INTO CLOSE_REQUEST (
    cif_number, request_reason, request_status, request_date
) VALUES 
(2234567891, 'Moving to another country for work', 'Pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2234567892, 'Business closure due to market conditions', 'Pending', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2234567893, 'Found better banking services elsewhere', 'Pending', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2234567894, 'Account no longer needed after debt consolidation', 'Pending', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(2234567895, 'Company restructuring requires new banking arrangements', 'Pending', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(5821947360, 'Personal reasons - switching to digital-only banking', 'Pending', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(1234567890, 'Dissatisfied with customer service response times', 'Pending', DATE_SUB(NOW(), INTERVAL 8 HOUR));

-- Update timestamps to make them more realistic
UPDATE CUSTOMER 
SET created_at = DATE_SUB(NOW(), INTERVAL FLOOR(1 + RAND() * 10) DAY)
WHERE customer_status = 'Pending Verification';

-- Verify our data
SELECT 'Pending Verifications Count:' as info, COUNT(*) as count FROM CUSTOMER WHERE customer_status = 'Pending Verification' AND is_deleted = FALSE
UNION ALL
SELECT 'Close Requests Count:' as info, COUNT(*) as count FROM CLOSE_REQUEST WHERE request_status = 'Pending';
