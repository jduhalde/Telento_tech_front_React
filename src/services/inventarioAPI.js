import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la API:', error);

    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const inventarioAPI = {

  test: async () => {
    try {
      const response = await api.get('/test');
      return response.data;
    } catch (error) {
      throw new Error('Error de conexión');
    }
  },

  getCategorias: async () => {
    try {
      const response = await api.get('/categorias/');
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener categorías');
    }
  },

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