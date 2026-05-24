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
            status ENUM('Pending', 'In Progress', 'Warning', 'Critical', 'Resolved') DEFAULT 'Pending',
            created_by INT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
            FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE CASCADE
        )`
    );

    try {
        await db.execute("ALTER TABLE tickets MODIFY COLUMN status ENUM('Pending', 'Open', 'In Progress', 'Warning', 'Critical', 'Resolved') DEFAULT 'Pending'");
        await db.execute("UPDATE tickets SET status = 'Pending' WHERE status IN ('Open')");
        await db.execute("ALTER TABLE tickets MODIFY COLUMN status ENUM('Pending', 'In Progress', 'Warning', 'Critical', 'Resolved') DEFAULT 'Pending'");
    } catch (err) {
        console.warn("Could not normalize ticket status column:", err.message);
    }

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
        `CREATE TABLE IF NOT EXISTS ticket_assignment_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id INT NOT NULL,
            previous_service VARCHAR(50) NULL,
            new_service VARCHAR(50) NOT NULL,
            assigned_by INT NOT NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            action_type VARCHAR(50) DEFAULT 'assigned',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE CASCADE
        )`
    );

    try {
        const [columns] = await db.execute("SHOW COLUMNS FROM ticket_assignment_history LIKE 'action_type'");
        if (columns.length === 0) {
            await db.execute("ALTER TABLE ticket_assignment_history ADD COLUMN action_type VARCHAR(50) DEFAULT 'assigned'");
        }
        const [createdColumns] = await db.execute("SHOW COLUMNS FROM ticket_assignment_history LIKE 'created_at'");
        if (createdColumns.length === 0) {
            await db.execute("ALTER TABLE ticket_assignment_history ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        }
    } catch (err) {
        console.warn("Could not update ticket_assignment_history table:", err.message);
    }

    const [assignmentIndexes] = await db.execute(
        `SHOW INDEX FROM ticket_assignment_history WHERE Key_name = 'idx_ticket_assignment_history_ticket'`
    );

    if (!assignmentIndexes.length) {
        await db.execute(
            `CREATE INDEX idx_ticket_assignment_history_ticket
             ON ticket_assignment_history (ticket_id, assigned_at)`
        );
    }

    await db.execute(
        `CREATE TABLE IF NOT EXISTS activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            actor_employee_id INT NULL,
            actor_role VARCHAR(50) NULL,
            action_type VARCHAR(80) NOT NULL,
            entity_type VARCHAR(80) NOT NULL,
            entity_id INT NULL,
            description TEXT NOT NULL,
            metadata JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (actor_employee_id) REFERENCES employees(id) ON DELETE SET NULL
        )`
    );

    const [activityIndexes] = await db.execute(
        `SHOW INDEX FROM activity_logs WHERE Key_name = 'idx_activity_logs_created_at'`
    );

    if (!activityIndexes.length) {
        await db.execute(
            `CREATE INDEX idx_activity_logs_created_at
             ON activity_logs (created_at)`
        );
    }

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
        `CREATE TABLE IF NOT EXISTS room_message_reads (
            room_id INT NOT NULL,
            employee_id INT NOT NULL,
            last_read_message_id BIGINT NULL,
            read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (room_id, employee_id),
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )`
    );

    await db.execute(
        `CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id INT NOT NULL,
            user_id INT NOT NULL,
            text TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE
        )`
    );

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

    await db.execute(
        `CREATE TABLE IF NOT EXISTS client_emails (
            id INT AUTO_INCREMENT PRIMARY KEY,
            contact_id INT NOT NULL,
            sender_email VARCHAR(255) NOT NULL,
            recipient_service VARCHAR(50) NOT NULL DEFAULT 'SD',
            source_message_id VARCHAR(255) NULL,
            subject VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
        )`
    );

    try {
        const [serviceColumns] = await db.execute("SHOW COLUMNS FROM client_emails LIKE 'recipient_service'");
        if (serviceColumns.length === 0) {
            await db.execute(
                "ALTER TABLE client_emails ADD COLUMN recipient_service VARCHAR(50) NOT NULL DEFAULT 'SD' AFTER sender_email"
            );
        }
        const [sourceColumns] = await db.execute("SHOW COLUMNS FROM client_emails LIKE 'source_message_id'");
        if (sourceColumns.length === 0) {
            await db.execute(
                "ALTER TABLE client_emails ADD COLUMN source_message_id VARCHAR(255) NULL AFTER recipient_service"
            );
        }
        await db.execute("UPDATE client_emails SET recipient_service = 'SD' WHERE recipient_service IS NULL OR recipient_service <> 'SD'");

        // Older drafts stored a personal destination. Keep the migration non-destructive
        // structurally, but clear its value because email ownership is now team-based.
        const [legacyRecipientColumns] = await db.execute("SHOW COLUMNS FROM client_emails LIKE 'recipient_email'");
        if (legacyRecipientColumns.length > 0) {
            await db.execute("ALTER TABLE client_emails MODIFY COLUMN recipient_email VARCHAR(255) NULL");
            await db.execute("UPDATE client_emails SET recipient_email = NULL");
        }
    } catch (err) {
        console.warn("Could not apply shared Service Delivery inbox migration:", err.message);
    }

    await db.execute(
        `CREATE TABLE IF NOT EXISTS client_email_attachments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email_id INT NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            mime_type VARCHAR(150) NULL,
            file_url LONGTEXT NOT NULL,
            size_bytes BIGINT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (email_id) REFERENCES client_emails(id) ON DELETE CASCADE
        )`
    );

    const [emailIndexes] = await db.execute(
        `SHOW INDEX FROM client_emails WHERE Key_name = 'idx_client_emails_received_at'`
    );

    if (!emailIndexes.length) {
        await db.execute(
            `CREATE INDEX idx_client_emails_received_at
             ON client_emails (received_at)`
        );
    }

    const [sourceMessageIndexes] = await db.execute(
        `SHOW INDEX FROM client_emails WHERE Key_name = 'idx_client_emails_source_message'`
    );

    if (!sourceMessageIndexes.length) {
        await db.execute(
            `CREATE UNIQUE INDEX idx_client_emails_source_message
             ON client_emails (source_message_id)`
        );
    }

    const [attachmentIndexes] = await db.execute(
        `SHOW INDEX FROM client_email_attachments WHERE Key_name = 'idx_email_attachments_email'`
    );

    if (!attachmentIndexes.length) {
        await db.execute(
            `CREATE INDEX idx_email_attachments_email
             ON client_email_attachments (email_id)`
        );
    }

    await db.execute(
        `CREATE TABLE IF NOT EXISTS client_email_reads (
            email_id INT NOT NULL,
            employee_id INT NOT NULL,
            read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (email_id, employee_id),
            FOREIGN KEY (email_id) REFERENCES client_emails(id) ON DELETE CASCADE,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )`
    );
}

module.exports = initializeMessagingSchema;

