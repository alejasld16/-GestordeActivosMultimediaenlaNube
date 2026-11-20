const cloudinary = require('../config/cloudinary');
const ErrorHttp = require('../utils/ErrorHttp');

const CARPETA = 'cloud-media-vault';
const TIEMPO_LIMITE_MS = 60_000;

/**
 * Sube un buffer a Cloudinary usando un stream (sin escribir en disco).
 * resource_type "auto" deja que Cloudinary detecte si es imagen o video.
 * Los PDF quedan como resource_type "image", lo que además permite generar
 * miniaturas de su primera página.
 */
function subirACloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CARPETA,
        resource_type: 'auto',
        timeout: TIEMPO_LIMITE_MS,
      },
      (error, resultado) => {
        if (error) {
          console.error('Error de Cloudinary:', error.message || error);
          return reject(
            new ErrorHttp(502, 'No se pudo subir el archivo a la nube. Intenta de nuevo.')
          );
        }
        resolve(resultado);
      }
    );

    stream.end(buffer);
  });
}

module.exports = { subirACloudinary };
