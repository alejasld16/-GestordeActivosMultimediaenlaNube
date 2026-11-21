import { useState } from 'react';
import FormularioCarga from './components/FormularioCarga.jsx';

export default function App() {
  // Cambia cada vez que se sube un archivo; la galería (Rol 5) lo usa para recargar
  const [ultimaSubida, setUltimaSubida] = useState(null);

  return (
    <div className="pagina">
      <header className="encabezado">
        <h1>Cloud Media Vault</h1>
        <p>Sube imágenes, videos y PDFs a la nube.</p>
      </header>

      <main className="contenido">
        <FormularioCarga alSubir={setUltimaSubida} />

        {/* ROL 5: aquí va <Galeria ultimaSubida={ultimaSubida} /> */}
        <section className="tarjeta">
          <h2>Galería</h2>
          <p className="texto-suave">
            {ultimaSubida
              ? `Último archivo subido: ${ultimaSubida.titulo}`
              : 'Aquí aparecerán los archivos subidos.'}
          </p>
        </section>
      </main>
    </div>
  );
}
