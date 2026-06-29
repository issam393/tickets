const bcrypt = require('bcrypt');
const db = require('./config/db');

async function seed() {
    const password = "anisse";
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
        `INSERT INTO employees (firstName, lastName, email, userName, password, service_id, status)
         VALUES (?, ?, ?, ?, ?, (SELECT id FROM services WHERE name='ADMIN'), 'Active')`,
        ['Anisse', 'Ouladsmane', 'anisse@system.com', 'anisse', hashedPassword]
    );

    console.log('Admin created');
    await db.end();
}

seed();