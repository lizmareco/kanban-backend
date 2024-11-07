// testDb.js
const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
  } else {
    console.log('Conexión exitosa:', res.rows);
  }
  pool.end(); // Cerrar el pool después de la prueba
});

