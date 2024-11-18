// routes/tasks.js
const express = require('express');
const router = express.Router();
const { getTasksByCard, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.get('/cards/:cardId', auth, getTasksByCard);
router.post('/cards/:cardId', auth, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;


