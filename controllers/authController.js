const connection = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

// Función de login
exports.login = (req, res) => {
    const { email, pass } = req.body;

    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en la base de datos' });

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado.' });
        }

        const user = results[0];
        bcrypt.compare(pass, user.pass, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error al verificar contraseña' });

            if (isMatch) {
                const token = jwt.sign(
                    { idusuario: user.idusuario, id_rol: user.id_rol },
                    SECRET_KEY,
                    { expiresIn: '1h' }
                );

                console.log('🔑 JWT generado, SECRET_KEY usado:', SECRET_KEY);
                return res.json({ token });
            } else {
                return res.status(401).json({ message: 'Contraseña incorrecta.' });
            }
        });
    });
};

// Registro de usuario (solo admin)
exports.register = (req, res) => {
    const { nombreusuario, email, pass, id_rol } = req.body;
    const hashedPass = bcrypt.hashSync(pass, 8);

    connection.query(
        'INSERT INTO usuarios (nombreusuario, email, pass, id_rol) VALUES (?, ?, ?, ?)',
        [nombreusuario, email, hashedPass, id_rol],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Error al registrar usuario.' });
            res.status(201).json({ message: 'Usuario registrado exitosamente.' });
        }
    );
};

// Obtener rol
exports.getUserRole = (req, res) => {
    const { idusuario } = req.params;

    connection.query('SELECT id_rol FROM usuarios WHERE idusuario = ?', [idusuario], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en la base de datos' });

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.json({ rol: results[0].id_rol });
    });
};
