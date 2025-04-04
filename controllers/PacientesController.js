const express = require('express');
const router = express.Router();
const PacienteService = require('../services/PacienteServices');

// Obtener todos los pacientes
router.get('/', async (req, res) => {
    try {
        const pacientes = await PacienteService.obtenerPacientes();
        res.json(pacientes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los pacientes' });
    }
});

// Crear un nuevo paciente
router.post('/', async (req, res) => {
    try {
        const nuevoPaciente = await PacienteService.crearPaciente(req.body);
        res.status(201).json(nuevoPaciente);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el paciente' });
    }
});

// Actualizar paciente
router.put('/:id', async (req, res) => {
    try {
        const pacienteActualizado = await PacienteService.actualizarPaciente(req.params.id, req.body);
        res.json(pacienteActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el paciente' });
    }
});

// Eliminar paciente
router.delete('/:id', async (req, res) => {
    try {
        await PacienteService.eliminarPaciente(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el paciente' });
    }
});

module.exports = router;

