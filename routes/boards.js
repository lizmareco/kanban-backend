// routes/boards.js

const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const authMiddleware = require('../middleware/auth'); // Middleware para proteger rutas

// Ruta para obtener todos los tableros del usuario autenticado
router.get('/', authMiddleware, boardController.getBoards);

// Ruta para crear un nuevo tablero
router.post('/', authMiddleware, boardController.createBoard);

// Ruta para obtener un tablero específico por ID
router.get('/:id', authMiddleware, boardController.getBoardById);

// Ruta para actualizar un tablero
router.put('/:id', authMiddleware, boardController.updateBoard);

// Ruta para eliminar (o inactivar) un tablero
router.delete('/:id', authMiddleware, boardController.deleteBoard);


// Exportar el router
module.exports = router;

