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

/**
 * Borra un recurso de Cloudinary por su publicId.
 * Hay que pasar el resource_type con el que se subió ("image" o "video"),
 * si no Cloudinary no lo encuentra.
 * "not found" se toma como éxito: el archivo ya no está en la nube.
 */
async function eliminarDeCloudinary(publicId, resourceType = 'image') {
  let resultado;
  try {
    resultado = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // limpia la caché del CDN
    });
  } catch (error) {
    console.error('Error de Cloudinary al borrar:', error.message || error);
    throw new ErrorHttp(502, 'No se pudo eliminar el archivo de la nube. Intenta de nuevo.');
  }

  if (resultado.result !== 'ok' && resultado.result !== 'not found') {
    console.error('Respuesta inesperada de Cloudinary al borrar:', resultado);
    throw new ErrorHttp(502, 'No se pudo eliminar el archivo de la nube. Intenta de nuevo.');
  }

  return resultado;
}

module.exports = { subirACloudinary, eliminarDeCloudinary };
