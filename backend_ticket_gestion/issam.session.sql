
--@block 

CREATE DATABASE IF NOT EXISTS ticket_gestion;
USE ticket_gestion;


--@block
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);


CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    userName VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    service_id INT,
    role_id INT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

--@block
INSERT INTO services (name) VALUES ('IT'), ('SD'), ('MANAGER'), ('ADMIN'), ('PKI');
INSERT INTO roles (name) VALUES ('TECHNICIAN'), ('AGENT'), ('ADMIN');

--@block
SELECT * from employees;
SELECT * from services;
SELECT * FROM roles

--@block
DELETE from employees where id = 11


--@block
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(50) NOT NULL UNIQUE,
    client_id VARCHAR(50) NULL,
    application VARCHAR(255) NOT NULL,
    issue_type VARCHAR(255) NOT NULL,
    issue_level VARCHAR(255) NOT NULL,
    issue_description TEXT NOT NULL,
    status ENUM('Pending', 'Resolved', 'Skipped') DEFAULT 'Pending',
    created_by INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(255) NOT NULL,
    severity VARCHAR(255) NOT NULL,
    allowed_roles JSON NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    sender_id INT NOT NULL,
    text TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_room_created_at ON messages (room_id, createdAt);

--@block
CREATE TABLE IF NOT EXISTS meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_time_utc VARCHAR(35) NOT NULL,
    end_time_utc VARCHAR(35) NOT NULL,
    organizer_id INT NOT NULL,
    invitee_id INT NULL,
    ticket_id INT NULL,
    location VARCHAR(255) NULL,
    description TEXT NULL,
    status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    rejection_reason TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (invitee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL
);

CREATE INDEX idx_meetings_start_time ON meetings (start_time_utc);
