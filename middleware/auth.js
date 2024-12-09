// midleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  //const token = req.header('Authorization')?.replace('Bearer ', '');
  const token = req.header('Authorization')?.split(' ')[1];
  //const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Información decodificada del token:', decoded);
    req.user = decoded; // Usar el usuario del token decodificado
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(401).json({ msg: 'Token no válido' });
  }
};

module.exports = auth;







