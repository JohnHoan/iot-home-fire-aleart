const mysql = require('mysql2');

let dbcon;
try {
    dbcon = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'dadn211',
    });
    console.log('Connected');
} catch (err) {
    console.log(err);
}

module.exports = dbcon;
