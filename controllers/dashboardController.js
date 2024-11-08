// src/controllers/dashboardController.js

const pool = require('../db'); // Importar la conexión a la base de datos

// Obtener las estadísticas del dashboard para un tablero
exports.getBoardStatistics = async (req, res) => {
  const { boardId } = req.params;

  try {
    // 1. Contar las tareas por estado
    const tasksByStatusResult = await pool.query(
      `SELECT estado, COUNT(*) as cantidad
       FROM cards
       WHERE lista_id IN (SELECT id FROM lists WHERE board_id = $1)
       GROUP BY estado`,
      [boardId]
    );

    // 2. Contar las tareas atrasadas
    const overdueTasksResult = await pool.query(
      `SELECT COUNT(*) as cantidad_atrasadas
       FROM cards
       WHERE lista_id IN (SELECT id FROM lists WHERE board_id = $1)
       AND fecha_vencimiento <= NOW()`,
      [boardId]
    );

    // 3. Contar las tareas por usuario asignado
    const tasksByUserResult = await pool.query(
      `SELECT usuario_asignado, COUNT(*) as cantidad
       FROM cards
       WHERE lista_id IN (SELECT id FROM lists WHERE board_id = $1)
       GROUP BY usuario_asignado`,
      [boardId]
    );

    // Procesar los resultados para responder en el formato adecuado

    // Tareas por estado
    const tasksByStatus = {};
    tasksByStatusResult.rows.forEach(row => {
      tasksByStatus[row.estado] = parseInt(row.cantidad);
    });

    // Tareas atrasadas
    const overdueTasks = parseInt(overdueTasksResult.rows[0].cantidad_atrasadas);

    // Tareas por usuario asignado
    const tasksByUser = {};
    tasksByUserResult.rows.forEach(row => {
      tasksByUser[row.usuario_asignado] = parseInt(row.cantidad);
    });

    // Responder con las estadísticas
    res.status(200).json({
      tasksByStatus,
      overdueTasks,
      tasksByUser,
    });
  } catch (error) {
    console.error('Error al obtener las estadísticas del tablero:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};


  