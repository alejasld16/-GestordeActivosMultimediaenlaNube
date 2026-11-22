const { Router } = require('express');
const recibirArchivo = require('../middlewares/recibirArchivo');
const {
  crearArchivo,
  listarArchivos,
  eliminarArchivo,
} = require('../controllers/archivosController');

const router = Router();

// ROL 2: subida (multer valida peso, tipo y firma antes de llegar al controlador)
router.post('/', recibirArchivo, crearArchivo);

// ROL 3: listado con filtros y borrado sincronizado (nube + BD)
router.get('/', listarArchivos);
router.delete('/:id', eliminarArchivo);

module.exports = router;
