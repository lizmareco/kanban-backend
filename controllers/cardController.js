// controllers/cardController.js
const pool = require('../db'); // Conexión a la base de datos
const { validationResult } = require('express-validator');

// Crear una nueva tarjeta
exports.createCard = async (req, res) => {
  const { nombre, descripcion, fecha_vencimiento, usuario_asignado, lista_id, etiqueta = null, estado = null, posicion = null } = req.body;

  console.log('Datos recibidos para crear tarjeta:', req.body);
  console.log('Tipo de cada campo:');
  console.log('Tipo de nombre:', typeof nombre);
  console.log('Tipo de descripcion:', typeof descripcion);
  console.log('Tipo de fecha_vencimiento:', typeof fecha_vencimiento);
  console.log('Tipo de usuario_asignado:', typeof usuario_asignado);
  console.log('Tipo de lista_id:', typeof lista_id);

  try {
    // Verificar que `usuario_asignado` sea un valor válido en la tabla `usuarios`
    const userResult = await pool.query(
      `SELECT id FROM usuarios WHERE id = $1`,
      [usuario_asignado]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    // Verificar que `lista_id` sea un valor válido en la tabla `lists`
    const listResult = await pool.query(
      `SELECT nombre FROM lists WHERE id = $1`,
      [lista_id]
    );

    if (listResult.rows.length === 0) {
      return res.status(400).json({ msg: 'Lista no encontrada' });
    }

    const nombreLista = listResult.rows[0].nombre;

    // Insertar la tarjeta en la base de datos
    const newCard = await pool.query(
      `INSERT INTO cards (nombre, descripcion, activo, fecha_creacion, fecha_vencimiento, usuario_asignado, etiqueta, estado, lista_id, posicion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        nombre,
        descripcion,
        true, // `activo` por defecto
        new Date(), // `fecha_creacion` asignada automáticamente
        fecha_vencimiento,
        usuario_asignado,
        etiqueta,
        estado || nombreLista, // El estado se basa en el nombre de la lista
        lista_id,
        posicion || 0 // Si `posicion` no está definido, se asigna `0`
      ]
    );

    res.status(201).json(newCard.rows[0]);
  } catch (error) {
    console.error('Error al crear la tarjeta:', error);
    res.status(400).json({ msg: 'Error al insertar la tarjeta', detail: error.message });
  }
};




// Obtener todas las tarjetas de una lista
exports.getCardsByList = async (req, res) => {
  const { listId } = req.params;

  try {
    // Obtener las tarjetas de la lista y determinar si están vencidas
    const cards = await pool.query(
      `SELECT cards.id, cards.nombre, cards.descripcion, cards.etiqueta, cards.activo, cards.fecha_creacion,
        cards.fecha_vencimiento, cards.lista_id, cards.posicion, usuarios.nombre, CASE
        WHEN cards.fecha_vencimiento <= NOW() THEN TRUE
        ELSE FALSE
      END AS atrasada
      FROM cards
      LEFT JOIN usuarios ON cards.usuario_asignado = usuarios.id
      WHERE cards.lista_id = $1
      ORDER BY cards.id`,
      [listId]
    );
    console.log(cards.rows)
    res.status(200).json(cards.rows);
  } catch (error) {
    console.error('Error al obtener las tarjetas:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Actualizar una tarjeta
exports.updateCard = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, fecha_vencimiento, usuario_asignado, etiqueta, estado } = req.body;

  try {
    const updatedCard = await pool.query(
      `UPDATE cards SET nombre = $1, descripcion = $2, fecha_vencimiento = $3, usuario_asignado = $4, etiqueta = $5, estado = $6
       WHERE id = $7 RETURNING *`,
      [nombre, descripcion, fecha_vencimiento, usuario_asignado, etiqueta, estado, id]
    );

    res.status(200).json(updatedCard.rows[0]);
  } catch (error) {
    console.error('Error al actualizar la tarjeta:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Mover una tarjeta a otra lista o posición
exports.moveCard = async (req, res) => {
  const { id } = req.params; // Cambiado de cardId a id
  const { listId, position } = req.body;

  try {
    const updatedCard = await pool.query(
      `UPDATE cards
       SET lista_id = $1, posicion = $2
       WHERE id = $3
       RETURNING *`,
      [listId, position, id] // Cambiado de cardId a id
    );

    if (updatedCard.rows.length === 0) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    res.status(200).json(updatedCard.rows[0]);
  } catch (error) {
    console.error('Error al mover la tarjeta:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};


// Eliminar una tarjeta
exports.deleteCard = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM cards WHERE id = $1', [id]);

    res.status(200).json({ msg: 'Tarjeta eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la tarjeta:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};



  