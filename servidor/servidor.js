import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const port = process.env.PORT || 3000;

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};

// Inicializar Express
const app = express();
app.use(express.json());
app.use(cors(corsOptions));

// Configurar base de datos SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Definición de modelos
const Autor = sequelize.define("Autor", {
  idautor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  biografia: {
    type: DataTypes.TEXT
  },
  urlfoto: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'autores',
  timestamps: false
});

const Antologia = sequelize.define("Antologia", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idautor: {
    type: DataTypes.INTEGER,
    references: {
      model: Autor,
      key: 'idautor'
    }
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  referencia: {
    type: DataTypes.STRING
  },
  tituloObra: {
    type: DataTypes.STRING
  },
  autorObra: {
    type: DataTypes.STRING
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'antologias'
});

const Like = sequelize.define("Like", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idusuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idantologia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Antologia,
      key: 'id'
    }
  }
}, {
  tableName: 'likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Relaciones
Antologia.belongsTo(Autor, { foreignKey: "idautor", constraints: false });
Autor.hasMany(Antologia, { foreignKey: "idautor", constraints: false });
Like.belongsTo(Antologia, { foreignKey: 'idantologia' });
Antologia.hasMany(Like, { foreignKey: 'idantologia' });

// Datos de ejemplo
const datosEjemplo = {
  autores: [
    {
      nombre: "Ada Aurora Sánchez Peña",
      biografia: "Investigadora y académica de la Universidad de Colima",
      urlfoto: "https://portal.ucol.mx/content/micrositios/188/image/Escudo2021.png"
    },
    {
      nombre: "Guillermina Cuevas",
      biografia: "GUILLERMINA CUEVAS (Colima, México, 1950). Poeta, narradora, editora y tallerista.",
      urlfoto: "https://www.ucol.mx/cms/beta2/img/logos/UdeC_2L%20izq_Negro%2080_.png"
    }
  ],
  antologias: [
    {
      titulo: "De Colima me gusta",
      contenido: "De Colima me gusta el rumor, \nel mito y la leyenda, \nel aire limpio de las tardes\nla aparente facilidad para alcanzar\nfama y fortuna,\nperpetuar la luz de un apellido.",
      referencia: "Poema tomado de: Cuevas, G. (1996). Del fuego y sus fervores.",
      tituloObra: "Del fuego y sus fervores",
      autorObra: "Guillermina Cuevas"
    },
    {
      titulo: "Colima en versos",
      contenido: "Bajo el volcán dormido\nla ciudad despierta\ncon el aroma del café\ny el canto de las aves.",
      referencia: "Antología poética de Colima",
      tituloObra: "Antología poética",
      autorObra: "Ada Aurora Sánchez Peña"
    }
  ]
};

// Inicializar base de datos
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // Forzar recreación de tablas
    await sequelize.sync({ force: true });
    console.log('Base de datos reiniciada y tablas creadas.');

    // Crear autores de ejemplo
    const autoresCreados = await Promise.all(
      datosEjemplo.autores.map(autor => Autor.create(autor))
    );
    console.log('Autores de ejemplo creados.');

    // Crear antologías de ejemplo
    await Promise.all(
      datosEjemplo.antologias.map((antologia, index) => 
        Antologia.create({
          ...antologia,
          idautor: autoresCreados[index].idautor
        })
      )
    );
    console.log('Antologías de ejemplo creadas.');

    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

// Endpoints
app.get("/antologia", async (req, res) => {
  try {
    const antologias = await Antologia.findAll({
      include: [{
        model: Autor,
        attributes: ['nombre', 'biografia', 'urlfoto']
      }]
    });
    res.json(antologias);
  } catch (error) {
    console.error("Error al obtener antologías:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/likes/:antologiaId', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { antologiaId } = req.params;
    const { idusuario } = req.body;

    if (!antologiaId || !idusuario) {
      throw new Error('Se requieren antologiaId y idusuario');
    }

    const antologia = await Antologia.findByPk(antologiaId, {
      lock: true,
      transaction
    });
    
    if (!antologia) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Antología no encontrada' });
    }

    const existingLike = await Like.findOne({
      where: {
        idusuario,
        idantologia: antologiaId
      },
      transaction
    });

    if (existingLike) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Ya has dado like a esta antología' });
    }

    await Like.create({
      idusuario,
      idantologia: antologiaId
    }, { transaction });

    await antologia.increment('likes', { transaction });
    await antologia.reload({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Like registrado exitosamente',
      data: {
        antologia: {
          id: antologia.id,
          likes: antologia.likes
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ 
      error: 'Error al procesar el like',
      details: error.message 
    });
  }
});

app.get('/likes/stats/:antologiaId', async (req, res) => {
  try {
    const { antologiaId } = req.params;
    
    const stats = await sequelize.query(`
      SELECT 
        a.id,
        a.titulo,
        COUNT(l.id) as total_likes,
        COUNT(DISTINCT l.idusuario) as unique_users,
        MAX(l.created_at) as last_like_date
      FROM antologias a
      LEFT JOIN likes l ON a.id = l.idantologia
      WHERE a.id = :antologiaId
      GROUP BY a.id, a.titulo
    `, {
      replacements: { antologiaId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!stats || stats.length === 0) {
      return res.status(404).json({ error: 'Antología no encontrada' });
    }

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      details: error.message 
    });
  }
});

// Endpoint para obtener todos los autores con paginación y búsqueda
app.get("/autores", async (req, res) => {
  try {
    console.log('Recibida solicitud GET /autores');
    const autores = await Autor.findAll({
      attributes: ['idautor', 'nombre', 'biografia', 'urlfoto'],
      order: [['nombre', 'ASC']]
    });

    console.log(`Se encontraron ${autores.length} autores`);
    res.json({ autores });
  } catch (error) {
    console.error("Error al obtener autores:", error);
    res.status(500).json({ 
      error: "Error al obtener los autores",
      details: error.message 
    });
  }
});

// Endpoint para obtener un autor específico con sus antologías
app.get("/autores/:id", async (req, res) => {
  try {
    const autor = await Autor.findByPk(req.params.id, {
      include: [{
        model: Antologia,
        attributes: ['id', 'titulo', 'contenido', 'tituloObra', 'autorObra', 'likes']
      }]
    });
    
    if (!autor) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }
    
    res.json(autor);
  } catch (error) {
    console.error("Error al obtener autor:", error);
    res.status(500).json({ 
      error: "Error al obtener el autor",
      details: error.message 
    });
  }
});

// Endpoint para obtener las antologías de un autor
app.get("/autores/:id/antologias", async (req, res) => {
  try {
    console.log(`Buscando antologías para el autor ID: ${req.params.id}`);
    
    const autor = await Autor.findByPk(req.params.id);
    if (!autor) {
      console.log('Autor no encontrado');
      return res.status(404).json({ error: "Autor no encontrado" });
    }

    console.log('Autor encontrado:', autor.nombre);

    const antologias = await Antologia.findAll({
      where: {
        idautor: req.params.id
      },
      attributes: ['id', 'titulo', 'contenido', 'tituloObra', 'autorObra', 'likes']
    });

    console.log(`Se encontraron ${antologias.length} antologías`);
    
    res.json({
      autor: {
        idautor: autor.idautor,
        nombre: autor.nombre,
        biografia: autor.biografia,
        urlfoto: autor.urlfoto
      },
      antologias: antologias
    });
  } catch (error) {
    console.error("Error al obtener antologías del autor:", error);
    res.status(500).json({ 
      error: "Error al obtener las antologías del autor",
      details: error.message 
    });
  }
});

// Endpoint para crear un nuevo autor
app.post("/autores", async (req, res) => {
  try {
    const { nombre, biografia, urlfoto } = req.body;

    if (!nombre || !biografia) {
      return res.status(400).json({ 
        error: "El nombre y la biografía son requeridos" 
      });
    }

    const autor = await Autor.create({
      nombre,
      biografia,
      urlfoto: urlfoto || null
    });

    res.status(201).json(autor);
  } catch (error) {
    console.error("Error al crear autor:", error);
    res.status(500).json({ 
      error: "Error al crear el autor",
      details: error.message 
    });
  }
});

// Endpoint para actualizar un autor
app.put("/autores/:id", async (req, res) => {
  try {
    const { nombre, biografia, urlfoto } = req.body;

    if (!nombre || !biografia) {
      return res.status(400).json({ 
        error: "El nombre y la biografía son requeridos" 
      });
    }

    const autor = await Autor.findByPk(req.params.id);
    
    if (!autor) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }

    await autor.update({
      nombre,
      biografia,
      urlfoto: urlfoto || autor.urlfoto
    });

    const autorActualizado = await Autor.findByPk(req.params.id, {
      include: [{
        model: Antologia,
        attributes: ['id', 'titulo', 'contenido', 'tituloObra', 'autorObra', 'likes']
      }]
    });

    res.json(autorActualizado);
  } catch (error) {
    console.error("Error al actualizar autor:", error);
    res.status(500).json({ 
      error: "Error al actualizar el autor",
      details: error.message 
    });
  }
});

// Endpoint para eliminar un autor
app.delete("/autores/:id", async (req, res) => {
  try {
    const autor = await Autor.findByPk(req.params.id);
    
    if (!autor) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }

    await autor.destroy();
    res.json({ message: "Autor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar autor:", error);
    res.status(500).json({ 
      error: "Error al eliminar el autor",
      details: error.message 
    });
  }
});

// Endpoint para crear una nueva antología
app.post("/antologia", async (req, res) => {
  try {
    const { titulo, contenido, referencia, tituloObra, autorObra, idautor } = req.body;

    // Validar campos requeridos
    if (!titulo || !contenido || !idautor) {
      return res.status(400).json({ 
        error: "El título, contenido y autor son requeridos" 
      });
    }

    // Verificar que el autor existe
    const autor = await Autor.findByPk(idautor);
    if (!autor) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }

    const antologia = await Antologia.create({
      titulo,
      contenido,
      referencia,
      tituloObra,
      autorObra,
      idautor,
      likes: 0
    });

    // Obtener la antología con los datos del autor
    const antologiaConAutor = await Antologia.findByPk(antologia.id, {
      include: [{
        model: Autor,
        attributes: ['nombre', 'biografia', 'urlfoto']
      }]
    });

    res.status(201).json(antologiaConAutor);
  } catch (error) {
    console.error("Error al crear antología:", error);
    res.status(500).json({ 
      error: "Error al crear la antología",
      details: error.message 
    });
  }
});

// Endpoint para actualizar una antología
app.put("/antologia/:id", async (req, res) => {
  try {
    const { titulo, contenido, referencia, tituloObra, autorObra, idautor } = req.body;

    // Validar campos requeridos
    if (!titulo || !contenido || !idautor) {
      return res.status(400).json({ 
        error: "El título, contenido y autor son requeridos" 
      });
    }

    // Verificar que la antología existe
    const antologia = await Antologia.findByPk(req.params.id);
    if (!antologia) {
      return res.status(404).json({ error: "Antología no encontrada" });
    }

    // Verificar que el autor existe
    const autor = await Autor.findByPk(idautor);
    if (!autor) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }

    // Actualizar la antología
    await antologia.update({
      titulo,
      contenido,
      referencia,
      tituloObra,
      autorObra,
      idautor
    });

    // Obtener la antología actualizada con los datos del autor
    const antologiaActualizada = await Antologia.findByPk(antologia.id, {
      include: [{
        model: Autor,
        attributes: ['nombre', 'biografia', 'urlfoto']
      }]
    });

    res.json(antologiaActualizada);
  } catch (error) {
    console.error("Error al actualizar antología:", error);
    res.status(500).json({ 
      error: "Error al actualizar la antología",
      details: error.message 
    });
  }
});

// Endpoint para eliminar una antología
app.delete("/antologia/:id", async (req, res) => {
  try {
    const antologia = await Antologia.findByPk(req.params.id);
    
    if (!antologia) {
      return res.status(404).json({ error: "Antología no encontrada" });
    }

    await antologia.destroy();
    res.json({ 
      success: true,
      message: "Antología eliminada correctamente" 
    });
  } catch (error) {
    console.error("Error al eliminar antología:", error);
    res.status(500).json({ 
      error: "Error al eliminar la antología",
      details: error.message 
    });
  }
});

// Endpoint para obtener una antología específica
app.get("/antologia/:id", async (req, res) => {
  try {
    const antologia = await Antologia.findByPk(req.params.id, {
      include: [{
        model: Autor,
        attributes: ['nombre', 'biografia', 'urlfoto']
      }]
    });
    
    if (!antologia) {
      return res.status(404).json({ error: "Antología no encontrada" });
    }
    
    res.json(antologia);
  } catch (error) {
    console.error("Error al obtener antología:", error);
    res.status(500).json({ 
      error: "Error al obtener la antología",
      details: error.message 
    });
  }
});

// Función para verificar si el puerto está en uso
const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port)
      .once('listening', () => {
        server.close();
        resolve(true);
      })
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Puerto ${port} está en uso, intentando con el siguiente...`);
          resolve(false);
        } else {
          reject(err);
        }
      });
  });
};

// Función para encontrar un puerto disponible
const findAvailablePort = async (startPort) => {
  let currentPort = startPort;
  while (currentPort < startPort + 10) { // Intentar hasta 10 puertos
    if (await checkPort(currentPort)) {
      return currentPort;
    }
    currentPort++;
  }
  throw new Error('No se encontró un puerto disponible');
};

// Manejo de señales de terminación
const handleShutdown = async () => {
  console.log('\nRecibida señal de terminación. Cerrando servidor...');
  try {
    await sequelize.close();
    console.log('Conexión a la base de datos cerrada.');
    process.exit(0);
  } catch (error) {
    console.error('Error al cerrar la conexión:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

// Iniciar aplicación
const startServer = async () => {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    console.log('Base de datos inicializada correctamente.');

    // Encontrar puerto disponible
    const availablePort = await findAvailablePort(port);
    
    // Iniciar servidor
    app.listen(availablePort, () => {
      console.log(`Servidor escuchando en http://localhost:${availablePort}`);
    });

  } catch (error) {
    console.error('Error fatal al inicializar la aplicación:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();
