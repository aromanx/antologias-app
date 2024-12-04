# Antologías App

Aplicación web para gestionar antologías literarias, desarrollada con React y Node.js.

## Características

- Gestión de antologías y autores
- Visualización de obras en formato libro
- Sistema de likes
- Panel de administración
- Juego de versos
- Interfaz responsive y moderna

## Tecnologías Utilizadas

- Frontend:
  - React
  - Vite
  - Tailwind CSS
  - Shadcn/ui
  - React Router

- Backend:
  - Node.js
  - Express
  - SQLite
  - Sequelize

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Docker y Docker Compose (opcional)

## Instalación y Ejecución Local

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/antologias-app.git
cd antologias-app
```

2. Instalar dependencias del frontend:
```bash
npm install
```

3. Instalar dependencias del backend:
```bash
cd servidor
npm install
```

4. Configurar variables de entorno:
   - Copiar `.env.example` a `.env` en ambos directorios
   - Ajustar las variables según sea necesario

5. Iniciar el servidor:
```bash
cd servidor
npm run dev
```

6. Iniciar el frontend:
```bash
cd ..
npm run dev
```

## Ejecución con Docker

1. Construir las imágenes:
```bash
docker-compose build
```

2. Iniciar los servicios:
```bash
docker-compose up -d
```

La aplicación estará disponible en:
- Frontend: http://localhost
- Backend: http://localhost:3000
- Adminer: http://localhost:8080

## Estructura del Proyecto

```
antologias-app/
├── src/                    # Código fuente del frontend
│   ├── components/        # Componentes React
│   ├── config/           # Configuración
│   ├── styles/          # Estilos CSS
│   └── lib/            # Utilidades
├── servidor/            # Código fuente del backend
│   ├── db/            # Archivos de base de datos
│   └── services/     # Servicios del backend
├── docker-compose.yml  # Configuración de Docker
└── README.md         # Documentación
```

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
