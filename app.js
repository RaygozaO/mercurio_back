const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const axios = require('axios');  // Agrega axios para la validación del captcha
const loginRoutes = require('./routes/auth');
const clienteRoutes = require('./routes/clientes');
const cors = require('cors');
require('dotenv').config();


const app = express();
app.use(cors({
    origin: 'https://farmacia-mercurio', // Cambia esto al origen de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Permitir cookies
    optionsSuccessStatus: 204 // Para navegadores antiguos
}));

app.use(bodyParser.json());

const SECRET_KEY = process.env.SECRET_KEY;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

// Conexión a la base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Autenticación de usuario con validación de reCAPTCHA
app.post('/login', async (req, res) => {
    const { email, pass, captchaToken } = req.body;

    // Verificación del reCAPTCHA
    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: RECAPTCHA_SECRET,
                response: captchaToken
            }
        });

        if (!response.data.success) {
            return res.status(400).send({ success: false, message: 'Captcha no válido.' });
        }

    } catch (error) {
        return res.status(500).send({ success: false, message: 'Error en la validación de Captcha.' });
    }

    // Verificación del email y la contraseña después de validar el captcha
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor.');
        if (results.length === 0) return res.status(404).send('Usuario no encontrado.');

        const user = results[0];
        bcrypt.compare(pass, user.pass.toString(), (err, isMatch) => {
            if (!isMatch) return res.status(401).send('Contraseña incorrecta.');

            const token = jwt.sign(
                { idusuario: user.idusuario, id_rol: user.id_rol },
                SECRET_KEY,
                { expiresIn: '1h' }
            );

            res.json({ token, id_rol: user.id_rol });
        });
    });
});

// Middleware para proteger rutas
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Token requerido.');

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).send('Token inválido.');
        req.userId = decoded.idusuario;
        req.userRole = decoded.id_rol;
        next();
    });
}

// Ruta protegida (solo para roles específicos)
app.get('/protected', verifyToken, (req, res) => {
    if (req.userRole === 1) {
        res.send('Acceso permitido para superadmin.');
    } else {
        res.status(403).send('Acceso denegado.');
    }
});
app.use('/api/clientes', clienteRoutes);

app.listen(3000,'0.0.0.0', () => {
    console.log('Servidor corriendo en el puerto 3000');
});
