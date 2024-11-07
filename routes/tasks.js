// routes/tasks.js
const express = require('express');
const router = express.Router();
const { ggetTasksByList, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.get('/:cardId', auth, getTasksByList);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
