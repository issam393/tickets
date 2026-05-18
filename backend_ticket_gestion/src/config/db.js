const mysql = require('mysql2'); 
//why mysql2? because it's a modern and faster version of mysql package,
// it also supports promises and async / await which makes it easier
// to work with.

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'ticket_gestion'
});

db.getConnection(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    } 
        console.log('Connected to the database successfully!');
})

module.exports = db.promise();
