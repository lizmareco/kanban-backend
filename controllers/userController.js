// controllers/userController.js
const bcrypt = require('bcrypt');
const pool = require('../db'); // Conexión a la base de datos
const jwt = require('jsonwebtoken');
const config = require('../config'); // Archivo que contiene variables de entorno o configuraciones

// Obtener todos los usuarios (solo puede obtenerse su propia información si no es administrador)
exports.getUsers = async (req, res) => {
  try {
    const users = await pool.query('SELECT id, nombre, email FROM usuarios WHERE activo = TRUE');
    res.status(200).json(users.rows); // Devuelve siempre un arreglo
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar el nuevo usuario en la base de datos
    const newUser = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email',
      [nombre, email, hashedPassword]
    );

    // Generar un token JWT
    const token = jwt.sign({ id: newUser.rows[0].id }, config.jwtSecret, {
      expiresIn: '1h',
    });

    // Enviar la respuesta con el token y los datos del usuario
    res.status(201).json({
      msg: 'Usuario creado exitosamente',
      token,
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Actualizar los datos del usuario autenticado
exports.updateUser = async (req, res) => {
  const userId = req.user.id; // ID del usuario autenticado
  const { nombre, email, password } = req.body;

  try {
    // Obtener los datos actuales del usuario
    const userResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Actualizar los campos proporcionados
    const updatedNombre = nombre || user.nombre;
    const updatedEmail = email || user.email;
    let updatedPassword = user.password;

    if (password) {
      // Hashear la nueva contraseña si se proporciona
      const salt = await bcrypt.genSalt(10);
      updatedPassword = await bcrypt.hash(password, salt);
    }

    // Actualizar el usuario en la base de datos
    await pool.query(
      'UPDATE usuarios SET nombre = $1, email = $2, password = $3 WHERE id = $4',
      [updatedNombre, updatedEmail, updatedPassword, userId]
    );

    // Obtener los datos actualizados
    const updatedUserResult = await pool.query('SELECT id, nombre, email FROM usuarios WHERE id = $1', [userId]);

    // Enviar la respuesta con los datos actualizados
    res.status(200).json({
      msg: 'Usuario actualizado exitosamente',
      user: updatedUserResult.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Desactivar (inactivar) el usuario autenticado
exports.deactivateUser = async (req, res) => {
  const userId = req.user.id; // ID del usuario autenticado

  try {
    // Verificar si el usuario existe
    const userResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Desactivar el usuario (por ejemplo, estableciendo un campo 'activo' a false)
    await pool.query('UPDATE usuarios SET activo = false WHERE id = $1', [userId]);

    res.status(200).json({ msg: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar el usuario:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

