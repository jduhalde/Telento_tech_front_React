Comida al Paso - Frontend

Aplicación web moderna para delivery de comida rápida. Permite a los usuarios navegar el menú, gestionar un carrito de compras y realizar pedidos. Incluye un panel de administración integrado para gestionar productos (CRUD).

Tecnologías y Herramientas:

Este proyecto fue desarrollado con Vite + React y utiliza las siguientes librerías:

Estilos: Tailwind CSS y Bootstrap (Sistema de grillas).

Componentes Modulares: styled-components para botones personalizados.

Iconografía: react-icons.

Notificaciones: react-toastify para mensajes de estado.

SEO: react-helmet-async para gestión de metadatos.

Estado Global: Context API (AuthContext, CarritoContext).

Navegación: React Router DOM.

Funcionalidades:

Usuarios (Clientes)

Catálogo: Vista de productos con filtros por categoría y buscador en tiempo real.

Carrito: Funcionalidad para agregar/quitar productos y cálculo de total.

Persistencia: El carrito se mantiene guardado en el navegador (localStorage).

Administradores (Staff)

Login Seguro: Autenticación mediante Tokens JWT.

Gestión de Productos (CRUD):

Crear nuevos platos.

Editar precios, stock y descripciones.

Eliminar productos.

Interfaz condicional: Los botones de edición solo son visibles para usuarios administradores.

Instalación:

Acceder a la carpeta del proyecto
Ingresa a la carpeta frontend desde tu terminal.

Instalar dependencias
Ejecuta el siguiente comando para descargar las librerías necesarias.

npm install

Ejecutar en desarrollo
Inicia el servidor local de Vite.

npm run dev

La aplicación estará disponible en http://localhost:5173

Estructura de Archivos

src/context/: Contiene la lógica de Autenticación y del Carrito de compras.

src/services/: Configuración de Axios para conectar con el Backend.

src/pages/: Vistas principales (Home, Products, Login, etc.).

src/components/: Componentes reutilizables (ProductCard, Navbar, etc.).

Despliegue:

El proyecto está preparado para ser desplegado en servicios como Vercel o Netlify como una Single Page Application (SPA).

Autor: Julio C. Duhalde. Curso de React. Talento tech. 2025