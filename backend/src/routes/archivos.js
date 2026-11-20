const { Router } = require('express');
const recibirArchivo = require('../middlewares/recibirArchivo');
const { crearArchivo } = require('../controllers/archivosController');

const router = Router();

// ROL 2: subida (multer valida peso, tipo y firma antes de llegar al controlador)
router.post('/', recibirArchivo, crearArchivo);

// ROL 3: router.get('/', listarArchivos);
// ROL 3: router.delete('/:id', eliminarArchivo);

module.exports = router;
