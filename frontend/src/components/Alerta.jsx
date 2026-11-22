export default function Alerta({ tipo = 'info', children, alCerrar }) {
  if (!children) return null;
  return (
    <div className={`alerta alerta--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {alCerrar && (
        <button type="button" className="alerta__cerrar" onClick={alCerrar} aria-label="Cerrar">
          ×
        </button>
      )}
    </div>
  );
}
