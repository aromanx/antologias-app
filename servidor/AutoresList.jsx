import { useState, useEffect } from 'react';

const AutoresList = () => {
  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  
  const fetchAutores = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/autores?page=${page}&limit=10&search=${search}`
      );
      const data = await response.json();
      
      setAutores(data.autores);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutores();
  }, [page, search]);

  return (
    <div>
      {/* Buscador */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar autores..."
      />

      {/* Lista de autores */}
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <div className="autores-grid">
            {autores.map((autor) => (
              <div key={autor.idautor} className="autor-card">
                <h3>{autor.nombre}</h3>
                <p>{autor.biografia}</p>
                {autor.Antologias && (
                  <p>Antologías: {autor.Antologias.length}</p>
                )}
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="pagination">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 