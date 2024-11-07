// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 5, // Número máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo en ms antes de cerrar una conexión inactiva
  connectionTimeoutMillis: 10000, // Tiempo en ms antes de lanzar un error si no se puede conectar
});

pool.on('connect', () => {
  console.log('Conectado a la base de datos');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones', err);
  process.exit(-1);
});

module.exports = pool;

