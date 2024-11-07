// controllers/dashboardController.js
const pool = require('../db'); // Conexión a la base de datos
const moment = require('moment'); // Biblioteca para manejar fechas y horas

// Obtener datos del dashboard para el usuario autenticado
exports.getBoardStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // Obtener la cantidad de workspaces del usuario
    const workspacesResult = await pool.query(
      'SELECT COUNT(*) FROM workspaces WHERE usuario_id = $1',
      [userId]
    );
    const totalWorkspaces = parseInt(workspacesResult.rows[0].count, 10);

    // Obtener la cantidad de boards del usuario
    const boardsResult = await pool.query(
      'SELECT COUNT(*) FROM boards WHERE usuario_id = $1',
      [userId]
    );
    const totalBoards = parseInt(boardsResult.rows[0].count, 10);

    // Obtener la cantidad de listas del usuario
    const listsResult = await pool.query(
      `SELECT COUNT(*) FROM lists 
       WHERE board_id IN (SELECT id FROM boards WHERE usuario_id = $1)`,
      [userId]
    );
    const totalLists = parseInt(listsResult.rows[0].count, 10);

    // Obtener la cantidad de tarjetas del usuario
    const cardsResult = await pool.query(
      `SELECT COUNT(*) FROM cards 
       WHERE list_id IN (
         SELECT id FROM lists 
         WHERE board_id IN (SELECT id FROM boards WHERE usuario_id = $1)
       )`,
      [userId]
    );
    const totalCards = parseInt(cardsResult.rows[0].count, 10);

    // Obtener las tarjetas atrasadas
    const overdueCardsResult = await pool.query(
      `SELECT * FROM cards 
       WHERE due_date < NOW() AND completed = false
       AND list_id IN (
         SELECT id FROM lists 
         WHERE board_id IN (SELECT id FROM boards WHERE usuario_id = $1)
       )`,
      [userId]
    );
    const overdueCards = overdueCardsResult.rows;

    // Obtener las tarjetas para hoy
    const todayCardsResult = await pool.query(
      `SELECT * FROM cards 
       WHERE due_date::date = NOW()::date AND completed = false
       AND list_id IN (
         SELECT id FROM lists 
         WHERE board_id IN (SELECT id FROM boards WHERE usuario_id = $1)
       )`,
      [userId]
    );
    const todayCards = todayCardsResult.rows;

    // Enviar los datos al cliente
    res.status(200).json({
      totalWorkspaces,
      totalBoards,
      totalLists,
      totalCards,
      overdueCards,
      todayCards,
    });
  } catch (error) {
    console.error('Error al obtener los datos del dashboard:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

  