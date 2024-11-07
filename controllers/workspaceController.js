// controllers/workspaceController.js
const pool = require('../db'); // 
const moment = require('moment'); // Si necesitas manejar fechas
const { validationResult } = require('express-validator'); // Si utilizas express-validator para validaciones

// Obtener espacios de trabajo
exports.getWorkspaces = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM workspaces WHERE creador_id = $1 AND activo = true ORDER BY id DESC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los espacios de trabajo:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Crear un nuevo espacio de trabajo

exports.createWorkspace = async (req, res) => {
  const { nombre, descripcion, usuariosAsignados } = req.body;
  const creador_id = req.user.id; // ID del usuario autenticado

  try {
    // Insertar el nuevo workspace en la base de datos
    const result = await pool.query(
      'INSERT INTO workspaces (nombre, descripcion, creador_id) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, creador_id]
    );

    const workspaceId = result.rows[0].id;

    // Asignar los usuarios al espacio de trabajo
    for (const usuarioId of usuariosAsignados) {
      await pool.query(
        'INSERT INTO workspace_users (workspace_id, usuario_id) VALUES ($1, $2)',
        [workspaceId, usuarioId]
      );
    }

    // Enviar la respuesta al cliente
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear el workspace:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};


// Inactivar un espacio de trabajo
exports.deactivateWorkspace = async (req, res) => {
  const userId = req.user.id;
  const { workspaceId } = req.params;

  try {
    // Verificar que el workspace pertenece al usuario
    const workspaceResult = await pool.query(
      'SELECT * FROM workspaces WHERE id = $1 AND creador_id = $2',
      [workspaceId, userId]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Espacio de trabajo no encontrado' });
    }

    // Inactivar el workspace
    await pool.query(
      'UPDATE workspaces SET activo = false WHERE id = $1',
      [workspaceId]
    );

    res.status(200).json({ msg: 'Espacio de trabajo inactivado exitosamente' });
  } catch (error) {
    console.error('Error al inactivar el espacio de trabajo:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};
