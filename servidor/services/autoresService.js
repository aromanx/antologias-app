const API_URL = 'http://localhost:3000';

export const autoresService = {
  getAutores: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await fetch(
        `${API_URL}/autores?page=${page}&limit=${limit}&search=${search}`
      );
      if (!response.ok) {
        throw new Error('Error al obtener autores');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getAutores:', error);
      throw error;
    }
  },

  getAutorById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/autores/${id}`);
      if (!response.ok) {
        throw new Error('Autor no encontrado');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getAutorById:', error);
      throw error;
    }
  },

  createAutor: async (autorData) => {
    const response = await fetch(`${API_URL}/autores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(autorData),
    });
    if (!response.ok) {
      throw new Error('Error al crear autor');
    }
    return response.json();
  },

  updateAutor: async (id, autorData) => {
    const response = await fetch(`${API_URL}/autores/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(autorData),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar autor');
    }
    return response.json();
  }
}; 