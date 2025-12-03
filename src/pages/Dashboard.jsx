import { useState, useEffect } from 'react';
import inventarioAPI from '../services/inventarioAPI';

const Dashboard = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========== PAGINACIÓN ==========
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  const pageSize = 10;

  // ========== FILTROS ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');

  // Estados para formularios
  const [showProductoForm, setShowProductoForm] = useState(false);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  // Formulario de producto
  const [formProducto, setFormProducto] = useState({
    nombre: '',
    categoria: '',
    precio: '',
    stock: ''
  });

  // Formulario de categoría
  const [formCategoria, setFormCategoria] = useState({
    nombre: '',
    descripcion: ''
  });

  // Cargar categorías al montar
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await inventarioAPI.getCategorias();
        setCategorias(data.results || data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    fetchCategorias();
  }, []);

  // Cargar productos cuando cambia página o filtros
  useEffect(() => {
    cargarProductos();
  }, [currentPage, searchTerm, categoriaFilter]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (categoriaFilter) filters.categoria = categoriaFilter;

      const data = await inventarioAPI.getProductos(currentPage, pageSize, filters);

      setProductos(data.results || data);
      setTotalProductos(data.count || data.length);
      setTotalPages(Math.ceil((data.count || data.length) / pageSize));
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLERS DE PAGINACIÓN ==========
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Reset página al cambiar filtros
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoriaFilterChange = (e) => {
    setCategoriaFilter(e.target.value);
    setCurrentPage(1);
  };

  // Generar números de página
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Manejar cambios en formulario de producto
  const handleProductoChange = (e) => {
    setFormProducto({
      ...formProducto,
      [e.target.name]: e.target.value
    });
  };

  // Manejar cambios en formulario de categoría
  const handleCategoriaChange = (e) => {
    setFormCategoria({
      ...formCategoria,
      [e.target.name]: e.target.value
    });
  };

  // Crear o actualizar producto
  const handleSubmitProducto = async (e) => {
    e.preventDefault();

    if (!formProducto.nombre || !formProducto.categoria || !formProducto.precio || formProducto.stock === '') {
      alert('Por favor completa todos los campos');
      return;
    }

    if (parseFloat(formProducto.precio) <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    if (parseInt(formProducto.stock) < 0) {
      alert('El stock no puede ser negativo');
      return;
    }

    try {
      if (modoEdicion && productoEditando) {
        await inventarioAPI.updateProducto(productoEditando.id, formProducto);
        alert('Producto actualizado correctamente');
      } else {
        await inventarioAPI.createProducto(formProducto);
        alert('Producto creado correctamente');
      }

      setFormProducto({ nombre: '', categoria: '', precio: '', stock: '' });
      setShowProductoForm(false);
      setModoEdicion(false);
      setProductoEditando(null);
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el producto');
    }
  };

  // Crear categoría
  const handleSubmitCategoria = async (e) => {
    e.preventDefault();

    if (!formCategoria.nombre) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      await inventarioAPI.createCategoria(formCategoria.nombre, formCategoria.descripcion);
      alert('Categoría creada correctamente');
      setFormCategoria({ nombre: '', descripcion: '' });
      setShowCategoriaForm(false);
      // Recargar categorías
      const data = await inventarioAPI.getCategorias();
      setCategorias(data.results || data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la categoría');
    }
  };

  // Abrir formulario para editar producto
  const handleEditarProducto = (producto) => {
    setModoEdicion(true);
    setProductoEditando(producto);
    setFormProducto({
      nombre: producto.nombre,
      categoria: producto.categoria?.id || producto.categoria,
      precio: producto.precio,
      stock: producto.stock
    });
    setShowProductoForm(true);
  };

  // Abrir modal de confirmación de eliminación
  const handleAbrirModalEliminar = (producto) => {
    setProductoAEliminar(producto);
    setShowDeleteModal(true);
  };

  // Eliminar producto
  const handleEliminarProducto = async () => {
    if (!productoAEliminar) return;

    try {
      await inventarioAPI.deleteProducto(productoAEliminar.id);
      alert('Producto eliminado correctamente');
      setShowDeleteModal(false);
      setProductoAEliminar(null);
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el producto');
    }
  };

  // Cancelar edición
  const handleCancelarEdicion = () => {
    setShowProductoForm(false);
    setModoEdicion(false);
    setProductoEditando(null);
    setFormProducto({ nombre: '', categoria: '', precio: '', stock: '' });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(precio);
  };

  if (loading && productos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard de Administración</h1>

      {/* Botones para abrir formularios */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => {
            setModoEdicion(false);
            setProductoEditando(null);
            setFormProducto({ nombre: '', categoria: '', precio: '', stock: '' });
            setShowProductoForm(!showProductoForm);
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {showProductoForm && !modoEdicion ? 'Cancelar' : 'Nuevo Producto'}
        </button>
        <button
          onClick={() => setShowCategoriaForm(!showCategoriaForm)}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          {showCategoriaForm ? 'Cancelar' : 'Nueva Categoría'}
        </button>
      </div>

      {/* Formulario de Producto */}
      {showProductoForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {modoEdicion ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h2>
          <form onSubmit={handleSubmitProducto}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formProducto.nombre}
                  onChange={handleProductoChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del producto"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Categoría *</label>
                <select
                  name="categoria"
                  value={formProducto.categoria}
                  onChange={handleProductoChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Precio *</label>
                <input
                  type="number"
                  name="precio"
                  value={formProducto.precio}
                  onChange={handleProductoChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="1"
                  step="1"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formProducto.stock}
                  onChange={handleProductoChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                {modoEdicion ? 'Actualizar Producto' : 'Crear Producto'}
              </button>
              {modoEdicion && (
                <button
                  type="button"
                  onClick={handleCancelarEdicion}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Formulario de Categoría */}
      {showCategoriaForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Crear Nueva Categoría</h2>
          <form onSubmit={handleSubmitCategoria}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formCategoria.nombre}
                  onChange={handleCategoriaChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={formCategoria.descripcion}
                  onChange={handleCategoriaChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Descripción opcional"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Crear Categoría
            </button>
          </form>
        </div>
      )}

      {/* ========== FILTROS ========== */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoriaFilter}
          onChange={handleCategoriaFilterChange}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-bold">Productos ({totalProductos})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Precio</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{producto.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{producto.nombre}</td>
                    <td className="px-6 py-4 text-sm">
                      {producto.categoria?.nombre || producto.categoria}
                    </td>
                    <td className="px-6 py-4 text-sm">{formatearPrecio(producto.precio)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${producto.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : producto.stock > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditarProducto(producto)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleAbrirModalEliminar(producto)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== PAGINACIÓN ========== */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <p className="text-sm text-gray-600">
            Mostrando {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, totalProductos)} de {totalProductos} productos
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
            >
              Anterior
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`px-3 py-2 rounded-lg ${currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Tabla de Categorías */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-bold">Categorías ({categorias.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    No hay categorías registradas
                  </td>
                </tr>
              ) : (
                categorias.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{categoria.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{categoria.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {categoria.descripcion || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el producto{' '}
              <strong>"{productoAEliminar?.nombre}"</strong>?
            </p>
            <p className="text-red-600 text-sm mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductoAEliminar(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarProducto}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;