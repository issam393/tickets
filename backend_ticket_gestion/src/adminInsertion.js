const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const db = require('./config/db');
const { requireEnv, optionalEnv } = require('./config/env');

dotenv.config();

async function createInitialAdmin() {
    const email = requireEnv('ADMIN_INITIAL_EMAIL');
    const userName = requireEnv('ADMIN_INITIAL_USERNAME');

    const [existingAdmins] = await db.execute(
        'SELECT id FROM employees WHERE email = ? OR userName = ? LIMIT 1',
        [email, userName]
    );

    if (existingAdmins.length) {
        console.log('Initial admin already exists; skipping creation.');
        return { created: false, id: existingAdmins[0].id };
    }

    const password = requireEnv('ADMIN_INITIAL_PASSWORD');
    const firstName = optionalEnv('ADMIN_INITIAL_FIRST_NAME', 'Admin');
    const lastName = optionalEnv('ADMIN_INITIAL_LAST_NAME', 'User');

    const [services] = await db.execute(
        "SELECT id FROM services WHERE UPPER(name) = 'ADMIN' LIMIT 1"
    );

    if (!services.length) {
        throw new Error("ADMIN service does not exist. Create it before bootstrapping the initial admin.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
        `INSERT INTO employees (firstName, lastName, email, userName, password, service_id, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
        [firstName, lastName, email, userName, hashedPassword, services[0].id]
    );

    console.log('Initial admin created.');
    return { created: true };
}

async function run() {
    await createInitialAdmin();
    await db.end();
}

if (require.main === module) {
    run().catch(async (error) => {
        console.error(error.message);
        await db.end();
        process.exit(1);
    });
}

module.exports = createInitialAdmin;
