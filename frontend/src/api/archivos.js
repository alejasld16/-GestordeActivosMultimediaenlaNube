const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const URL_ARCHIVOS = `${API_URL}/api/archivos`;

/**
 * Sube un archivo con FormData.
 * Usa XMLHttpRequest (y no fetch) porque permite medir el progreso real de subida.
 * Devuelve { promesa, cancelar }.
 */
export function subirArchivo({ archivo, titulo, subidoPor }, alProgresar) {
  const xhr = new XMLHttpRequest();

  const promesa = new Promise((resolve, reject) => {
    const datos = new FormData();
    datos.append('archivo', archivo); // el backend espera el campo "archivo"
    if (titulo) datos.append('titulo', titulo);
    if (subidoPor) datos.append('subidoPor', subidoPor);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && alProgresar) {
        alProgresar(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let respuesta = {};
      try {
        respuesta = JSON.parse(xhr.responseText);
      } catch {
        /* respuesta vacía o no JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(respuesta);
      else reject(new Error(respuesta.error || `Error ${xhr.status} al subir el archivo.`));
    };

    xhr.onerror = () =>
      reject(new Error('No hay conexión con el servidor. Revisa que la API esté encendida.'));
    xhr.ontimeout = () => reject(new Error('La subida tardó demasiado. Intenta de nuevo.'));
    xhr.onabort = () => reject(new Error('Subida cancelada.'));

    xhr.open('POST', URL_ARCHIVOS);
    xhr.timeout = 120_000;
    xhr.send(datos);
  });

  return { promesa, cancelar: () => xhr.abort() };
}
