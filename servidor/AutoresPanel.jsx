import { useState, useEffect } from 'react';
import { autoresService } from '../services/autoresService';
import './AutoresPanel.css';

const AutoresPanel = () => {
  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const fetchAutores = async () => {
    try {
      setLoading(true);
      const data = await autoresService.getAutores(page, 10, search);
      
      if (!data || !data.autores) {
        throw new Error('Formato de respuesta inválido');
      }

      setAutores(data.autores);
      setTotalPages(data.pages);
    } catch (err) {
      console.error('Error al obtener los autores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAutores();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Resetear a la primera página cuando se busca
  };

  return (
    <div className="autores-panel">
      <div className="search-bar">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar autores..."
          className="search-input"
        />
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando autores...</div>
      ) : (
        <>
          <div className="autores-grid">
            {Array.isArray(autores) && autores.length > 0 ? (
              autores.map((autor) => (
                <div key={autor.idautor} className="autor-card">
                  {autor.urlfoto && (
                    <img 
                      src={autor.urlfoto} 
                      alt={autor.nombre}
                      className="autor-imagen"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-autor.png';
                      }}
                    />
                  )}
                  <div className="autor-info">
                    <h3>{autor.nombre}</h3>
                    <p>{autor.biografia}</p>
                    {autor.Antologias && (
                      <p className="antologias-count">
                        Antologías: {autor.Antologias.length}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No se encontraron autores</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="pagination-button"
              >
                Anterior
              </button>
              <span className="page-info">
                Página {page} de {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="pagination-button"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AutoresPanel; 