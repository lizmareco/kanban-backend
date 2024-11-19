// app.js
const dotenv = require('dotenv');
//require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Middleware para logging
const helmet = require('helmet'); // Middleware de seguridad
const rateLimit = require('express-rate-limit'); // Limitar la tasa de peticiones
const xssClean = require('xss-clean'); // Limpieza de datos de entrada
const hpp = require('hpp'); // Prevención de contaminación de parámetros HTTP
const path = require('path');

const app = express();

// Configurar dotenv
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workspaceRoutes = require('./routes/workspaces');
const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
//const listRoutes = require('./routes/listRoutes');
const cardRoutes = require('./routes/cards');
const dashboardRoutes = require('./routes/dashboard');
const tasksRoutes = require('./routes/tasks');

// Conectar a la base de datos
const pool = require('./db'); // Asegúrate de tener un archivo db.js configurado

// Middlewares de seguridad
app.use(helmet()); // Configura cabeceras HTTP seguras
app.use(xssClean()); // Limpia datos de entrada para prevenir ataques XSS
app.use(hpp()); // Evita contaminación de parámetros HTTP

// Middleware de registro de peticiones
app.use(morgan('dev')); // Puedes cambiar 'dev' por 'combined' para más detalles

// Configurar CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // URL de tu frontend
  credentials: true, // Permite el envío de cookies y encabezados de autorización
}));

// Limitar la tasa de peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP
});
app.use(limiter);

// Middleware para parsear cuerpos de solicitudes JSON
app.use(express.json());

// Middleware para parsear datos de formularios
app.use(express.urlencoded({ extended: true }));

// Rutas estáticas (si es necesario)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la aplicación
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/workspaces', workspaceRoutes);
app.use('/boards', boardRoutes);
app.use('/lists', listRoutes);
app.use('/cards', cardRoutes);
app.use('/dashboard', dashboardRoutes);
//app.use('/tasks', tasksRoutes);
app.use('/cards', tasksRoutes);

// Ruta de prueba para verificar el estado del servidor
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ msg: 'Ruta no encontrada' });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ msg: 'Error en el servidor' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


