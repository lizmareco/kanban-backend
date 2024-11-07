// config.js

require('dotenv').config(); // Cargar variables de entorno

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'ingenieriasoftware2',

};
