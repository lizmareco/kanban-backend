// controllers/listController.js
const pool = require('../db'); // Conexión a la base de datos

// Crear una nueva lista en un tablero
exports.createList = async (req, res) => {
  const { nombre, boardId, maxWIP } = req.body;

  try {
    if (!nombre || !boardId || typeof maxWIP === 'undefined') {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    // Obtener la posición de la última lista en el tablero
    const positionResult = await pool.query(
      'SELECT MAX(position) FROM lists WHERE board_id = $1',
      [boardId]
    );
    const lastPosition = positionResult.rows[0].max || 0;
    const newPosition = lastPosition + 1;

    // Insertar la nueva lista
    const newListResult = await pool.query(
      'INSERT INTO lists (nombre, board_id, position, maxWIP) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, boardId, newPosition, maxWIP]
    );

    res.status(201).json(newListResult.rows[0]);
  } catch (error) {
    console.error('Error al crear la lista:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Obtener todas las listas de un tablero
// Obtener todas las listas de un tablero
exports.getListsByBoard = async (req, res) => {
  const { boardId } = req.params;

  try {
    // Verificar si el tablero existe
    const boardResult = await pool.query(
      'SELECT * FROM boards WHERE id = $1',
      [boardId]
    );

    if (boardResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Tablero no encontrado' });
    }

    // Obtener las listas del tablero, ordenadas por posición
    const listsResult = await pool.query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY position',
      [boardId]
    );

    // Para cada lista, obtener sus tarjetas asociadas con JOIN a usuarios
    const lists = await Promise.all(
      listsResult.rows.map(async (list) => {
        const cardsResult = await pool.query(
          `SELECT cards.id, cards.nombre, cards.descripcion, cards.etiqueta, cards.activo, cards.fecha_creacion,
                  cards.fecha_vencimiento, cards.lista_id, cards.posicion, usuarios.nombre AS usuario_nombre,
                  CASE WHEN cards.fecha_vencimiento <= NOW() THEN TRUE ELSE FALSE END AS atrasada
           FROM cards
           LEFT JOIN usuarios ON cards.usuario_asignado = usuarios.id
           WHERE cards.lista_id = $1
           ORDER BY cards.id`,
          [list.id]
        );

        return {
          ...list,
          cards: cardsResult.rows,
        };
      })
    );

    res.status(200).json(lists);
  } catch (error) {
    console.error('Error al obtener las listas:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};



// Actualizar una lista
exports.updateList = async (req, res) => {
  const { id } = req.params;  // Asegúrate de que se usa 'id' correctamente
  const { nombre } = req.body;

  try {
    // Validar que la lista existe
    const listResult = await pool.query(
      'SELECT * FROM lists WHERE id = $1',
      [id]
    );

    if (listResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Lista no encontrada' });
    }

    // Actualizar la lista
    const updatedListResult = await pool.query(
      'UPDATE lists SET nombre = $1 WHERE id = $2 RETURNING *',
      [nombre, id]
    );

    res.status(200).json(updatedListResult.rows[0]);
  } catch (error) {
    console.error('Error al actualizar la lista:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

//Eliminar una lista
exports.deleteList = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar la lista de la base de datos
    const result = await pool.query('DELETE FROM lists WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Lista no encontrada' });
    }

    res.status(200).json({ msg: 'Lista eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la lista:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Mover una lista (actualizar su posición)
exports.moveList = async (req, res) => {
  const { listId } = req.params;
  const { position } = req.body;

  try {
    // Actualizar la posición de la lista
    const updateResult = await pool.query(
      'UPDATE lists SET position = $1 WHERE id = $2 RETURNING *',
      [position, listId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Lista no encontrada' });
    }

    res.status(200).json({ msg: 'Lista movida exitosamente' });
  } catch (error) {
    console.error('Error al mover la lista:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};


