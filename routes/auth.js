const express = require('express');
const { login, register, getUserRole } = require('../controllers/authController');
const router = express.Router();
const axios = require('axios');

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

router.post('/login', async (req, res) => {
    const captchaToken = req.body.captchaToken;
    console.log('🧠 Token CAPTCHA recibido en backend:', captchaToken);

    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: RECAPTCHA_SECRET,
                response: captchaToken
            }
        });
        console.log('🧪 Respuesta de Google CAPTCHA:', response.data);

        if (response.data.success) {
            // Captcha OK ✅
            return login(req, res); // 👈 Aquí llamas a tu login real
        } else {
            res.status(400).send({ success: false, message: 'Captcha no válido' });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Error en la validación de Captcha' });
    }
});

router.post('/register', register);
router.get('/role/:idusuario', getUserRole);

module.exports = router;
