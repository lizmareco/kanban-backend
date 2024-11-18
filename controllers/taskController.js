// controllers/taskController.js

const pool = require('../db');

// Obtener las tareas relacionadas con una tarjeta específica
exports.getTasksByCard = async (req, res) => {
  const { cardId } = req.params;

  try {
    const tasks = await pool.query(
      'SELECT * FROM tasks WHERE card_id = $1',
      [cardId]
    );

    res.status(200).json(tasks.rows);
  } catch (error) {
    console.error('Error al obtener las tareas:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Crear una nueva tarea
exports.createTask = async (req, res) => {
  console.log("Solicitud para crear tarea recibida", req.params, req.body);
  const { cardId } = req.params;
  const { nombre, descripcion, estado, fecha_vencimiento } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO tasks (card_id, nombre, descripcion, estado, fecha_vencimiento) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cardId, nombre, descripcion, estado, fecha_vencimiento]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear la tarea:', error.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Actualizar una tarea específica
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, estado, fecha_vencimiento } = req.body;

  // Verificar que el nombre no sea nulo o vacío
  if (!nombre) {
    return res.status(400).json({ msg: "El campo 'nombre' es obligatorio" });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET nombre = $1, descripcion = $2, estado = $3, fecha_vencimiento = $4
       WHERE id = $5
       RETURNING *`,
      [nombre, descripcion, estado, fecha_vencimiento, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar la tarea:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Eliminar una tarea específica
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Tarea no encontrada' });
    }

    res.status(200).json({ msg: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};


