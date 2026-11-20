const { subirACloudinary } = require('../services/cloudinaryService');

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

  // 3. ROL 3: aquí se guardan los metadatos en la base de datos, por ejemplo:
  //    const archivo = await prisma.archivo.create({ data: metadatos });
  //    return res.status(201).json(archivo);
  //    Si falla el guardado, conviene borrar el archivo recién subido de
  //    Cloudinary para no dejarlo huérfano.

  res.status(201).json(metadatos);
}

module.exports = { crearArchivo };
