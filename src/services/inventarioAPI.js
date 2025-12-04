import axios from 'axios';

// 🔥 CAMBIO CLAVE: Escribimos la dirección de Railway directamente.
// Esto elimina cualquier problema con las variables de Vercel.
const BASE_URL = 'https://telentotechbackreact-production.up.railway.app/api';

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

    // Si el token expiró (401), cerrar sesión
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      // Opcional: Redirigir al login si no estamos ya ahí
      if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
      }
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
      throw new Error('Error de conexión');
    }
  },

  // ============== PRODUCTOS ==============

  getProductos: async (page = 1, pageSize = 9, filters = {}) => {
    try {
      let url = `/productos/?page=${page}&page_size=${pageSize}`;
      if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.categoria) url += `&categoria=${encodeURIComponent(filters.categoria)}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener productos');
    }
  },

  createProducto: async (productoData) => {
    const response = await api.post('/productos/crear/', productoData);
    return response.data;
  },

  updateProducto: async (id, productoData) => {
    const response = await api.put(`/productos/${id}/`, productoData);
    return response.data;
  },

  deleteProducto: async (id) => {
    const response = await api.delete(`/productos/${id}/eliminar/`);
    return response.data;
  },

  // ============== COMPRAS ==============

  procesarCompra: async (items) => {
    try {
      const response = await api.post('/comprar/', { items });
      return response.data;
    } catch (error) {
      throw new Error('Error al procesar la compra');
    }
  },
};

export default inventarioAPI;