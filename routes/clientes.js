// Rutas en Express.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/colonias/:codigoPostal', async (req, res) => {
    const { codigoPostal } = req.params;

    const domicilioQuery = `
        SELECT cp.idcodigopostal, col.idcolonia, col.nombrecolonia, mun.idmunicipio, mun.nombremunicipio,
            ent.identidadfederativa, ent.nombreentidad
        FROM codigopostal cp
        JOIN colonias col ON cp.idcodigopostal = col.id_codigopostal
        JOIN municipio mun ON col.id_municipio = mun.idmunicipio
        JOIN entidadfederativa ent ON mun.id_entidadfederativa = ent.identidadfederativa
        WHERE cp.codigopostal = ?`;
    try {
        const [results] = await db.query(domicilioQuery, [codigoPostal]);
        console.log('Resultados de la consulta:', results); // Log de resultados
        res.json(results);
    } catch (error) {
        console.error('Error al obtener las colonias:', error); // Log del error
        res.status(500).json({ error: 'Error al obtener las colonias' });
    }
});


// Agregar cliente, usuario y domicilio
router.post('/api/clientes/crear', async (req, res) => {
    const { nombrecliente, apellidopaterno, apellidomaterno, telefono, nombreUsuario, email, password, rol, calle, numero, interior, codigopostal, colonia } = req.body;

    try {
        // Parte 1: Obtener datos del domicilio basado en código postal
        const domicilioQuery = `
      SELECT cp.idcodigopostal, col.idcolonia, mun.idmunicipio, ent.identidadfederativa
      FROM codigopostal cp
      JOIN colonias col ON cp.idcodigopostal = col.id_codigopostal
      JOIN municipio mun ON col.id_municipio = mun.idmunicipio
      JOIN entidadfederativa ent ON mun.id_entidadfederativa = ent.identidadfederativa
      WHERE cp.codigopostal = ?`;

        const [domicilio] = await db.query(domicilioQuery, [codigopostal]);

        if (!domicilio) {
            return res.status(400).json({ error: 'Domicilio no encontrado' });
        }

        // Parte 2: Insertar en la tabla de domicilio
        const domicilioInsertQuery = `
      INSERT INTO direccioncliente (calle, numero, interior, id_cp, id_colonia, id_municipio, id_entidad) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const domicilioResult = await db.query(domicilioInsertQuery, [
            calle, numero, interior, domicilio.idcodigopostal, domicilio.idcolonia, domicilio.idmunicipio, domicilio.identidadfederativa
        ]);

        const idDomicilio = domicilioResult.insertId;

        // Parte 3: Insertar usuario
        const usuarioInsertQuery = `
      INSERT INTO usuarios (pass, nombreusuario, email, enabled, id_rol)
      VALUES (?, ?, ?, 1, ?)`;

        const usuarioResult = await db.query(usuarioInsertQuery, [
            password, nombreUsuario, email, rol
        ]);

        const idUsuario = usuarioResult.insertId;

        // Parte 4: Insertar cliente
        const clienteInsertQuery = `
      INSERT INTO clientes (nombrecliente, apellidopaterno, apellidomaterno, telefono, id_usuario, id_domicilio)
      VALUES (?, ?, ?, ?, ?, ?)`;

        await db.query(clienteInsertQuery, [
            nombrecliente, apellidopaterno, apellidomaterno, telefono, idUsuario, idDomicilio
        ]);

        return res.status(200).json({ message: 'Cliente creado exitosamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
router.get('/clientes', (req, res) => {
    const query = 'SELECT * FROM cliente';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error en el servidor.');
        res.json(results);
    });
});

module.exports = router;
