require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const conectarDB = require('./config/db');
const experienciasRouter = require('./routes/experiencias');
const authRouter = require('./routes/auth');
const { seedUsers } = require('./routes/auth');

const app = express();

// ── Conectar a MongoDB ───
conectarDB().then(() => seedUsers());

// ── Middlewares ───
app.use(cors({
  origin: '*'
}));
app.use(express.json());

// ── Swagger ──
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '📄 API Hoja de Vida — Experiencias Profesionales',
      version: '1.0.0',
      description:
        'API REST para gestionar las experiencias profesionales de Daniela, Ivan, Keila y Yeison. ' +
        'Construida con Express.js y MongoDB.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Rutas ───
app.use('/api/auth', authRouter);
app.use('/api/experiencias', experienciasRouter);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    mensaje: '🚀 API Hoja de Vida funcionando correctamente',
    documentacion: `http://localhost:${process.env.PORT || 3000}/api-docs`,
    endpoints: {
      'GET todos':    'GET  /api/experiencias',
      'GET por persona': 'GET  /api/experiencias?persona=Daniela',
      'GET por ID':   'GET  /api/experiencias/:id',
      'Crear':        'POST /api/experiencias',
      'Actualizar':   'PUT  /api/experiencias/:id',
      'Eliminar':     'DELETE /api/experiencias/:id',
    },
  });
});

// ── Iniciar servidor ───
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Swagger docs en  http://localhost:${PORT}/api-docs\n`);
});
