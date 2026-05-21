--@block
CREATE DATABASE IF NOT EXISTS ticket_gestion;
USE ticket_gestion;

--@block
-- ============================================
-- DROP ALL TABLES (corrected order)
-- ============================================
DROP TABLE IF EXISTS emails;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS meetings;
DROP TABLE IF EXISTS meeting_rooms;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS comments;

-- ============================================
-- 1. SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- ============================================
-- 2. EMPLOYEES
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    userName VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    service_id INT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- ============================================
-- 3. ORGANIZATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    industry VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Applicant', 'Consultant', 'Government Official', 'Legal Representative', 'Technical Expert') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NULL,
    job_title       VARCHAR(255) NULL,
    organization_id INT NULL,
    status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- ============================================
-- 4. TICKETS
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(50) NOT NULL UNIQUE,
    organization_id INT NULL,
    client_id VARCHAR(50) NULL,
    application VARCHAR(255) NOT NULL,
    issue_type VARCHAR(255) NOT NULL,
    issue_level VARCHAR(255) NOT NULL,
    issue_description TEXT NOT NULL,
    status ENUM('Pending', 'Resolved', 'Critical', 'Warning') DEFAULT 'Pending',
    created_by INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- ============================================
-- 5. ROOMS
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(255) NOT NULL,
    allowed_services JSON NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- ============================================
-- 6. MEETING ROOMS (no FK to meetings)
-- ============================================
CREATE TABLE IF NOT EXISTS meeting_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT DEFAULT 10,
    location VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. MEETINGS (references meeting_rooms)
-- ============================================
CREATE TABLE IF NOT EXISTS meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_time_utc DATETIME NOT NULL,
    end_time_utc DATETIME NOT NULL,
    organizer_id INT NOT NULL,
    invitee_id INT NULL,
    ticket_id INT NULL,
    meeting_room_id INT NULL,
    location VARCHAR(255) NULL,
    description TEXT NULL,
    status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    rejection_reason TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (invitee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
    FOREIGN KEY (meeting_room_id) REFERENCES meeting_rooms(id) ON DELETE SET NULL
);

-- ============================================
-- 8. MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    sender_id INT NOT NULL,
    text TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES employees(id) ON DELETE CASCADE
);
-- ============================================
-- EMAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    sender_email VARCHAR(255) NOT NULL,
    sender_fullName VARCHAR(255) NOT NULL,
    sender_organization VARCHAR(255) NULL,
    
    recipient_email VARCHAR(255) NOT NULL,
    
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    
    sent_at DATETIME NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    ticket_id INT NULL,
    
    is_read BOOLEAN DEFAULT FALSE,
   
    
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id INT NOT NULL,
            user_id INT NOT NULL,
            text TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE
        );


CREATE INDEX idx_emails_ticket_id ON emails(ticket_id);
CREATE INDEX idx_emails_sender_email ON emails(sender_email);
CREATE INDEX idx_emails_received_at ON emails(received_at);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts (organization_id);
CREATE INDEX idx_messages_room_created_at ON messages (room_id, createdAt);
CREATE INDEX idx_meetings_start_time ON meetings (start_time_utc);
CREATE INDEX idx_meetings_room_time ON meetings (meeting_room_id, start_time_utc, end_time_utc);

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO services (name) VALUES
('IT'),
('SD'),
('MANAGER'),
('ADMIN'),
('PKI');