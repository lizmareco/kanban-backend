// routes/users.js
const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deactivateUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', auth, getUsers);
router.post('/', auth, createUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deactivateUser);


module.exports = router;
