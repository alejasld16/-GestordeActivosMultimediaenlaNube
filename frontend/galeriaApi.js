
import { URL_ARCHIVOS } from './archivos.js';

async function leerJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}


export async function listarArchivos(signal) {
  let res;
  try {
    res = await fetch(URL_ARCHIVOS, { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('No hay conexión con el servidor. Revisa que la API esté encendida.');
  }

  const cuerpo = await leerJson(res);
  if (!res.ok) throw new Error(cuerpo.error || `Error ${res.status} al cargar la galería.`);

  // Acepta [..] o { archivos: [..] } o { data: [..] }
  if (Array.isArray(cuerpo)) return cuerpo;
  return cuerpo.archivos || cuerpo.data || [];
}


export async function eliminarArchivo(id) {
  let res;
  try {
    res = await fetch(`${URL_ARCHIVOS}/${id}`, { method: 'DELETE' });
  } catch {
    throw new Error('No hay conexión con el servidor. No se eliminó el archivo.');
  }
  if (!res.ok) {
    const cuerpo = await leerJson(res);
    throw new Error(cuerpo.error || `Error ${res.status} al eliminar el archivo.`);
  }
}
