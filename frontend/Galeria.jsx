import { useEffect, useMemo, useState } from 'react';
import Alerta from './Alerta.jsx';
import TarjetaArchivo from './TarjetaArchivo.jsx';
import { eliminarArchivo, listarArchivos } from '../api/galeriaApi.js';
import { FILTROS, categoriaArchivo, idArchivo } from '../utils/galeriaUtils.js';
import './Galeria.css';

export default function Galeria({ ultimaSubida }) {
  const [archivos, setArchivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null); 
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [confirmandoId, setConfirmandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [recarga, setRecarga] = useState(0); 

  
  useEffect(() => {
    const control = new AbortController();
    setError('');
    setCargando(true);

    listarArchivos(control.signal)
      .then((datos) => {
        const ordenados = [...datos].sort(
          (a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida)
        );
        setArchivos(ordenados);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!control.signal.aborted) setCargando(false);
      });

    return () => control.abort();
  }, [ultimaSubida, recarga]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return archivos.filter((a) => {
      const coincideTipo = filtro === 'todos' || categoriaArchivo(a) === filtro;
      const coincideTitulo = !q || String(a.titulo || '').toLowerCase().includes(q);
      return coincideTipo && coincideTitulo;
    });
  }, [archivos, filtro, busqueda]);

  const contar = (valor) =>
    valor === 'todos'
      ? archivos.length
      : archivos.filter((a) => categoriaArchivo(a) === valor).length;

  async function eliminar(archivo) {
    const id = idArchivo(archivo);
    setEliminandoId(id);
    setAviso(null);
    try {
      await eliminarArchivo(id);
      
      setArchivos((prev) => prev.filter((a) => idArchivo(a) !== id));
      setAviso({ tipo: 'exito', texto: `"${archivo.titulo}" se eliminó de la nube y la base de datos.` });
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message });
    } finally {
      setEliminandoId(null);
      setConfirmandoId(null);
    }
  }

  return (
    <section className="tarjeta galeria">
      <h2>Galería</h2>

      <div className="galeria__barra">
        <input
          type="search"
          className="galeria__buscador"
          placeholder="Buscar por título…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar archivos por título"
        />
        <div className="galeria__filtros" role="group" aria-label="Filtrar por tipo">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              className={`filtro ${filtro === f.valor ? 'filtro--activo' : ''}`}
              aria-pressed={filtro === f.valor}
              onClick={() => setFiltro(f.valor)}
            >
              {f.etiqueta} <span className="filtro__n">{contar(f.valor)}</span>
            </button>
          ))}
        </div>
      </div>

      {aviso && (
        <Alerta tipo={aviso.tipo} alCerrar={() => setAviso(null)}>
          {aviso.texto}
        </Alerta>
      )}

      {cargando && archivos.length === 0 && (
        <p className="texto-suave galeria__estado">
          <span className="spinner" aria-hidden /> Cargando archivos…
        </p>
      )}

      {error && (
        <div className="galeria__estado">
          <Alerta tipo="error">{error}</Alerta>
          <button type="button" className="boton boton--secundario" onClick={() => setRecarga((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      )}

      {!error && !cargando && visibles.length === 0 && (
        <p className="texto-suave galeria__estado">
          {archivos.length === 0
            ? 'Aún no hay archivos. ¡Sube el primero!'
            : 'Ningún archivo coincide con tu búsqueda o filtro.'}
        </p>
      )}

      {visibles.length > 0 && (
        <div className="galeria__grid">
          {visibles.map((a) => {
            const id = idArchivo(a);
            return (
              <TarjetaArchivo
                key={id}
                archivo={a}
                confirmando={confirmandoId === id}
                eliminando={eliminandoId === id}
                alPedirConfirmar={() => setConfirmandoId(id)}
                alCancelar={() => setConfirmandoId(null)}
                alEliminar={() => eliminar(a)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
