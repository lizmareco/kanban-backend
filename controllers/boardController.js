// controllers/boardController.js

const pool = require('../db');

// Obtener todos los tableros del usuario autenticado
exports.getBoards = async (req, res) => {
  const { workspaceId } = req.query;

  try {
    const boards = await pool.query(
      'SELECT * FROM boards WHERE workspace_id = $1 AND activo = TRUE',
      [workspaceId]
    );

    res.status(200).json(boards.rows);
  } catch (error) {
    console.error('Error al obtener los tableros:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Crear un nuevo tablero
exports.createBoard = async (req, res) => {
  const { nombre, descripcion, workspaceId } = req.body;

  if (!nombre || !workspaceId) {
    return res.status(400).json({ msg: 'El nombre del tablero y el workspaceId son obligatorios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO boards (nombre, descripcion, workspace_id, activo) VALUES ($1, $2, $3, TRUE) RETURNING *',
      [nombre, descripcion, workspaceId]
    );

    const board = result.rows[0];
    const boardId = board.id;

    // Listas por defecto
    const defaultLists = [
      { nombre: 'Pendiente', position: 1 },
      { nombre: 'En curso', position: 2 },
      { nombre: 'Finalizado', position: 3 }
    ];

    // Insertar las 3 listas por defecto con maxwip = 5
    for (const lst of defaultLists) {
      await pool.query(
        'INSERT INTO lists (nombre, board_id, position, activo, maxwip) VALUES ($1, $2, $3, TRUE, 5)',
        [lst.nombre, boardId, lst.position]
      );
    }

    res.status(201).json(board);
  } catch (error) {
    console.error('Error al crear el tablero:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Obtener un tablero específico por ID
exports.getBoardById = async (req, res) => {
  const boardId = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM boards WHERE id = $1 AND activo = TRUE', [boardId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Tablero no encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener el tablero:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Actualizar un tablero
exports.updateBoard = async (req, res) => {
  const boardId = req.params.id;
  const { nombre, descripcion } = req.body;

  try {
    const result = await pool.query(
      'UPDATE boards SET nombre = $1, descripcion = $2 WHERE id = $3 AND activo = TRUE RETURNING *',
      [nombre, descripcion, boardId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Tablero no encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar el tablero:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Eliminar (o inactivar) un tablero
exports.deleteBoard = async (req, res) => {
  const boardId = req.params.id;

  try {
    const result = await pool.query('UPDATE boards SET activo = FALSE WHERE id = $1 RETURNING *', [boardId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Tablero no encontrado' });
    }

    res.status(200).json({ msg: 'Tablero eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el tablero:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};




  