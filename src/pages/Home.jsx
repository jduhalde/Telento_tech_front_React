import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import inventarioAPI from '../services/inventarioAPI';
import { Helmet } from 'react-helmet-async'; // Requerimiento #3: SEO
import { FaUtensils, FaArrowRight, FaStar } from 'react-icons/fa'; // Iconos decorativos

function Home() {
    const [productosDestacados, setProductosDestacados] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarProductos = async () => {
            try {
                const data = await inventarioAPI.getProductos();
                const productos = data.results || data;
                // Filtrar productos con stock y tomar los primeros 3
                const destacados = productos.filter(p => p.stock > 0).slice(0, 3);
                setProductosDestacados(destacados);
            } catch (error) {
                console.error('Error al cargar productos:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarProductos();
    }, []);

    const navegarAProductos = () => {
        navigate('/products');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Requerimiento #3: SEO con React Helmet */}
            <Helmet>
                <title>Comida al Paso | La mejor comida rápida</title>
                <meta name="description" content="Pide tus hamburguesas, pizzas y empanadas favoritas online. Envío rápido y comida fresca." />
            </Helmet>

            {/* HERO SECTION (Bienvenida) */}
            <section className="text-center mb-16 mt-10">
                <div className="animate-fade-in-down">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-blue-800 mb-6 tracking-tight">
                        Sabor que te <span className="text-orange-500">Mueve</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        La comida que te encanta, preparada al momento y lista para llevar o disfrutar aquí.
                    </p>

                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={navegarAProductos} 
                            className="text-lg bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-3"
                        >
                            <FaUtensils /> Ver Menú Completo
                        </button>
                    </div>
                </div>
            </section>

            {/* SECCIÓN DE BENEFICIOS (Decorativa y estática) */}
            <section className="grid md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto text-center">
                <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">🚀</div>
                    <h3 className="font-bold text-gray-800 text-lg">Envío Rápido</h3>
                    <p className="text-gray-500">Llegamos caliente a tu puerta.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">🥦</div>
                    <h3 className="font-bold text-gray-800 text-lg">Ingredientes Frescos</h3>
                    <p className="text-gray-500">Calidad seleccionada a diario.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">💳</div>
                    <h3 className="font-bold text-gray-800 text-lg">Pago Seguro</h3>
                    <p className="text-gray-500">Aceptamos todas las tarjetas.</p>
                </div>
            </section>

            {/* PRODUCTOS DESTACADOS */}
            <section className="bg-blue-50 py-16 px-4 rounded-3xl relative overflow-hidden">
                {/* Elemento decorativo de fondo */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-50"></div>

                <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-blue-200 pb-6 relative z-10">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-2">
                            <FaStar className="text-yellow-400" /> Favoritos de la Casa
                        </h2>
                        <p className="text-gray-500 mt-2">Los platos más pedidos de la semana</p>
                    </div>
                    <button 
                        onClick={navegarAProductos}
                        className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
                    >
                        Ver todo el catálogo <FaArrowRight />
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : productosDestacados.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        {productosDestacados.map(producto => (
                            <ProductCard
                                key={producto.id}
                                producto={producto}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10 bg-white rounded-lg border border-dashed border-gray-300">
                        <p>No hay productos destacados por el momento.</p>
                    </div>
                )}

                <div className="text-center mt-12 md:hidden">
                    <button 
                        onClick={navegarAProductos}
                        className="text-blue-600 font-bold hover:text-blue-800 text-lg w-full py-3 bg-white rounded-lg shadow-sm"
                    >
                        Ver todo el catálogo →
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Home;