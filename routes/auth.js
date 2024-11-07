// routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth'); // Middleware de autenticación

// Ruta para registrar un nuevo usuario
router.post('/register', authController.register);

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para obtener los datos del usuario autenticado
router.get('/user', auth, authController.getUser);


// Exportar el router
module.exports = router;


