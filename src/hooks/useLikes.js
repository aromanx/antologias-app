import { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";

export function useLikes() {
  const [likes, setLikes] = useState({});
  const { isAuthenticated, user } = useAuth0();

  useEffect(() => {
    fetchAllLikes();
  }, []);

  const fetchAllLikes = async () => {
    try {
      const response = await fetch("http://localhost:3000/antologia");
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const data = await response.json();
      if (Array.isArray(data)) {  // Verificar que data sea un array
        const likesMap = {};
        data.forEach(antologia => {
          if (antologia && antologia.idautor) {  // Verificar que la antología tenga idautor
            likesMap[antologia.idautor] = antologia.likesCount || 0;
          }
        });
        setLikes(likesMap);
      } else {
        console.error('La respuesta no es un array:', data);
      }
    } catch (error) {
      console.error("Error al cargar likes:", error);
    }
  };

  const toggleLike = async (idautor) => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para dar like");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idantologia: idautor,
          userId: user.sub,
          userEmail: user.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al dar like');
      }

      setLikes(prevLikes => ({
        ...prevLikes,
        [idautor]: (prevLikes[idautor] || 0) + 1
      }));
    } catch (error) {
      console.error("Error al dar like:", error);
      alert(error.message);
    }
  };

  const getLikes = (idautor) => {
    return likes[idautor] || 0;
  };

  return { toggleLike, getLikes, isAuthenticated };
} 