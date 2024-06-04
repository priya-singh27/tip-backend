const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password:'root' ,
    database: 'tipme',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectToDB = async () => {
    try {
        const connection = await pool.promise().getConnection();
        console.log(`Connected to mysql database..`);
        connection.release();
    } catch (err) {
        console.log('Could not connect to mysql...',err);
    }
}

module.exports = {
    pool,
    connectToDB
};