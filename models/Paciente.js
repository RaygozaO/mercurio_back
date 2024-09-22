const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Importa la configuración de tu base de datos

// Definir el modelo Paciente usando Sequelize
const Paciente = sequelize.define('Paciente', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fechaNacimiento: {
        type: DataTypes.DATE,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    numero: {
        type: DataTypes.STRING,
        allowNull: true
    },
    colonia: {
        type: DataTypes.STRING,
        allowNull: true
    },
    codigoPostal: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ciudad: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    // Opciones adicionales del modelo
    tableName: 'pacientes', // Define el nombre de la tabla en MySQL
    timestamps: false // Evita que Sequelize genere automáticamente columnas de timestamps
});

module.exports = Paciente;
