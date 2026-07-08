const mysql = require('mysql2'); 
const dotenv = require('dotenv');
const { requireEnv } = require('./env');

dotenv.config();
//why mysql2? because it's a modern and faster version of mysql package,
// it also supports promises and async / await which makes it easier
// to work with.

const db = mysql.createPool({
    host: requireEnv('DB_HOST'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PWD'),
    database: requireEnv('DB_NAME')
});

db.getConnection(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    } 
        console.log('Connected to the database successfully!');
})

module.exports = db.promise();
