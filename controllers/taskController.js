// controllers/taskController.js
const db = require('../db');

exports.createTask = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { nombre, descripcion, estado, fecha_vencimiento } = req.body;

    const result = await db.query(
      'INSERT INTO tasks (card_id, nombre, descripcion, estado, fecha_vencimiento) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cardId, nombre, descripcion, estado, fecha_vencimiento]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
};

exports.getTasksByCardId = async (req, res) => {
  try {
    const { cardId } = req.params;
    console.log('Obteniendo tareas para la tarjeta:', cardId);
    const result = await db.query(
      'SELECT * FROM tasks WHERE card_id = $1',
      [cardId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error en getTasksByCardId:', error); // Log detallado
    return res.status(500).json({ error: 'Error al obtener las tareas' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado, fecha_vencimiento } = req.body;

    // Log de los datos recibidos para depuración
    console.log('Datos recibidos para actualizar:', req.body);

    // Construir dinámicamente la consulta SQL para actualizaciones parciales
    const fields = [];
    const values = [];
    let query = 'UPDATE tasks SET ';

    if (nombre !== undefined) {
      values.push(nombre);
      fields.push(`nombre = $${values.length}`);
    }

    if (descripcion !== undefined) {
      values.push(descripcion);
      fields.push(`descripcion = $${values.length}`);
    }

    if (estado !== undefined) {
      // Validar el valor de 'estado'
      if (!['open', 'closed'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido. Debe ser "open" o "closed".' });
      }
      values.push(estado);
      fields.push(`estado = $${values.length}`);
    }

    if (fecha_vencimiento !== undefined) {
      values.push(fecha_vencimiento);
      fields.push(`fecha_vencimiento = $${values.length}`);
    }

    // Verificar si se proporcionaron campos para actualizar
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
    }

    // Completar la consulta SQL
    query += fields.join(', ') + ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(id);

    // Ejecutar la consulta SQL
    const result = await db.query(query, values);

    // Verificar si la tarea fue encontrada y actualizada
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    // Devolver la tarea actualizada
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar la tarea:', error);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM tasks WHERE id = $1', [id]);

    res.status(200).json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
};





