// controllers/taskController.js
const pool = require('../db'); // Conexión a la base de datos
const moment = require('moment'); // Biblioteca para manejar fechas y horas

// Crear una nueva tarea
exports.createTask = async (req, res) => {
  const { nombre, descripcion, due_date, list_id } = req.body;
  const userId = req.user.id;

  try {
    // Verificar que la lista pertenece al usuario
    const listResult = await pool.query(
      `SELECT l.id FROM lists l
       INNER JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1 AND b.usuario_id = $2`,
      [list_id, userId]
    );

    if (listResult.rows.length === 0) {
      return res.status(403).json({ msg: 'No tienes permiso para agregar tareas a esta lista' });
    }

    // Obtener la posición de la última tarea en la lista
    const positionResult = await pool.query(
      'SELECT MAX(position) FROM cards WHERE list_id = $1',
      [list_id]
    );
    const position = (positionResult.rows[0].max || 0) + 1;

    // Insertar la nueva tarea
    const newTaskResult = await pool.query(
      `INSERT INTO cards (nombre, descripcion, due_date, list_id, position)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, descripcion, due_date, list_id, position]
    );

    res.status(201).json(newTaskResult.rows[0]);
  } catch (error) {
    console.error('Error al crear la tarea:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Obtener todas las tareas de una lista
exports.getTasksByList = async (req, res) => {
  const { listId } = req.params;
  const userId = req.user.id;

  try {
    // Verificar que la lista pertenece al usuario
    const listResult = await pool.query(
      `SELECT l.id FROM lists l
       INNER JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1 AND b.usuario_id = $2`,
      [listId, userId]
    );

    if (listResult.rows.length === 0) {
      return res.status(403).json({ msg: 'No tienes permiso para ver las tareas de esta lista' });
    }

    // Obtener las tareas de la lista
    const tasksResult = await pool.query(
      'SELECT * FROM cards WHERE list_id = $1 ORDER BY position',
      [listId]
    );

    res.status(200).json(tasksResult.rows);
  } catch (error) {
    console.error('Error al obtener las tareas:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Actualizar una tarea
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { nombre, descripcion, due_date, completed } = req.body;
  const userId = req.user.id;

  try {
    // Verificar que la tarea pertenece al usuario
    const taskResult = await pool.query(
      `SELECT c.* FROM cards c
       INNER JOIN lists l ON c.list_id = l.id
       INNER JOIN boards b ON l.board_id = b.id
       WHERE c.id = $1 AND b.usuario_id = $2`,
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(403).json({ msg: 'No tienes permiso para actualizar esta tarea' });
    }

    // Actualizar la tarea
    const updatedTaskResult = await pool.query(
      `UPDATE cards SET nombre = $1, descripcion = $2, due_date = $3, completed = $4
       WHERE id = $5 RETURNING *`,
      [nombre, descripcion, due_date, completed, taskId]
    );

    res.status(200).json(updatedTaskResult.rows[0]);
  } catch (error) {
    console.error('Error al actualizar la tarea:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Eliminar una tarea
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    // Verificar que la tarea pertenece al usuario
    const taskResult = await pool.query(
      `SELECT c.id FROM cards c
       INNER JOIN lists l ON c.list_id = l.id
       INNER JOIN boards b ON l.board_id = b.id
       WHERE c.id = $1 AND b.usuario_id = $2`,
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(403).json({ msg: 'No tienes permiso para eliminar esta tarea' });
    }

    // Eliminar la tarea
    await pool.query('DELETE FROM cards WHERE id = $1', [taskId]);

    res.status(200).json({ msg: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Mover una tarea a otra lista o posición
exports.moveTask = async (req, res) => {
  const { taskId } = req.params;
  const { listId, position } = req.body;
  const userId = req.user.id;

  try {
    // Verificar que la tarea pertenece al usuario
    const taskResult = await pool.query(
      `SELECT c.id, c.list_id FROM cards c
       INNER JOIN lists l ON c.list_id = l.id
       INNER JOIN boards b ON l.board_id = b.id
       WHERE c.id = $1 AND b.usuario_id = $2`,
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(403).json({ msg: 'No tienes permiso para mover esta tarea' });
    }

    // Verificar que la lista de destino pertenece al usuario
    const listResult = await pool.query(
      `SELECT l.id FROM lists l
       INNER JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1 AND b.usuario_id = $2`,
      [listId, userId]
    );

    if (listResult.rows.length === 0) {
      return res.status(403).json({ msg: 'No tienes permiso para mover tareas a esta lista' });
    }

    // Actualizar la posición de las tareas en la lista de destino
    await pool.query(
      `UPDATE cards SET position = position + 1
       WHERE list_id = $1 AND position >= $2`,
      [listId, position]
    );

    // Mover la tarea
    await pool.query(
      `UPDATE cards SET list_id = $1, position = $2 WHERE id = $3`,
      [listId, position, taskId]
    );

    res.status(200).json({ msg: 'Tarea movida exitosamente' });
  } catch (error) {
    console.error('Error al mover la tarea:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};
