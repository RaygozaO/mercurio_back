
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'mercurio';

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer <token>'
    if (!token) return res.status(403).send('Token requerido.');

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).send('Token inválido.'); // Cambia el código a 401
        req.userId = decoded.idusuario;
        req.userRole = decoded.id_rol;
        next();
    });
}

module.exports = verifyToken;
