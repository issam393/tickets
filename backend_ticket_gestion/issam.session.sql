
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


