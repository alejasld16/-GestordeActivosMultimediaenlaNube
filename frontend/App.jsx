import { useState } from 'react';
import FormularioCarga from './components/FormularioCarga.jsx';
import Galeria from './components/Galeria.jsx';

export default function App() {
  
  const [ultimaSubida, setUltimaSubida] = useState(null);

  return (
    <div className="pagina">
      <header className="encabezado">
        <h1>Cloud Media Vault</h1>
        <p>Sube imágenes, videos y PDFs a la nube.</p>
      </header>

      <main className="contenido">
        <FormularioCarga alSubir={setUltimaSubida} />
        <Galeria ultimaSubida={ultimaSubida} />
      </main>
    </div>
  );
}
