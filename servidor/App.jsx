import { useState, useEffect } from 'react';
import { autoresService } from './services/autoresService';
import AutoresPanel from './components/AutoresPanel';
// ... otros imports

function App() {
  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // Cargar primera página de autores
        const autoresData = await autoresService.getAutores(1, 10);
        setAutores(autoresData.autores);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  return (
    <div className="app">
      <header>
        {/* ... header content ... */}
      </header>
      
      <main>
        {error && <div className="error-message">Error: {error}</div>}
        
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <AutoresPanel />
        )}
        
        {/* ... otros componentes ... */}
      </main>
    </div>
  );
}

export default App; 