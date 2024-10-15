const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Oscar*780917',
    database: 'mercurio',
    waitForConnections: true,
    connectionLimit: 10,
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

