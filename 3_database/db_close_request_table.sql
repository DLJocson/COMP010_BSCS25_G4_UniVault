USE univault_schema;

-- Drop existing table if it exists to avoid conflicts
DROP TABLE IF EXISTS CLOSE_REQUEST;

-- Create CLOSE_REQUEST table for tracking account closure requests
-- Using BIGINT for cif_number to match CUSTOMER table
CREATE TABLE CLOSE_REQUEST (
    close_request_id INT AUTO_INCREMENT,
    cif_number BIGINT NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    request_reason TEXT,
    request_status ENUM('Pending', 'Approved', 'Rejected', 'Processed') DEFAULT 'Pending',
    processed_by VARCHAR(50),
    processed_date DATETIME,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- KEY CONSTRAINTS
    PRIMARY KEY (close_request_id),
    
    -- Remove foreign key constraints for now to avoid issues
    -- FOREIGN KEY (cif_number) REFERENCES CUSTOMER(cif_number),
    -- FOREIGN KEY (processed_by) REFERENCES BANK_EMPLOYEE(employee_username),
    
    -- INDEX for better performance
    INDEX idx_cif_number (cif_number),
    INDEX idx_request_status (request_status),
    INDEX idx_request_date (request_date)
);

-- Insert some sample close request data for testing  
INSERT INTO CLOSE_REQUEST (cif_number, request_reason, request_status) VALUES
(5821947360, 'Customer wishes to close account due to relocation', 'Pending'),
(1234567890, 'Dissatisfied with service quality', 'Pending'),
(9876543210, 'Found better banking alternatives', 'Approved');
