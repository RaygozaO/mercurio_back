const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
        type: DataTypes.STRING
    },
    numero: {
        type: DataTypes.STRING
    },
    colonia: {
        type: DataTypes.STRING
    },
    codigoPostal: {
        type: DataTypes.STRING
    },
    ciudad: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.STRING
    },
    id_usuario: { // 👈 clave foránea para autenticación
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'pacientes',
    timestamps: false
});

module.exports = Paciente;
