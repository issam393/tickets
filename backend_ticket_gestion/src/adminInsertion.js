const bcrypt = require('bcrypt');
const db = require('./config/db');

async function seed() {

    const password = "papa"
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
        `INSERT INTO employees (firstName, lastName, email, userName, phone, password, service_id, role_id, status)
         VALUES (?, ?, ?, ?, ?, ?, (SELECT id FROM services WHERE name='ADMIN'), (SELECT id FROM roles WHERE name='ADMIN'), 'Active')`,
        ['papa', 'ouladsmane', 'issamm@system.com', 'papa', '06123445678', hashedPassword]
    );

    console.log('Admin created');
    await db.end();
}

seed();