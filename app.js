const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const loginRoutes = require('./routes/auth');
const clienteRoutes = require('./routes/clientes');

const app = express();

// CORS
app.use(cors({
    origin: ['http://localhost:4200', 'https://farmacia-mercurio'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));

// Middleware
app.use(bodyParser.json());

// Base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos');
    }
});

// Constantes
const SECRET_KEY = process.env.SECRET_KEY;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

// Login con reCAPTCHA
app.post('/login', async (req, res) => {
    const { email, pass, captchaToken } = req.body;

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

// Middleware de autenticación
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

// Ruta protegida de ejemplo
app.get('/protected', verifyToken, (req, res) => {
    if (req.userRole === 1) {
        res.send('Acceso permitido para superadmin.');
    } else {
        res.status(403).send('Acceso denegado.');
    }
});

// Rutas principales
app.use('/api/clientes', clienteRoutes); // <- asegúrate que las rutas dentro estén bien
app.use('/api/auth', loginRoutes);

// Iniciar servidor
app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor corriendo en el puerto 3000');
});
