const mysql = require('mysql2'); 
const dotenv = require('dotenv');

dotenv.config();
//why mysql2? because it's a modern and faster version of mysql package,
// it also supports promises and async / await which makes it easier
// to work with.

const db = mysql.createPool({
    host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
    password: process.env.DB_PWD ,
    database: process.env.DB_NAME
});

db.getConnection(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    } 
        console.log('Connected to the database successfully!');
})

module.exports = db.promise();
