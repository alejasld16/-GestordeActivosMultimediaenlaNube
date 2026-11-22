// Manejador central: cualquier error lanzado en rutas o middlewares termina aquí.
// Express 5 envía aquí también los errores de funciones async, sin try/catch.
// eslint-disable-next-line no-unused-vars
function manejadorErrores(err, req, res, next) {
  const status = err.status || 500;

  // Errores inesperados (sin status propio): se registran y no se exponen al cliente
  if (!err.status) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }

  res.status(status).json({ error: err.message });
}

module.exports = manejadorErrores;
