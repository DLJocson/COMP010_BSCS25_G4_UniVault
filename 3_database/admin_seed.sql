-- UniVault Admin User Seed Data
USE univault_schema;

-- Create admin table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user
-- Password: Admin@123
INSERT INTO admin (username, email, password_hash, first_name, last_name, role, status) VALUES
('admin', 'admin@univault.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeGFV0fB5s1L.QnQS', 'System', 'Administrator', 'admin', 'ACTIVE');

-- Insert additional admin users for testing
-- Password: Manager@123
INSERT INTO admin (username, email, password_hash, first_name, last_name, role, status) VALUES
('manager', 'manager@univault.com', '$2b$12$QKv4d2zrCXWIylr1MICsKuY.7UuyNRKqlO9/MfHHW1gC6t2M.RsRS', 'Account', 'Manager', 'admin', 'ACTIVE');

-- Password: Support@123
INSERT INTO admin (username, email, password_hash, first_name, last_name, role, status) VALUES
('support', 'support@univault.com', '$2b$12$RLw5e3AsEYXJzmq2NJDtLvZ.8VvzOSLrmP0/NgIIX2hD7u3N.SuTU', 'Customer', 'Support', 'admin', 'ACTIVE');

SELECT 'Admin users created successfully' as result;
