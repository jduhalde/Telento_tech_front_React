import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext'; // Importamos Auth para saber si es Admin
import { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
// Importamos iconos de Carrito y de Admin (Editar/Borrar)
import { FaCartPlus, FaHamburger, FaPizzaSlice, FaDrumstickBite, FaIceCream, FaWineGlass, FaUtensils, FaLeaf, FaBreadSlice, FaFish, FaEdit, FaTrash } from 'react-icons/fa';

// Botón Estilizado General
const BotonBase = styled.button`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:active { transform: translateY(0); }
  &:hover { transform: translateY(-2px); }
`;

// Variantes del botón
const BotonAgregar = styled(BotonBase)`
  background: linear-gradient(45deg, #2563eb, #1d4ed8);
  color: white;
  &:hover { background: linear-gradient(45deg, #1d4ed8, #1e40af); }
  &:disabled { background: #9ca3af; cursor: not-allowed; transform: none; box-shadow: none; }
`;

const BotonEditar = styled(BotonBase)`
  background: #f59e0b; /* Ambar/Naranja */
  color: white;
  margin-bottom: 0.5rem;
  &:hover { background: #d97706; }
`;

const BotonEliminar = styled(BotonBase)`
  background: #ef4444; /* Rojo */
  color: white;
  &:hover { background: #dc2626; }
`;

// Aceptamos props nuevas: onEdit y onDelete (vienen del padre)
const ProductCard = ({ producto, onEdit, onDelete }) => {
    const { agregarAlCarrito } = useCarrito();
    const { user } = useAuth(); // Obtenemos el usuario actual
    const [cantidad, setCantidad] = useState(1);

    // Normalización de datos
    const nombre = producto.nombre || producto.name || "Producto";
    const precio = producto.precio || producto.price || 0;
    const stock = producto.stock || 0;
    const categoriaRaw = producto.categoria_nombre || producto.category_name || producto.categoria || producto.category || "General";
    const cat = String(categoriaRaw).toLowerCase().trim();

    // Lógica para Clientes
    const handleAgregar = () => {
        const exito = agregarAlCarrito(producto, cantidad);
        if (exito) {
            toast.success(`¡Agregado: ${cantidad} x ${nombre}! 🛒`, {
                position: "bottom-right",
                theme: "colored",
                autoClose: 2000,
            });
            setCantidad(1);
        } else {
            toast.error("Error al agregar al carrito");
        }
    };

    const formatearPrecio = (valor) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(valor);
    };

    const getEmojiCategoria = (categoriaTexto) => {
        const mapping = [
            { keywords: ['hamburguesa', 'burger'], emoji: '🍔' },
            { keywords: ['pizza'], emoji: '🍕' },
            { keywords: ['empanada'], emoji: '🥟' },
            { keywords: ['parrilla', 'carne', 'asado', 'lomo', 'bife'], emoji: '🥩' },
            { keywords: ['pasta', 'fideo', 'spaghetti', 'macarron'], emoji: '🍝' },
            { keywords: ['ensalada', 'vegetariano', 'vegano', 'sano'], emoji: '🥗' },
            { keywords: ['bebida', 'gaseosa', 'agua', 'refresco'], emoji: '🥤' },
            { keywords: ['trago', 'cerveza', 'vino', 'alcohol'], emoji: '🍷' },
            { keywords: ['postre', 'helado', 'dulce', 'torta', 'pastel'], emoji: '🍰' },
            { keywords: ['pescado', 'marisco', 'sushi'], emoji: '🍣' },
            { keywords: ['pan', 'sandwich', 'bocadillo'], emoji: '🥪' },
            { keywords: ['cafe', 'desayuno'], emoji: '☕' },
        ];
        const found = mapping.find(item => item.keywords.some(k => categoriaTexto.includes(k)));
        return found ? found.emoji : '🍽️';
    };

    // Verificamos si es Admin (staff)
    const isAdmin = user?.is_staff;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full relative">
            
            {/* Badge de Admin (Visual) */}
            {isAdmin && (
                <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    MODO ADMIN
                </div>
            )}

            <div className="h-48 bg-gray-100 flex items-center justify-center">
                <span style={{ fontSize: '6rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
                    {getEmojiCategoria(cat)}
                </span>
            </div>

            <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 leading-tight">{nombre}</h3>
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
                                {categoriaRaw}
                            </span>
                        </div>
                    </div>

                    <p className="text-2xl font-bold text-blue-600 mb-4">
                        {formatearPrecio(precio)}
                    </p>

                    <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                        <span>Stock:</span>
                        <span className={`font-semibold ${stock < 5 ? 'text-orange-500' : 'text-green-600'}`}>
                            {stock} un.
                        </span>
                    </div>
                </div>

                {/* ZONA DE CONTROL: Cambia según el rol */}
                <div className="mt-auto">
                    {isAdmin ? (
                        // 1. VISTA DE ADMINISTRADOR
                        <div className="flex flex-col gap-2">
                            {/* Usamos onEdit del padre, o una función vacía si no existe para evitar errores */}
                            <BotonEditar onClick={() => onEdit && onEdit(producto)}>
                                <FaEdit /> Editar Producto
                            </BotonEditar>
                            <BotonEliminar onClick={() => onDelete && onDelete(producto.id)}>
                                <FaTrash /> Eliminar
                            </BotonEliminar>
                        </div>
                    ) : (
                        // 2. VISTA DE CLIENTE (Carrito)
                        stock > 0 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
                                    <button 
                                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                        className="px-4 py-2 hover:bg-gray-200 text-gray-600 font-bold"
                                    > - </button>
                                    <input
                                        type="number"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(Math.max(1, Math.min(stock, parseInt(e.target.value) || 1)))}
                                        className="w-12 text-center border-x border-gray-200 py-2 focus:outline-none bg-white"
                                    />
                                    <button 
                                        onClick={() => setCantidad(Math.min(stock, cantidad + 1))}
                                        className="px-4 py-2 hover:bg-gray-200 text-gray-600 font-bold"
                                    > + </button>
                                </div>
                                <BotonAgregar onClick={handleAgregar}>
                                    <FaCartPlus /> Agregar
                                </BotonAgregar>
                            </div>
                        ) : (
                            <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3 rounded">
                                Agotado
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;