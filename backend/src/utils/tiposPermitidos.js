// Tamaño máximo permitido por archivo: 10 MB
const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

// Tipos MIME aceptados, agrupados por categoría
const TIPOS_PERMITIDOS = {
  'image/jpeg': 'imagen',
  'image/png': 'imagen',
  'image/gif': 'imagen',
  'image/webp': 'imagen',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'application/pdf': 'documento',
};

/**
 * El tipo MIME que llega en el formulario lo decide el navegador (o quien
 * haga la petición), así que se puede falsificar. Esta función revisa los
 * primeros bytes del archivo ("firma" o magic number) para confirmar que el
 * contenido real coincide con el tipo declarado.
 */
function coincideFirma(buffer, mimetype) {
  if (!buffer || buffer.length < 12) return false;

  const empiezaCon = (bytes, desde = 0) =>
    bytes.every((b, i) => buffer[desde + i] === b);
  const texto = (inicio, fin) => buffer.toString('ascii', inicio, fin);

  switch (mimetype) {
    case 'image/jpeg':
      return empiezaCon([0xff, 0xd8, 0xff]);
    case 'image/png':
      return empiezaCon([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/gif':
      return texto(0, 6) === 'GIF87a' || texto(0, 6) === 'GIF89a';
    case 'image/webp':
      return texto(0, 4) === 'RIFF' && texto(8, 12) === 'WEBP';
    case 'video/mp4':
    case 'video/quicktime':
      // MP4 y MOV tienen la caja "ftyp" a partir del byte 4
      return texto(4, 8) === 'ftyp';
    case 'video/webm':
      return empiezaCon([0x1a, 0x45, 0xdf, 0xa3]);
    case 'application/pdf':
      return texto(0, 5) === '%PDF-';
    default:
      return false;
  }
}

module.exports = { TAMANO_MAXIMO_BYTES, TIPOS_PERMITIDOS, coincideFirma };
