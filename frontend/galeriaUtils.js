
import { categoriaDe, formatearPeso } from './validaciones.js';

export { formatearPeso };

export const FILTROS = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'imagen', etiqueta: 'Imágenes' },
  { valor: 'video', etiqueta: 'Videos' },
  { valor: 'documento', etiqueta: 'PDFs' },
];

export function categoriaArchivo(archivo) {
  const t = String(archivo?.tipoArchivo || '').toLowerCase();
  if (['imagen', 'image'].includes(t)) return 'imagen';
  if (t === 'video') return 'video';
  if (['documento', 'pdf', 'raw'].includes(t)) return 'documento';
  if (t.includes('/')) return categoriaDe(t);
  if (/\.pdf($|\?)/i.test(archivo?.url || '')) return 'documento';
  return 'otro';
}


export const idArchivo = (archivo) => archivo.id ?? archivo._id;

export function formatearFecha(fecha) {
  const d = new Date(fecha);
  if (isNaN(d)) return '—';
  return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}
