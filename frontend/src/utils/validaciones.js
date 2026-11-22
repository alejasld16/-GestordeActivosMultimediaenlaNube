// Mismas reglas que el backend (backend/src/utils/tiposPermitidos.js)
export const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

export const TIPOS_PERMITIDOS = {
  'image/jpeg': 'imagen',
  'image/png': 'imagen',
  'image/gif': 'imagen',
  'image/webp': 'imagen',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'application/pdf': 'documento',
};

// Valor para el atributo accept del input de archivo
export const ACCEPT = Object.keys(TIPOS_PERMITIDOS).join(',');

/** Devuelve un mensaje de error o null si el archivo es válido. */
export function validarArchivo(archivo) {
  if (!archivo) return 'Selecciona un archivo.';
  if (!TIPOS_PERMITIDOS[archivo.type]) {
    return 'Formato no permitido. Usa imágenes (JPG, PNG, GIF, WEBP), videos (MP4, WEBM, MOV) o PDF.';
  }
  if (archivo.size === 0) return 'El archivo está vacío.';
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return `El archivo pesa ${formatearPeso(archivo.size)} y el máximo es 10 MB.`;
  }
  return null;
}

export function categoriaDe(mimetype) {
  return TIPOS_PERMITIDOS[mimetype] || 'otro';
}

/** 22933 -> "22.4 KB" */
export function formatearPeso(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
