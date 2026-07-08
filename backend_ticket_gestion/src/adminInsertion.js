const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const db = require('./config/db');
const { requireEnv, optionalEnv } = require('./config/env');

dotenv.config();

async function seed() {
    const password = requireEnv('ADMIN_INITIAL_PASSWORD');
    const hashedPassword = await bcrypt.hash(password, 10);
    const firstName = optionalEnv('ADMIN_INITIAL_FIRST_NAME', 'Admin');
    const lastName = optionalEnv('ADMIN_INITIAL_LAST_NAME', 'User');
    const email = requireEnv('ADMIN_INITIAL_EMAIL');
    const userName = requireEnv('ADMIN_INITIAL_USERNAME');

    await db.execute(
        `INSERT INTO employees (firstName, lastName, email, userName, password, service_id, status)
         VALUES (?, ?, ?, ?, ?, (SELECT id FROM services WHERE name='ADMIN'), 'Active')`,
        [firstName, lastName, email, userName, hashedPassword]
    );

    console.log('Admin created');
    await db.end();
}

seed();
