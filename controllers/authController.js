// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Asumiendo que estás usando PostgreSQL y tienes un módulo 'db' para manejar la conexión
const config = require('../config'); // Archivo que contiene variables de entorno o configuraciones

// Función para registrar un nuevo usuario
exports.register = async (req, res) => {
  const { nombre, email, password } = req.body;

  console.log('Datos recibidos para registro:', { nombre, email, password });

  try {
    // Verificar si el usuario ya existe
    const existingUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    console.log('Usuario existente:', existingUser.rows);

    if (existingUser.rows.length > 0) {
      console.log('El correo ya está registrado');
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }

    // Hashear la contraseña y registrar al usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Contraseña hasheada correctamente');

    const newUser = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING *',
      [nombre, email, hashedPassword]
    );
    console.log('Usuario registrado:', newUser.rows[0]);

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Función para iniciar sesión
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    console.log('Resultado de la consulta de usuario:', user.rows); // Verifica el resultado de la consulta

    if (user.rows.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Asegúrate de que el valor de `user.rows[0].password` esté definido
    if (!user.rows[0].password) {
      console.error('Error: El campo password es indefinido o nulo');
      return res.status(500).json({ msg: 'Error en el servidor' });
    }

    // Comparar la contraseña
    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      console.log('Contraseña incorrecta');
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user.rows[0].id }, config.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      msg: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.rows[0].id,
        nombre: user.rows[0].nombre,
        email: user.rows[0].email,
      },
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};


// Función para obtener los datos del usuario autenticado
exports.getUser = async (req, res) => {
  try {
    const user = await pool.query('SELECT id, nombre, email FROM usuarios WHERE id = $1', [req.user.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};


