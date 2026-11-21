const prisma = require('../config/prisma');
const ErrorHttp = require('../utils/ErrorHttp');
const { TIPOS_PERMITIDOS } = require('../utils/tiposPermitidos');
const {
  subirACloudinary,
  eliminarDeCloudinary,
} = require('../services/cloudinaryService');

// POST /api/archivos
async function crearArchivo(req, res) {
  const { originalname, mimetype, size, buffer } = req.file;

  // Campos de texto opcionales que llegan en el mismo FormData
  const titulo = (req.body.titulo || '').trim() || originalname;
  const subidoPor = (req.body.subidoPor || '').trim() || 'anónimo';

  // 1. Transferir el binario a Cloudinary
  const resultado = await subirACloudinary(buffer);

  // 2. Armar los metadatos con la respuesta de Cloudinary
  const metadatos = {
    titulo,
    url: resultado.secure_url,
    publicId: resultado.public_id,
    resourceType: resultado.resource_type, // necesario para borrar después
    tipoArchivo: mimetype,
    tamanoBytes: size,
    subidoPor,
  };

  // 3. Guardar los metadatos en la BD solo después de confirmar la subida.
  //    Si el guardado falla, se borra el archivo de Cloudinary para no dejarlo huérfano.
  try {
    const archivo = await prisma.archivo.create({ data: metadatos });
    return res.status(201).json(archivo);
  } catch (error) {
    console.error('Error al guardar metadatos, revirtiendo subida:', error.message);
    await eliminarDeCloudinary(metadatos.publicId, metadatos.resourceType).catch((e) =>
      console.error('No se pudo revertir la subida en Cloudinary:', e.message)
    );
    throw new ErrorHttp(500, 'No se pudieron guardar los datos del archivo. Intenta de nuevo.');
  }
}

// GET /api/archivos?tipo=imagen|video|documento&q=texto&orden=desc|asc
async function listarArchivos(req, res) {
  const { tipo, q, orden } = req.query;
  const where = {};

  // Filtro por categoría: se traduce a la lista de MIME de esa categoría
  if (tipo) {
    const mimes = Object.keys(TIPOS_PERMITIDOS).filter(
      (mime) => TIPOS_PERMITIDOS[mime] === tipo
    );
    if (mimes.length === 0) {
      throw new ErrorHttp(400, 'Tipo no válido. Usa: imagen, video o documento.');
    }
    where.tipoArchivo = { in: mimes };
  }

  // Búsqueda por título (sin importar mayúsculas)
  if (q && q.trim()) {
    where.titulo = { contains: q.trim(), mode: 'insensitive' };
  }

  const archivos = await prisma.archivo.findMany({
    where,
    orderBy: { fechaSubida: orden === 'asc' ? 'asc' : 'desc' }, // más recientes primero
  });

  // Se agrega la categoría para que el frontend sepa cómo previsualizar
  res.json(
    archivos.map((a) => ({ ...a, categoria: TIPOS_PERMITIDOS[a.tipoArchivo] || 'otro' }))
  );
}

// DELETE /api/archivos/:id
async function eliminarArchivo(req, res) {
  const { id } = req.params;

  const archivo = await prisma.archivo.findUnique({ where: { id } });
  if (!archivo) {
    throw new ErrorHttp(404, 'El archivo no existe.');
  }

  // 1. Primero se borra en la nube. Si falla, el registro se conserva
  //    y no queda una fila apuntando a un archivo inexistente.
  await eliminarDeCloudinary(archivo.publicId, archivo.resourceType);

  // 2. Después se borra el registro en la BD
  await prisma.archivo.delete({ where: { id } });

  res.json({ mensaje: 'Archivo eliminado de la nube y de la base de datos.', id });
}

module.exports = { crearArchivo, listarArchivos, eliminarArchivo };
