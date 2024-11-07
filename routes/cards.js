const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/auth');

// Crear una nueva tarjeta
router.post('/', authMiddleware, cardController.createCard);


// Obtener tarjetas de una lista
router.get('/list/:listId', authMiddleware, cardController.getCardsByList);

// Actualizar una tarjeta
router.put('/:id', authMiddleware, cardController.updateCard);

// Eliminar una tarjeta
router.delete('/:id', authMiddleware, cardController.deleteCard);

// Mover una tarjeta
router.put('/:id/move', authMiddleware, cardController.moveCard);

module.exports = router;
