import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const AutorDetalle = () => {
  const { id } = useParams();
  const [autor, setAutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAutor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/autores/${id}`);
        if (!response.ok) {
          throw new Error('Autor no encontrado');
        }
        const data = await response.json();
        setAutor(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAutor();
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!autor) return <p>No se encontró el autor</p>;

  return (
    <div className="autor-detalle">
      <h2>{autor.nombre}</h2>
      <p>{autor.biografia}</p>
      {autor.urlfoto && (
        <img src={autor.urlfoto} alt={autor.nombre} />
      )}
      
      <h3>Antologías</h3>
      <div className="antologias-list">
        {autor.Antologias?.map(antologia => (
          <div key={antologia.id} className="antologia-card">
            <h4>{antologia.titulo}</h4>
            <p>{antologia.contenido}</p>
            <p>Likes: {antologia.likes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}; 