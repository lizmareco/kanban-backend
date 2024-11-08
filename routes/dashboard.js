// src/routes/dashboard.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

// Ruta para obtener las estadísticas del dashboard de un tablero
router.get('/boards/:boardId', authMiddleware, dashboardController.getBoardStatistics);

module.exports = router;

