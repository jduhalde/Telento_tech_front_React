import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import inventarioAPI from '../services/inventarioAPI';

const Carrito = () => {
    const { items, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, calcularTotal } = useCarrito();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(precio);
    };

    const handleFinalizarCompra = async () => {
        if (items.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        setProcesando(true);

        try {
            const itemsParaCompra = items.map(item => ({
                id: item.id,
                cantidad: item.cantidad
            }));

            await inventarioAPI.procesarCompra(itemsParaCompra);
            alert('¡Compra realizada exitosamente! El stock ha sido actualizado.');
            vaciarCarrito();
            navigate('/products');
        } catch (error) {
            const mensaje = error.response?.data?.detalles?.join('\n') ||
                error.response?.data?.error ||
                'Error al procesar la compra';
            alert(mensaje);
        } finally {
            setProcesando(false);
        }
    };

    // Carrito vacío
    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Carrito de Compras</h1>
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500 text-lg mb-4">Tu carrito está vacío</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Ir a Productos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Carrito de Compras</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de productos */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 border-b last:border-b-0"
                            >
                                {/* Info del producto */}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{item.nombre}</h3>
                                    <p className="text-gray-500 text-sm">{item.categoria}</p>
                                    <p className="text-blue-600 font-semibold mt-1">
                                        {formatearPrecio(item.precio)}
                                    </p>
                                </div>

                                {/* Controles de cantidad */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                        className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-semibold">
                                        {item.cantidad}
                                    </span>
                                    <button
                                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                        className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Subtotal */}
                                <div className="text-right min-w-[100px]">
                                    <p className="font-semibold">
                                        {formatearPrecio(item.subtotal)}
                                    </p>
                                </div>

                                {/* Botón eliminar */}
                                <button
                                    onClick={() => eliminarDelCarrito(item.id)}
                                    className="text-red-600 hover:text-red-800 font-semibold"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={vaciarCarrito}
                        className="mt-4 text-red-600 hover:text-red-800 font-semibold"
                    >
                        Vaciar carrito
                    </button>
                </div>

                {/* Resumen de compra */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Resumen de Compra</h2>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Productos ({items.length})</span>
                                <span>{formatearPrecio(calcularTotal())}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Envío</span>
                                <span>Gratis</span>
                            </div>
                        </div>

                        <div className="border-t pt-4 mb-6">
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span className="text-blue-600">
                                    {formatearPrecio(calcularTotal())}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleFinalizarCompra}
                            disabled={procesando}
                            className={`w-full py-3 rounded-lg font-semibold ${procesando
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            {procesando ? 'Procesando...' : 'Finalizar Compra'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carrito;