// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { getBoardStats } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/:boardId', auth, getBoardStats);

module.exports = router;
