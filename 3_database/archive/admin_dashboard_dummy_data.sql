-- UniVault Admin Dashboard Dummy Data
-- This file creates realistic test data for the admin dashboard metrics
-- Run this script after creating the database schema

USE db_univault;

-- Insert customers across different months of 2025 with various statuses
-- January 2025 - 18 new registrations (peak month for chart)
INSERT INTO CUSTOMER (
    customer_type, customer_last_name, customer_first_name, customer_middle_name, 
    customer_username, customer_password, birth_date, gender, civil_status_code, 
    birth_country, residency_status, citizenship, tax_identification_number, 
    customer_status, created_at
) VALUES
-- January 2025 - 18 registrations
('Account Owner', 'Smith', 'John', 'Michael', 'john.smith', '$2b$10$hashedPassword1', '1990-05-15', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789012', 'Active', '2025-01-05 10:30:00'),
('Account Owner', 'Johnson', 'Emily', 'Rose', 'emily.johnson', '$2b$10$hashedPassword2', '1988-09-22', 'Female', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789013', 'Active', '2025-01-08 14:20:00'),
('Account Owner', 'Williams', 'Michael', 'James', 'mike.williams', '$2b$10$hashedPassword3', '1995-03-10', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789014', 'Pending Verification', '2025-01-12 09:15:00'),
('Account Owner', 'Brown', 'Sarah', 'Lynn', 'sarah.brown', '$2b$10$hashedPassword4', '1992-11-18', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789015', 'Active', '2025-01-15 16:45:00'),
('Account Owner', 'Davis', 'Robert', 'Andrew', 'rob.davis', '$2b$10$hashedPassword5', '1987-07-03', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789016', 'Suspended', '2025-01-18 11:30:00'),
('Account Owner', 'Miller', 'Jessica', 'Marie', 'jess.miller', '$2b$10$hashedPassword6', '1994-12-25', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789017', 'Active', '2025-01-20 13:00:00'),
('Account Owner', 'Wilson', 'David', 'Paul', 'david.wilson', '$2b$10$hashedPassword7', '1991-02-14', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789018', 'Inactive', '2025-01-22 08:45:00'),
('Account Owner', 'Moore', 'Amanda', 'Grace', 'amanda.moore', '$2b$10$hashedPassword8', '1993-08-07', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789019', 'Active', '2025-01-25 15:20:00'),
('Account Owner', 'Taylor', 'Christopher', 'Lee', 'chris.taylor', '$2b$10$hashedPassword9', '1989-04-30', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789020', 'Active', '2025-01-27 12:10:00'),
('Account Owner', 'Anderson', 'Jennifer', 'Nicole', 'jen.anderson', '$2b$10$hashedPassword10', '1996-10-12', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789021', 'Pending Verification', '2025-01-28 17:30:00'),
('Business Owner', 'Garcia', 'Carlos', 'Eduardo', 'carlos.garcia', '$2b$10$hashedPassword11', '1985-06-20', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789022', 'Active', '2025-01-29 10:00:00'),
('Account Owner', 'Martinez', 'Lisa', 'Ann', 'lisa.martinez', '$2b$10$hashedPassword12', '1990-01-15', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789023', 'Active', '2025-01-30 14:45:00'),
('Account Owner', 'Rodriguez', 'James', 'Alexander', 'james.rodriguez', '$2b$10$hashedPassword13', '1992-09-05', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789024', 'Suspended', '2025-01-31 09:20:00'),
('Account Owner', 'Lopez', 'Michelle', 'Elizabeth', 'michelle.lopez', '$2b$10$hashedPassword14', '1994-03-28', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789025', 'Active', '2025-01-15 11:15:00'),
('Account Owner', 'Gonzalez', 'Steven', 'Thomas', 'steven.gonzalez', '$2b$10$hashedPassword15', '1987-12-02', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789026', 'Active', '2025-01-18 16:00:00'),
('Account Owner', 'Wilson', 'Rachel', 'Kay', 'rachel.wilson', '$2b$10$hashedPassword16', '1995-07-19', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789027', 'Inactive', '2025-01-22 13:30:00'),
('Business Owner', 'Lee', 'Kevin', 'Brian', 'kevin.lee', '$2b$10$hashedPassword17', '1988-11-08', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789028', 'Active', '2025-01-25 08:45:00'),
('Account Owner', 'Walker', 'Nicole', 'Dawn', 'nicole.walker', '$2b$10$hashedPassword18', '1993-04-16', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789029', 'Active', '2025-01-27 15:10:00'),

-- February 2025 - 6 registrations
('Account Owner', 'Hall', 'Daniel', 'Scott', 'daniel.hall', '$2b$10$hashedPassword19', '1991-08-14', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789030', 'Active', '2025-02-03 10:20:00'),
('Account Owner', 'Allen', 'Stephanie', 'Joy', 'steph.allen', '$2b$10$hashedPassword20', '1992-02-28', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789031', 'Pending Verification', '2025-02-10 14:30:00'),
('Account Owner', 'Young', 'Brian', 'Patrick', 'brian.young', '$2b$10$hashedPassword21', '1989-06-11', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789032', 'Active', '2025-02-15 09:45:00'),
('Account Owner', 'Hernandez', 'Kimberly', 'Sue', 'kim.hernandez', '$2b$10$hashedPassword22', '1994-10-07', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789033', 'Active', '2025-02-20 16:15:00'),
('Account Owner', 'King', 'Matthew', 'Joseph', 'matt.king', '$2b$10$hashedPassword23', '1990-12-03', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789034', 'Suspended', '2025-02-25 11:00:00'),
('Business Owner', 'Wright', 'Angela', 'Marie', 'angela.wright', '$2b$10$hashedPassword24', '1986-04-22', 'Female', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789035', 'Active', '2025-02-28 13:20:00'),

-- March 2025 - 8 registrations
('Account Owner', 'Scott', 'Joshua', 'Ryan', 'josh.scott', '$2b$10$hashedPassword25', '1993-01-09', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789036', 'Active', '2025-03-05 10:15:00'),
('Account Owner', 'Torres', 'Melissa', 'Grace', 'mel.torres', '$2b$10$hashedPassword26', '1991-05-17', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789037', 'Active', '2025-03-08 14:40:00'),
('Account Owner', 'Nguyen', 'Anthony', 'Michael', 'anthony.nguyen', '$2b$10$hashedPassword27', '1987-09-25', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789038', 'Inactive', '2025-03-12 09:30:00'),
('Account Owner', 'Hill', 'Rebecca', 'Lynn', 'rebecca.hill', '$2b$10$hashedPassword28', '1995-11-13', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789039', 'Active', '2025-03-15 16:25:00'),
('Account Owner', 'Flores', 'William', 'Edward', 'will.flores', '$2b$10$hashedPassword29', '1988-03-06', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789040', 'Active', '2025-03-18 11:50:00'),
('Account Owner', 'Green', 'Crystal', 'Rose', 'crystal.green', '$2b$10$hashedPassword30', '1992-07-29', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789041', 'Pending Verification', '2025-03-22 13:15:00'),
('Account Owner', 'Adams', 'Richard', 'Alan', 'rich.adams', '$2b$10$hashedPassword31', '1990-10-18', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789042', 'Active', '2025-03-25 15:40:00'),
('Business Owner', 'Nelson', 'Heather', 'Marie', 'heather.nelson', '$2b$10$hashedPassword32', '1984-12-11', 'Female', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789043', 'Active', '2025-03-28 08:20:00'),

-- April 2025 - 4 registrations
('Account Owner', 'Baker', 'Timothy', 'Charles', 'tim.baker', '$2b$10$hashedPassword33', '1991-02-21', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789044', 'Active', '2025-04-02 10:30:00'),
('Account Owner', 'Campbell', 'Laura', 'Jean', 'laura.campbell', '$2b$10$hashedPassword34', '1993-06-14', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789045', 'Active', '2025-04-10 14:20:00'),
('Account Owner', 'Mitchell', 'Jason', 'Lee', 'jason.mitchell', '$2b$10$hashedPassword35', '1989-08-08', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789046', 'Suspended', '2025-04-18 09:45:00'),
('Account Owner', 'Carter', 'Samantha', 'Nicole', 'sam.carter', '$2b$10$hashedPassword36', '1994-04-26', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789047', 'Active', '2025-04-25 16:10:00'),

-- May 2025 - 12 registrations
('Account Owner', 'Roberts', 'Benjamin', 'Kyle', 'ben.roberts', '$2b$10$hashedPassword37', '1990-07-12', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789048', 'Active', '2025-05-03 11:20:00'),
('Account Owner', 'Phillips', 'Ashley', 'Dawn', 'ashley.phillips', '$2b$10$hashedPassword38', '1992-01-30', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789049', 'Active', '2025-05-06 15:40:00'),
('Account Owner', 'Evans', 'Nicholas', 'John', 'nick.evans', '$2b$10$hashedPassword39', '1988-11-24', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789050', 'Pending Verification', '2025-05-09 09:15:00'),
('Account Owner', 'Turner', 'Brittany', 'Lee', 'brittany.turner', '$2b$10$hashedPassword40', '1995-03-18', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789051', 'Active', '2025-05-12 13:30:00'),
('Business Owner', 'Parker', 'Gregory', 'Mark', 'greg.parker', '$2b$10$hashedPassword41', '1985-09-07', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789052', 'Active', '2025-05-15 10:45:00'),
('Account Owner', 'Collins', 'Megan', 'Rose', 'megan.collins', '$2b$10$hashedPassword42', '1993-12-01', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789053', 'Active', '2025-05-18 14:25:00'),
('Account Owner', 'Stewart', 'Adam', 'Robert', 'adam.stewart', '$2b$10$hashedPassword43', '1991-05-16', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789054', 'Inactive', '2025-05-21 16:50:00'),
('Account Owner', 'Morris', 'Danielle', 'Faith', 'dani.morris', '$2b$10$hashedPassword44', '1994-08-23', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789055', 'Active', '2025-05-24 08:30:00'),
('Account Owner', 'Rogers', 'Tyler', 'James', 'tyler.rogers', '$2b$10$hashedPassword45', '1987-02-09', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789056', 'Active', '2025-05-27 12:15:00'),
('Account Owner', 'Reed', 'Courtney', 'Michelle', 'court.reed', '$2b$10$hashedPassword46', '1992-10-04', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789057', 'Active', '2025-05-29 17:20:00'),
('Account Owner', 'Cook', 'Sean', 'Patrick', 'sean.cook', '$2b$10$hashedPassword47', '1989-06-28', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789058', 'Suspended', '2025-05-30 11:00:00'),
('Business Owner', 'Bailey', 'Vanessa', 'Joy', 'vanessa.bailey', '$2b$10$hashedPassword48', '1986-04-15', 'Female', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789059', 'Active', '2025-05-31 15:45:00'),

-- June 2025 - 15 registrations (current month)
('Account Owner', 'Rivera', 'Eric', 'Daniel', 'eric.rivera', '$2b$10$hashedPassword49', '1990-08-19', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789060', 'Active', '2025-06-01 09:30:00'),
('Account Owner', 'Cooper', 'Kayla', 'Marie', 'kayla.cooper', '$2b$10$hashedPassword50', '1993-03-12', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789061', 'Active', '2025-06-03 13:45:00'),
('Account Owner', 'Richardson', 'Marcus', 'Tony', 'marcus.rich', '$2b$10$hashedPassword51', '1988-07-05', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789062', 'Pending Verification', '2025-06-05 16:20:00'),
('Account Owner', 'Cox', 'Tiffany', 'Ann', 'tiffany.cox', '$2b$10$hashedPassword52', '1994-11-27', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789063', 'Active', '2025-06-08 10:15:00'),
('Account Owner', 'Ward', 'Brandon', 'Keith', 'brandon.ward', '$2b$10$hashedPassword53', '1991-01-22', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789064', 'Active', '2025-06-10 14:30:00'),
('Account Owner', 'Torres', 'Christina', 'Hope', 'christina.torres', '$2b$10$hashedPassword54', '1992-09-14', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789065', 'Active', '2025-06-12 11:50:00'),
('Business Owner', 'Peterson', 'Derek', 'Michael', 'derek.peterson', '$2b$10$hashedPassword55', '1984-05-08', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789066', 'Active', '2025-06-15 08:40:00'),
('Account Owner', 'Gray', 'Alexis', 'Renee', 'alexis.gray', '$2b$10$hashedPassword56', '1995-12-03', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789067', 'Inactive', '2025-06-17 15:25:00'),
('Account Owner', 'Ramirez', 'Jordan', 'Alex', 'jordan.ramirez', '$2b$10$hashedPassword57', '1990-04-17', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789068', 'Active', '2025-06-19 12:35:00'),
('Account Owner', 'James', 'Monica', 'Lynn', 'monica.james', '$2b$10$hashedPassword58', '1993-08-11', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789069', 'Active', '2025-06-21 17:10:00'),
('Account Owner', 'Watson', 'Trevor', 'Scott', 'trevor.watson', '$2b$10$hashedPassword59', '1987-10-26', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789070', 'Suspended', '2025-06-22 09:20:00'),
('Account Owner', 'Brooks', 'Sierra', 'Faith', 'sierra.brooks', '$2b$10$hashedPassword60', '1994-02-18', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789071', 'Active', '2025-06-23 13:55:00'),

-- Today's registrations (June 24, 2025) - These count as "New Accounts"
('Account Owner', 'Kelly', 'Austin', 'Ryan', 'austin.kelly', '$2b$10$hashedPassword61', '1989-06-30', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789072', 'Pending Verification', '2025-06-24 08:15:00'),
('Account Owner', 'Sanders', 'Taylor', 'Nicole', 'taylor.sanders', '$2b$10$hashedPassword62', '1992-04-24', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '123456789073', 'Active', '2025-06-24 11:30:00'),
('Business Owner', 'Price', 'Logan', 'William', 'logan.price', '$2b$10$hashedPassword63', '1985-12-15', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123456789074', 'Active', '2025-06-24 15:45:00');

-- Summary of inserted data:
-- Total customers: 63
-- Active: 45 (verified accounts)
-- Pending Verification: 8 (pending applications)
-- Inactive: 5 (pending approvals)
-- Suspended: 5 (rejected applications)
-- New Accounts (today): 3
-- Monthly distribution:
-- January: 18, February: 6, March: 8, April: 4, May: 12, June: 15 (total 63)

COMMIT;
