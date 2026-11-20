const multer = require('multer');
const ErrorHttp = require('../utils/ErrorHttp');
const {
  TAMANO_MAXIMO_BYTES,
  TIPOS_PERMITIDOS,
  coincideFirma,
} = require('../utils/tiposPermitidos');

// memoryStorage: el archivo queda en RAM (req.file.buffer) y nunca se guarda
// en el disco del servidor. Así el binario vive solo en Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: TAMANO_MAXIMO_BYTES,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!TIPOS_PERMITIDOS[file.mimetype]) {
      return cb(
        new ErrorHttp(
          415,
          `Tipo de archivo no permitido (${file.mimetype}). Solo imágenes (JPG, PNG, GIF, WEBP), videos (MP4, WEBM, MOV) y PDF.`
        )
      );
    }
    cb(null, true);
  },
}).single('archivo'); // nombre del campo que debe usar el FormData del frontend

// Envuelve multer para traducir sus errores a mensajes claros en español
function recibirArchivo(req, res, next) {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ErrorHttp(413, 'El archivo supera el límite de 10 MB.'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
        return next(
          new ErrorHttp(400, 'Envía un solo archivo en el campo "archivo".')
        );
      }
      return next(new ErrorHttp(400, `Error al recibir el archivo: ${err.message}`));
    }
    if (err) return next(err);

    if (!req.file) {
      return next(new ErrorHttp(400, 'No se recibió ningún archivo en el campo "archivo".'));
    }

    // Multer lee el nombre del archivo como latin1; se convierte a UTF-8
    // para que tildes y ñ no se guarden dañadas ("presentaciÃ³n" -> "presentación")
    req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    // Segunda validación: el contenido real debe coincidir con el tipo declarado
    if (!coincideFirma(req.file.buffer, req.file.mimetype)) {
      return next(
        new ErrorHttp(415, 'El contenido del archivo no coincide con su tipo declarado.')
      );
    }

    next();
  });
}

module.exports = recibirArchivo;
