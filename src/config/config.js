const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ENDPOINTS = {
  antologias: `${API_BASE_URL}/antologia`,
  autores: `${API_BASE_URL}/autores`,
  likes: `${API_BASE_URL}/likes`
}; 