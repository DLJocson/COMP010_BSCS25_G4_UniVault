-- Customer Registration Progress Table
-- This table tracks step-by-step registration progress for customers
USE univault_schema;

CREATE TABLE IF NOT EXISTS CUSTOMER_REGISTRATION_PROGRESS (
    registration_id                VARCHAR(50) PRIMARY KEY,
    cif_number                     BIGINT UNSIGNED NULL, -- Will be assigned when customer record is created
    session_id                     VARCHAR(100) NOT NULL,
    current_step                   INT NOT NULL DEFAULT 1,
    total_steps                    INT NOT NULL DEFAULT 15,
    is_completed                   BOOLEAN DEFAULT FALSE,
    registration_data              JSON, -- Store all form data temporarily
    step_progress                  JSON, -- Track which steps are completed
    created_at                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at                     TIMESTAMP NOT NULL, -- Session expiration
    
    -- Foreign key will be added after customer is created
    INDEX idx_session_id (session_id),
    INDEX idx_cif_number (cif_number),
    INDEX idx_expires_at (expires_at)
);

-- Auto-cleanup expired registrations
DELIMITER $$
CREATE PROCEDURE CleanupExpiredRegistrations()
BEGIN
    DELETE FROM CUSTOMER_REGISTRATION_PROGRESS 
    WHERE expires_at < NOW() AND is_completed = FALSE;
END$$
DELIMITER ;

-- Schedule cleanup to run hourly (this would need to be set up in MySQL Event Scheduler)
-- CREATE EVENT IF NOT EXISTS cleanup_registrations
-- ON SCHEDULE EVERY 1 HOUR
-- DO CALL CleanupExpiredRegistrations();
