const connection = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const SECRET_KEY = 'mercurio';

// Función de login
exports.login = (req, res) => {
    const { email, pass } = req.body;
    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado.' });
        }

        const user = results[0];
        bcrypt.compare(pass, user.pass, (err, isMatch) => {
            if (isMatch) {
                const token = jwt.sign({ idusuario: user.idusuario, rol: user.id_rol }, SECRET_KEY, { expiresIn: '1h' });
                return res.json({ token });
            } else {
                return res.status(401).json({ message: 'Contraseña incorrecta.' });
            }
        });
    });
};
// Función para registrar (solo superadmin debería tener acceso)
//agregando jenkisn otra vez
exports.register = (req, res) => {
    const { nombreusuario, email, pass, id_rol } = req.body;
    const hashedPass = bcrypt.hashSync(pass, 8);
    connection.query('INSERT INTO usuarios (nombreusuario, email, pass, id_rol) VALUES (?, ?, ?, ?)',
        [nombreusuario, email, hashedPass, id_rol], (err, results) => {
            if (err) throw err;
            res.status(201).json({ message: 'Usuario registrado exitosamente.' });
        });
};

// Obtener el rol del usuario
exports.getUserRole = (req, res) => {
    const { idusuario } = req.params;
    connection.query('SELECT id_rol FROM usuarios WHERE idusuario = ?', [idusuario], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json({ rol: results[0].id_rol });
    });
};
