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
router.post('/crear', async (req, res) => {
    try {
        console.log('✅ Paso 1 - BODY recibido:', req.body);

        const { cliente, usuario, domicilio } = req.body;

        if (!cliente || !usuario || !domicilio) {
            console.log('❌ Faltan datos en el body');
            return res.status(400).json({ error: 'Faltan datos' });
        }

        console.log('✅ Paso 2 - Buscando colonia y CP...');
        const domicilioQuery = `
      SELECT cp.idcodigopostal, col.idcolonia, mun.idmunicipio, ent.identidadfederativa
      FROM codigopostal cp
      JOIN colonias col ON cp.idcodigopostal = col.id_codigopostal
      JOIN municipio mun ON col.id_municipio = mun.idmunicipio
      JOIN entidadfederativa ent ON mun.id_entidadfederativa = ent.identidadfederativa
      WHERE cp.codigopostal = ? AND col.nombrecolonia = ?
    `;
        const [rows] = await db.query(domicilioQuery, [domicilio.codigopostal, domicilio.coloniasSelected]);

        if (!rows || rows.length === 0) {
            console.log('❌ No se encontró combinación CP + colonia');
            return res.status(400).json({ error: 'Colonia no encontrada' });
        }

        const datosDomicilio = rows[0];
        console.log('✅ Paso 3 - Insertando domicilio...', datosDomicilio);

        const domicilioInsertQuery = `
      INSERT INTO domicilio (calle, numero, interior, id_cp, id_colonia, id_municipio, id_entidad)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        const [domicilioResult] = await db.query(domicilioInsertQuery, [
            domicilio.calle,
            domicilio.numero,
            domicilio.interior || '',
            datosDomicilio.idcodigopostal,
            datosDomicilio.idcolonia,
            datosDomicilio.idmunicipio,
            datosDomicilio.identidadfederativa
        ]);
        const idDomicilio = domicilioResult.insertId;

        console.log('✅ Paso 4 - Insertando usuario...');
        const bcrypt = require('bcryptjs');
        const hashedPass = bcrypt.hashSync(usuario.password, 8);

        const usuarioInsertQuery = `
      INSERT INTO usuarios (nombreusuario, email, pass, enabled, id_rol)
      VALUES (?, ?, ?, 1, ?)
    `;
        const [usuarioResult] = await db.query(usuarioInsertQuery, [
            usuario.nombreusuario,
            usuario.email,
            hashedPass,
            2 // rol cliente
        ]);
        const idUsuario = usuarioResult.insertId;

        console.log('✅ Paso 5 - Insertando cliente...');
        const clienteInsertQuery = `
      INSERT INTO cliente (nombrecliente, apellidopaterno, apellidomaterno, telefono, id_usuario, id_domicilio)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        await db.query(clienteInsertQuery, [
            cliente.nombrecliente,
            cliente.apellidopaterno,
            cliente.apellidomaterno,
            cliente.telefono,
            idUsuario,
            idDomicilio
        ]);

        console.log('✅ Cliente registrado correctamente');
        res.status(201).json({ message: 'Cliente creado exitosamente' });

    } catch (error) {
        console.error('❌ Error en el servidor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
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
