// routes/workspaces.js
const express = require('express');
const router = express.Router();
const { getWorkspaces, createWorkspace, deactivateWorkspace } = require('../controllers/workspaceController');
const auth = require('../middleware/auth');

// Ruta para obtener todos los espacios de trabajo
router.get('/', auth, getWorkspaces);

// Ruta para crear un espacio de trabajo
router.post('/', auth, createWorkspace);

// Ruta para inactivar (no eliminar) un espacio de trabajo
router.put('/:workspaceId/deactivate', auth, deactivateWorkspace);

module.exports = router;


