-- Crear tabla de likes
CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idusuario INT NOT NULL,
  idantologia INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idusuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (idantologia) REFERENCES antologia(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (idusuario, idantologia)
);

-- Agregar columna likes a la tabla antologia si no existe
ALTER TABLE antologia ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0; 