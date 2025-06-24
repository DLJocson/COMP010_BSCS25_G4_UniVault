-- EASY
-- \\\\\\\\\\\\\

USE univault_schema;
SELECT 
    customer_first_name, 
    customer_last_name, 
    birth_date,
    TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age
FROM CUSTOMER
WHERE gender = 'Male';


USE univault_schema;
SELECT 
    ca.cif_number, 
    ad.account_number, 
    ad.account_open_date, 
    ad.account_status
FROM 
    ACCOUNT_DETAILS AS ad
JOIN 
    CUSTOMER_ACCOUNT AS ca 
    ON ad.account_number = ca.account_number
WHERE 
    ad.account_status = 'Active';


USE univault_schema;
SELECT 
    cif_number, 
    CONCAT(customer_first_name, ' ', customer_last_name) AS full_name
FROM 
    CUSTOMER
WHERE 
    civil_status_code = 'CS02';
    
-- Moderate
-- \\\\\\\\\\\\\

USE univault_schema;
SELECT 
    cst.civil_status_description, 
    COUNT(c.cif_number) AS number_of_customers
FROM 
    CUSTOMER AS c
JOIN 
    CIVIL_STATUS_TYPE AS cst 
    ON c.civil_status_code = cst.civil_status_code
GROUP BY 
    cst.civil_status_description
ORDER BY 
    number_of_customers DESC;

USE univault_schema;
SELECT 
    cpt.product_type_name, 
    COUNT(ad.account_number) AS number_of_accounts
FROM 
    ACCOUNT_DETAILS AS ad
JOIN 
    CUSTOMER_PRODUCT_TYPE AS cpt 
    ON ad.product_type_code = cpt.product_type_code
GROUP BY 
    cpt.product_type_name
HAVING 
    COUNT(ad.account_number) > 1
ORDER BY 
    number_of_accounts DESC;
    

USE univault_schema;
SELECT 
    c.cif_number, 
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) AS full_name
FROM 
    CUSTOMER AS c
JOIN 
    CUSTOMER_ADDRESS AS ca 
    ON c.cif_number = ca.cif_number
WHERE 
    ca.address_type_code = 'AD01' 
    AND ca.address_province = 'Metro Manila';


USE univault_schema;
SELECT 
    be.employee_id, 
    CONCAT(be.employee_first_name, ' ', be.employee_last_name) AS employee_full_name, 
    COUNT(ad.account_number) AS total_accounts_verified
FROM 
    ACCOUNT_DETAILS AS ad
JOIN 
    BANK_EMPLOYEE AS be 
    ON ad.verified_by_employee = be.employee_id
GROUP BY 
    be.employee_id, 
    employee_full_name
HAVING 
    COUNT(ad.account_number) >= 1
ORDER BY 
    total_accounts_verified DESC;

-- Difficult
-- \\\\\\\\\\\\\

USE univault_schema;
SELECT DISTINCT 
    CONCAT(c.customer_first_name, ' ', c.customer_last_name) AS full_name
FROM 
    CUSTOMER AS c
JOIN 
    CUSTOMER_ACCOUNT AS ca 
    ON c.cif_number = ca.cif_number
JOIN 
    ACCOUNT_DETAILS AS ad 
    ON ca.account_number = ad.account_number
WHERE 
    ad.account_status = 'Active'
    AND c.cif_number IN (
        SELECT cif_number 
        FROM CUSTOMER_ADDRESS 
        WHERE address_type_code = 'AD03' -- Work Address
          AND address_province = 'Metro Manila'
    )
    AND c.cif_number IN (
        SELECT cif_number 
        FROM CUSTOMER_ADDRESS 
        WHERE address_type_code = 'AD01' -- Home Address
          AND address_province = 'Metro Manila'
    )
ORDER BY 
    full_name;

USE univault_schema;
SELECT DISTINCT 
    CONCAT(be.employee_first_name, ' ', be.employee_last_name) AS employee_full_name
FROM 
    BANK_EMPLOYEE AS be
JOIN 
    ACCOUNT_DETAILS AS ad_verified 
    ON be.employee_id = ad_verified.verified_by_employee
JOIN 
    ACCOUNT_DETAILS AS ad_approved 
    ON be.employee_id = ad_approved.approved_by_employee
JOIN 
    CUSTOMER_PRODUCT_TYPE AS cpt_v 
    ON ad_verified.product_type_code = cpt_v.product_type_code
JOIN 
    CUSTOMER_PRODUCT_TYPE AS cpt_a 
    ON ad_approved.product_type_code = cpt_a.product_type_code
WHERE 
    cpt_v.product_type_name = 'Deposits' 
    AND cpt_a.product_type_name = 'Deposits';
    

USE univault_schema;
SELECT DISTINCT 
    c.customer_first_name, 
    c.customer_last_name
FROM 
    CUSTOMER AS c
JOIN 
    CUSTOMER_ACCOUNT AS ca 
    ON c.cif_number = ca.cif_number
JOIN 
    ACCOUNT_DETAILS AS ad 
    ON ca.account_number = ad.account_number
JOIN 
    CUSTOMER_EMPLOYMENT_INFORMATION AS cei 
    ON c.cif_number = cei.cif_number
WHERE 
    ad.account_status = 'Active' 
    AND cei.income_monthly_gross > 70000.00
ORDER BY 
    c.customer_last_name, 
    c.customer_first_name;
    
