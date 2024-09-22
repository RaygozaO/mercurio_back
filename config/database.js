const { Sequelize } = require('sequelize');

// Configura la conexión a MySQL
const sequelize = new Sequelize('mercurio', 'root', 'Oscar*780917', {
    host: 'localhost',
    dialect: 'mysql'
});

// Verifica la conexión
sequelize.authenticate()
    .then(() => {
        console.log('Conexión establecida con MySQL.');
    })
    .catch(err => {
        console.error('Error al conectar con MySQL:', err);
    });

module.exports = sequelize;
