const db = require('../config/db');

async function initializeMessagingSchema() {
    await db.execute(
        `CREATE TABLE IF NOT EXISTS tickets (
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
        )`
    );

    await db.execute(
        `CREATE TABLE IF NOT EXISTS rooms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id INT NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            room_type VARCHAR(255) NOT NULL,
            severity VARCHAR(255) NOT NULL,
            allowed_roles JSON NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
        )`
    );

    await db.execute(
        `CREATE TABLE IF NOT EXISTS messages (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            sender_id INT NOT NULL,
            text TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES employees(id) ON DELETE CASCADE
        )`
    );

    const [indexes] = await db.execute(
        `SHOW INDEX FROM messages WHERE Key_name = 'idx_messages_room_created_at'`
    );

    if (!indexes.length) {
        await db.execute(
            `CREATE INDEX idx_messages_room_created_at
             ON messages (room_id, createdAt)`
        );
    }
}

module.exports = initializeMessagingSchema;
