import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import inventarioAPI from '../services/inventarioAPI';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaFilter, FaTimes, FaSave, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const Products = () => {
    const { user } = useAuth();
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtros y Paginación
    const [search, setSearch] = useState('');
    const [categoria, setCategoria] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Estado para el Modal de Edición/Creación
    const [modalOpen, setModalOpen] = useState(false);
    const [productoEditar, setProductoEditar] = useState(null);

    // Cargar categorías al montar
    useEffect(() => {
        cargarCategorias();
    }, []);

    // Cargar productos al cambiar filtros/página
    useEffect(() => {
        cargarProductos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, categoria]);

    const cargarCategorias = async () => {
        try {
            const data = await inventarioAPI.getCategorias();
            setCategorias(data.results || data);
        } catch (error) {
            console.error("Error cargando categorías:", error);
        }
    };

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const filters = { search, categoria };
            const data = await inventarioAPI.getProductos(page, 9, filters);
            
            if (data.results) {
                setProductos(data.results);
                setTotalPages(Math.ceil(data.count / 9)); 
            } else {
                setProductos(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este producto?")) {
            try {
                await inventarioAPI.deleteProducto(id);
                toast.success("Producto eliminado correctamente");
                cargarProductos();
            } catch (error) {
                toast.error("Error al eliminar el producto");
            }
        }
    };

    const handleAbrirModal = (producto = null) => {
        setProductoEditar(producto);
        setModalOpen(true);
    };

    const handleGuardarProducto = async (e) => {
        e.preventDefault();
        const form = e.target;
        
        const nombre = form.nombre.value;
        const precio = parseFloat(form.precio.value);
        const descripcion = form.descripcion.value;
        const stock = parseInt(form.stock.value);
        const categoriaId = form.categoria.value;

        if (!nombre || precio <= 0 || descripcion.length < 10) {
            toast.warning("Revisa los datos: Nombre obligatorio, Precio > 0, Descripción > 10 caracteres.");
            return;
        }

        const datos = {
            nombre,
            precio,
            descripcion,
            stock,
            categoria: categoriaId
        };

        try {
            if (productoEditar) {
                await inventarioAPI.updateProducto(productoEditar.id, datos);
                toast.success("Producto actualizado");
            } else {
                await inventarioAPI.createProducto(datos);
                toast.success("Producto creado");
            }
            setModalOpen(false);
            cargarProductos();
        } catch (error) {
            console.error("Error al guardar:", error);
            toast.error("Error al guardar. Verifica la conexión.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Helmet>
                <title>Menú | Comida al Paso</title>
            </Helmet>

            {/* BARRA DE CONTROL SUPERIOR */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Nuestro Menú</h1>
                
                {/* Buscador */}
                <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 px-4 py-2 w-full md:w-auto">
                    <FaSearch className="text-gray-400 mr-2" />
                    <input 
                        type="text" 
                        placeholder="Buscar producto..." 
                        className="outline-none w-full md:w-64"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                {/* Filtro Categoría */}
                <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 px-4 py-2">
                    <FaFilter className="text-gray-400 mr-2" />
                    <select 
                        className="outline-none bg-transparent"
                        value={categoria}
                        onChange={(e) => { setCategoria(e.target.value); setPage(1); }}
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Botón Crear (Solo Admin) */}
                {user?.is_staff && (
                    <button 
                        onClick={() => handleAbrirModal(null)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                    >
                        <FaPlus /> Nuevo Plato
                    </button>
                )}
            </div>

            {/* GRILLA DE PRODUCTOS */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productos.length > 0 ? (
                        productos.map(prod => (
                            <ProductCard 
                                key={prod.id} 
                                producto={prod}
                                onEdit={user?.is_staff ? handleAbrirModal : undefined}
                                onDelete={user?.is_staff ? handleEliminar : undefined}
                            />
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-10 text-gray-500">
                            No encontramos productos con esa búsqueda.
                        </div>
                    )}
                </div>
            )}

            {/* PAGINADOR */}
            <div className="flex justify-center mt-10 gap-4 items-center">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-2 rounded-full bg-white shadow-md disabled:opacity-50 hover:bg-gray-100"
                >
                    <FaArrowLeft />
                </button>
                <span className="font-bold text-gray-700">Página {page} de {totalPages || 1}</span>
                <button 
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-2 rounded-full bg-white shadow-md disabled:opacity-50 hover:bg-gray-100"
                >
                    <FaArrowRight />
                </button>
            </div>

            {/* MODAL DE EDICIÓN/CREACIÓN */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                            <h2 className="font-bold text-xl">{productoEditar ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={() => setModalOpen(false)}><FaTimes size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleGuardarProducto} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Plato</label>
                                <input name="nombre" defaultValue={productoEditar?.nombre} className="w-full border rounded p-2 focus:ring-2 ring-blue-500 outline-none" required />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Precio ($)</label>
                                    <input name="precio" type="number" step="0.01" defaultValue={productoEditar?.precio} className="w-full border rounded p-2" required min="1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                                    <input name="stock" type="number" defaultValue={productoEditar?.stock} className="w-full border rounded p-2" required min="0" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                                <select 
                                    name="categoria" 
                                    defaultValue={productoEditar?.categoria?.id || productoEditar?.categoria || ''} 
                                    className="w-full border rounded p-2 bg-white"
                                    required
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea name="descripcion" defaultValue={productoEditar?.descripcion} className="w-full border rounded p-2 h-24 resize-none" placeholder="Ingredientes, detalles..." required></textarea>
                                <p className="text-xs text-gray-500 mt-1">Mínimo 10 caracteres.</p>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4">
                                <FaSave /> Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;