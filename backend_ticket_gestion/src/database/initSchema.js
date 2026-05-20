const db = require('../config/db');

async function initializeMessagingSchema() {
    await db.execute(
        `CREATE TABLE IF NOT EXISTS tickets (
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
        )`
    );

    await db.execute(
        `CREATE TABLE IF NOT EXISTS rooms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id INT NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            room_type VARCHAR(255) NOT NULL,
            allowed_services JSON NOT NULL,
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

    await db.execute(
        `CREATE TABLE IF NOT EXISTS meetings (
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
        )`
    );

    const [meetingIndexes] = await db.execute(
        `SHOW INDEX FROM meetings WHERE Key_name = 'idx_meetings_start_time'`
    );

    if (!meetingIndexes.length) {
        await db.execute(
            `CREATE INDEX idx_meetings_start_time
             ON meetings (start_time_utc)`
        );
    }

    try {
        await db.execute("ALTER TABLE contacts MODIFY COLUMN type VARCHAR(255) NOT NULL");
        console.log("Successfully altered contacts.type column to VARCHAR(255)");
    } catch (err) {
        console.warn("Could not alter contacts.type table:", err.message);
    }

    try {
        const [columns] = await db.execute("SHOW COLUMNS FROM contacts LIKE 'job_title'");
        if (columns.length === 0) {
            await db.execute("ALTER TABLE contacts ADD COLUMN job_title VARCHAR(255) NULL");
            console.log("Successfully added column job_title to contacts table");
        }
    } catch (err) {
        console.warn("Could not check/add job_title column in contacts table:", err.message);
    }
}

module.exports = initializeMessagingSchema;