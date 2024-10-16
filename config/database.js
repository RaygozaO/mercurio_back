require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    queueLimit: 0
});

async function connectDatabase() {
    try{
        const connection = await pool.getConnection();
        console.log('Conectado a la base de datos. ');
        connection.release();
    } catch (err){
        console.error('Fallo la conexion a la base de datos:',err);
    }
}
connectDatabase();

module.exports = pool;

