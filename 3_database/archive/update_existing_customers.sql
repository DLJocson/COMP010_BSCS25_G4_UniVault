USE univault_schema;

-- Update some existing customers to have 'Pending Verification' status
UPDATE CUSTOMER 
SET customer_status = 'Pending Verification' 
WHERE cif_number IN (
    SELECT cif_number FROM (
        SELECT cif_number FROM CUSTOMER 
        WHERE customer_status = 'Active' AND is_deleted = FALSE 
        LIMIT 5
    ) AS temp_table
);

-- Add some close requests for existing active customers
INSERT INTO CLOSE_REQUEST (cif_number, request_reason, request_status, request_date) 
SELECT cif_number, 
       CASE 
           WHEN MOD(cif_number, 4) = 0 THEN 'Moving to another country for work'
           WHEN MOD(cif_number, 4) = 1 THEN 'Business closure due to market conditions'
           WHEN MOD(cif_number, 4) = 2 THEN 'Found better banking services elsewhere'
           ELSE 'Personal reasons - switching to digital-only banking'
       END as request_reason,
       'Pending' as request_status,
       DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 7) DAY) as request_date
FROM CUSTOMER 
WHERE customer_status = 'Active' AND is_deleted = FALSE 
AND cif_number NOT IN (SELECT DISTINCT cif_number FROM CLOSE_REQUEST)
LIMIT 3;
