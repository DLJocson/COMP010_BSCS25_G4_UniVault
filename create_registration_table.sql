CREATE TABLE IF NOT EXISTS CUSTOMER_REGISTRATION_PROGRESS (
    registration_id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(255),
    current_step INT DEFAULT 1,
    total_steps INT DEFAULT 15,
    registration_data JSON,
    step_progress JSON,
    cif_number BIGINT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_cif_number (cif_number)
);
