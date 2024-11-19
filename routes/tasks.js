//routes/tasks
const express = require('express');
const router = express.Router();
const { createTask, getTasksByCardId, updateTask, deleteTask } = require('../controllers/taskController');
const auth = require('../middleware/auth');

// Definir las rutas
router.post('/:cardId/tasks', auth, createTask);  // Crear una tarea para una tarjeta específica
router.get('/:cardId/tasks', auth, getTasksByCardId);  // Obtener las tareas de una tarjeta específica
router.put('/tasks/:id', auth, updateTask);  // Actualizar una tarea específica
router.delete('/tasks/:id', auth, deleteTask);  // Eliminar una tarea específica

module.exports = router;








