const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const authMiddleware = require('../middleware/auth');


// Crear una nueva lista
router.post('/', authMiddleware, listController.createList);

// Obtener listas de un tablero
router.get('/board/:boardId', authMiddleware, listController.getListsByBoard);

// Actualizar una lista
router.put('/:id', authMiddleware, listController.updateList);

// Eliminar una lista
router.delete('/:id', authMiddleware, listController.deleteList);

// Mover una lista
router.put('/:id/move', authMiddleware, listController.moveList);

module.exports = router;


module.exports = router;
