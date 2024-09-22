const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Configuración de conexión a MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Cambia a tu usuario de MySQL
    password: 'Oscar*780917', // Cambia a tu contraseña
    database: 'mercurio' // Cambia a tu base de datos
});

// Conectar a la base de datos MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL: ', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Middleware para JSON
app.use(express.json());

// Ruta para obtener pacientes desde MySQL
app.get('/api/pacientes', (req, res) => {
    const sql = 'SELECT * FROM cliente';
    console.log(sql);
    connection.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(results);
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
