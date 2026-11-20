const express = require('express');
const cors = require('cors');
const archivosRouter = require('./routes/archivos');
const manejadorErrores = require('./middlewares/manejadorErrores');

const app = express();

// Solo el frontend configurado puede llamar a la API
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE'],
  })
);
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ ok: true }));
app.use('/api/archivos', archivosRouter);

// Ruta no encontrada
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

app.use(manejadorErrores);

module.exports = app;
