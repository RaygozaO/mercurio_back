
const jwt = require('jsonwebtoken');
require('dotenv').config(); // solo si no se hace en app.js
const SECRET_KEY = process.env.SECRET_KEY;

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer <token>'
    if (!token) return res.status(403).send('Token requerido.');

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).send('Token inválido.');
        req.userId = decoded.idusuario;
        req.userRole = decoded.id_rol;
        next();
    });
}

module.exports = verifyToken;

