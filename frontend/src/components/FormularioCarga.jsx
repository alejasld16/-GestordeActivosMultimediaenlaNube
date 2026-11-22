import { useEffect, useRef, useState } from 'react';
import Alerta from './Alerta.jsx';
import { subirArchivo } from '../api/archivos.js';
import { ACCEPT, categoriaDe, formatearPeso, validarArchivo } from '../utils/validaciones.js';

// ROL 4: formulario de carga con Drag & Drop, validaciones y progreso
export default function FormularioCarga({ alSubir }) {
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [subidoPor, setSubidoPor] = useState('');
  const [arrastrando, setArrastrando] = useState(false);
  const [estado, setEstado] = useState('inactivo'); // inactivo | subiendo | exito | error
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState('');

  const inputRef = useRef(null);
  const cancelarRef = useRef(null);

  // Libera la URL temporal de la vista previa al cambiar de archivo
  useEffect(() => {
    return () => vistaPrevia && URL.revokeObjectURL(vistaPrevia);
  }, [vistaPrevia]);

  const subiendo = estado === 'subiendo';

  function elegirArchivo(nuevo) {
    if (!nuevo || subiendo) return;
    const error = validarArchivo(nuevo);
    if (error) {
      setEstado('error');
      setMensaje(error);
      return;
    }
    setArchivo(nuevo);
    setVistaPrevia(URL.createObjectURL(nuevo));
    // Sugiere el nombre sin extensión como título
    if (!titulo) setTitulo(nuevo.name.replace(/\.[^.]+$/, ''));
    setEstado('inactivo');
    setMensaje('');
    setProgreso(0);
  }

  function limpiar() {
    setArchivo(null);
    setVistaPrevia(null);
    setTitulo('');
    setProgreso(0);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function enviar(e) {
    e.preventDefault();
    const error = validarArchivo(archivo);
    if (error) {
      setEstado('error');
      setMensaje(error);
      return;
    }

    setEstado('subiendo');
    setMensaje('');
    setProgreso(0);

    const { promesa, cancelar } = subirArchivo(
      { archivo, titulo: titulo.trim(), subidoPor: subidoPor.trim() },
      setProgreso
    );
    cancelarRef.current = cancelar;

    try {
      const creado = await promesa;
      setEstado('exito');
      setMensaje(`"${creado.titulo}" se subió correctamente.`);
      limpiar();
      alSubir?.(creado);
    } catch (err) {
      setEstado('error');
      setMensaje(err.message);
    } finally {
      cancelarRef.current = null;
    }
  }

  // Eventos de arrastrar y soltar
  const alArrastrar = (e) => {
    e.preventDefault();
    if (!subiendo) setArrastrando(true);
  };
  const alSalir = (e) => {
    e.preventDefault();
    setArrastrando(false);
  };
  const alSoltar = (e) => {
    e.preventDefault();
    setArrastrando(false);
    elegirArchivo(e.dataTransfer.files?.[0]);
  };

  const categoria = archivo ? categoriaDe(archivo.type) : null;

  return (
    <form className="tarjeta formulario" onSubmit={enviar} noValidate>
      <h2>Subir archivo</h2>

      <div
        className={`zona ${arrastrando ? 'zona--activa' : ''} ${subiendo ? 'zona--bloqueada' : ''}`}
        onDragOver={alArrastrar}
        onDragEnter={alArrastrar}
        onDragLeave={alSalir}
        onDrop={alSoltar}
        onClick={() => !subiendo && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Seleccionar o arrastrar un archivo"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => elegirArchivo(e.target.files?.[0])}
        />

        {!archivo ? (
          <div className="zona__texto">
            <span className="zona__icono" aria-hidden>⬆</span>
            <p>
              <strong>Arrastra un archivo aquí</strong> o haz clic para elegirlo
            </p>
            <small>Imágenes, videos o PDF · máximo 10 MB</small>
          </div>
        ) : (
          <div className="previa">
            {categoria === 'imagen' && <img src={vistaPrevia} alt="Vista previa" />}
            {categoria === 'video' && <video src={vistaPrevia} muted controls />}
            {categoria === 'documento' && <div className="previa__pdf">PDF</div>}
            <div className="previa__info">
              <strong title={archivo.name}>{archivo.name}</strong>
              <span>
                {categoria} · {formatearPeso(archivo.size)}
              </span>
            </div>
          </div>
        )}
      </div>

      <label className="campo">
        Título
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nombre para mostrar"
          maxLength={120}
          disabled={subiendo}
        />
      </label>

      <label className="campo">
        Subido por
        <input
          type="text"
          value={subidoPor}
          onChange={(e) => setSubidoPor(e.target.value)}
          placeholder="Tu nombre (opcional)"
          maxLength={60}
          disabled={subiendo}
        />
      </label>

      {subiendo && (
        <div className="progreso" aria-label={`Progreso ${progreso}%`}>
          <div className="progreso__barra" style={{ width: `${progreso}%` }} />
          <span>
            {progreso < 100 ? `Subiendo… ${progreso}%` : 'Procesando en la nube…'}
          </span>
        </div>
      )}

      <Alerta
        tipo={estado === 'exito' ? 'exito' : 'error'}
        alCerrar={() => setMensaje('')}
      >
        {mensaje}
      </Alerta>

      <div className="acciones">
        {subiendo ? (
          <button type="button" className="boton boton--secundario" onClick={() => cancelarRef.current?.()}>
            Cancelar
          </button>
        ) : (
          archivo && (
            <button type="button" className="boton boton--secundario" onClick={limpiar}>
              Quitar
            </button>
          )
        )}
        <button type="submit" className="boton" disabled={!archivo || subiendo}>
          {subiendo ? <span className="spinner" aria-hidden /> : null}
          {subiendo ? 'Subiendo' : 'Subir a la nube'}
        </button>
      </div>
    </form>
  );
}
