const Paciente = require('../models/Paciente'); // Asegúrate de que sea el modelo Sequelize

// Obtener todos los pacientes
exports.obtenerPacientes = async () => {
    return await Paciente.findAll();
};

// Crear un nuevo paciente
exports.crearPaciente = async (datosPaciente) => {
    return await Paciente.create(datosPaciente);
};

// Actualizar un paciente
exports.actualizarPaciente = async (id, datosActualizados) => {
    const paciente = await Paciente.findByPk(id);
    if (paciente) {
        return await paciente.update(datosActualizados);
    }
    throw new Error('Paciente no encontrado');
};

// Eliminar un paciente
exports.eliminarPaciente = async (id) => {
    const paciente = await Paciente.findByPk(id);
    if (paciente) {
        return await paciente.destroy();
    }
    throw new Error('Paciente no encontrado');
};

