const express = require('express');
const { login, register, getUserRole } = require('../controllers/authController');
const router = express.Router();
const axios =  require('axios');

router.post('/login', async (req, res) => {
    const captchaToken = req.body.captchaToken;

    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: RECAPTCHA_SECRET,
                response: captchaToken
            }
        });

        if (response.data.success) {
            // Captcha verificado, proceder con el login
            const { email, password } = req.body;
            // Aquí haces la lógica de validación de usuario y contraseña
            res.send({ success: true });
        } else {
            res.status(400).send({ success: false, message: 'Captcha no válido' });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Error en la validación de Captcha' });
    }
});
router.post('/register', register);
router.get('/role/:idusuario', getUserRole);  // Para obtener el rol del usuario

module.exports = router;
