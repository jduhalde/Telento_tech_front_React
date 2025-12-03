import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la API:', error);

    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const inventarioAPI = {

  // ============== TEST ==============
  test: async () => {
    try {
      const response = await api.get('/test');
      return response.data;
    } catch (error) {
      throw new Error('Error al probar la conexión con la API');
    }
  },

  // ============== CATEGORÍAS ==============
  getCategorias: async () => {
    try {
      const response = await api.get('/categorias/?page_size=100');
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener categorías');
    }
  },

  createCategoria: async (nombre, descripcion) => {
    try {
      const response = await api.post('/categorias/crear/', {
        nombre,
        descripcion
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al crear categoría');
    }
  },

  // ============== PRODUCTOS ==============

  // Obtener productos paginados con filtros opcionales
  getProductos: async (page = 1, pageSize = 10, filters = {}) => {
    try {
      let url = `/productos/?page=${page}&page_size=${pageSize}`;

      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
      if (filters.categoria) {
        url += `&categoria=${filters.categoria}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener productos');
    }
  },

  // Obtener todos los productos (sin paginación, para filtros locales)
  getAllProductos: async () => {
    try {
      const response = await api.get('/productos/?page_size=100');
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener todos los productos');
    }
  },

  // Obtener un producto por ID
  getProductoById: async (id) => {
    try {
      const response = await api.get(`/productos/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener el producto');
    }
  },

  // Obtener productos por categoría
  getProductosByCategoria: async (categoriaId) => {
    try {
      const response = await api.get(`/productos/?categoria=${categoriaId}&page_size=100`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener productos por categoría');
    }
  },

  // Crear nuevo producto (admin)
  createProducto: async (productoData) => {
    try {
      const response = await api.post('/productos/crear/', productoData);
      return response.data;
    } catch (error) {
      throw new Error('Error al crear producto');
    }
  },

  // Actualizar producto (admin)
  updateProducto: async (id, productoData) => {
    try {
      const response = await api.put(`/productos/${id}/`, productoData);
      return response.data;
    } catch (error) {
      throw new Error('Error al actualizar producto');
    }
  },

  // Eliminar producto (admin)
  deleteProducto: async (id) => {
    try {
      const response = await api.delete(`/productos/${id}/eliminar/`);
      return response.data;
    } catch (error) {
      throw new Error('Error al eliminar producto');
    }
  },

  // ============== COMPRAS ==============

  procesarCompra: async (items) => {
    try {
      const response = await api.post('/comprar/', { items });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al procesar la compra');
    }
  },
};

export default inventarioAPI;