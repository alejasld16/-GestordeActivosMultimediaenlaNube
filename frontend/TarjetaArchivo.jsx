
import { categoriaArchivo, formatearFecha, formatearPeso } from '../utils/galeriaUtils.js';

const ETIQUETAS = { imagen: 'Imagen', video: 'Video', documento: 'PDF', otro: 'Archivo' };

export default function TarjetaArchivo({
  archivo,
  confirmando,
  eliminando,
  alPedirConfirmar,
  alCancelar,
  alEliminar,
}) {
  const categoria = categoriaArchivo(archivo);

  return (
    <article className="item">
      <div className="item__previa">
        {categoria === 'imagen' && (
          <img src={archivo.url} alt={archivo.titulo} loading="lazy" />
        )}
        {categoria === 'video' && <video src={archivo.url} controls preload="metadata" />}
        {categoria === 'documento' && (
          <div className="item__pdf">
            <div className="previa__pdf">PDF</div>
            <a href={archivo.url} target="_blank" rel="noopener noreferrer">
              Abrir PDF
            </a>
          </div>
        )}
        {categoria === 'otro' && <span className="texto-suave">Sin vista previa</span>}
      </div>

      <div className="item__cuerpo">
        <h3 className="item__titulo" title={archivo.titulo}>
          {archivo.titulo}
        </h3>
        <span className={`etiqueta etiqueta--${categoria}`}>{ETIQUETAS[categoria]}</span>

        <dl className="item__meta">
          <div>
            <dt>Peso</dt>
            <dd>{formatearPeso(Number(archivo.tamanoBytes) || 0)}</dd>
          </div>
          <div>
            <dt>Subido</dt>
            <dd>{formatearFecha(archivo.fechaSubida)}</dd>
          </div>
          <div>
            <dt>Autor</dt>
            <dd>{archivo.subidoPor || 'Anónimo'}</dd>
          </div>
        </dl>

        {!confirmando ? (
          <button
            type="button"
            className="boton boton--secundario boton--peligro"
            onClick={alPedirConfirmar}
            disabled={eliminando}
          >
            Eliminar
          </button>
        ) : (
          <div className="item__confirmar">
            <span>¿Eliminar de la nube y la BD?</span>
            <div className="acciones">
              <button
                type="button"
                className="boton boton--secundario"
                onClick={alCancelar}
                disabled={eliminando}
              >
                No
              </button>
              <button
                type="button"
                className="boton boton--peligro-solido"
                onClick={alEliminar}
                disabled={eliminando}
              >
                {eliminando ? <span className="spinner" aria-hidden /> : null}
                {eliminando ? 'Eliminando' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
