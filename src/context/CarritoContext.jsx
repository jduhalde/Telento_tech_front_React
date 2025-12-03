import { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext();

export const useCarrito = () => {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error('useCarrito debe usarse dentro de CarritoProvider');
    }
    return context;
};

export const CarritoProvider = ({ children }) => {
    const [items, setItems] = useState([]);

    // Cargar carrito desde localStorage al iniciar
    useEffect(() => {
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            try {
                setItems(JSON.parse(carritoGuardado));
            } catch (error) {
                console.error('Error al cargar carrito:', error);
                localStorage.removeItem('carrito');
            }
        }
    }, []);

    // Guardar en localStorage cada vez que cambie el carrito
    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(items));
    }, [items]);

    // Agregar producto al carrito
    const agregarAlCarrito = (producto, cantidad = 1) => {
        if (cantidad <= 0) return false;
        if (cantidad > producto.stock) return false;

        setItems(prevItems => {
            const itemExistente = prevItems.find(item => item.id === producto.id);

            if (itemExistente) {
                const nuevaCantidad = itemExistente.cantidad + cantidad;
                if (nuevaCantidad > producto.stock) return prevItems;

                return prevItems.map(item =>
                    item.id === producto.id
                        ? {
                            ...item,
                            cantidad: nuevaCantidad,
                            subtotal: nuevaCantidad * item.precio
                        }
                        : item
                );
            } else {
                return [
                    ...prevItems,
                    {
                        id: producto.id,
                        nombre: producto.nombre,
                        categoria: producto.categoria?.nombre || producto.categoria,
                        precio: parseFloat(producto.precio),
                        cantidad: cantidad,
                        subtotal: parseFloat(producto.precio) * cantidad,
                        stock: producto.stock
                    }
                ];
            }
        });
        return true;
    };

    const eliminarDelCarrito = (productoId) => {
        setItems(prevItems => prevItems.filter(item => item.id !== productoId));
    };

    const actualizarCantidad = (productoId, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(productoId);
            return;
        }
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.id === productoId) {
                    if (nuevaCantidad > item.stock) return item;
                    return {
                        ...item,
                        cantidad: nuevaCantidad,
                        subtotal: nuevaCantidad * item.precio
                    };
                }
                return item;
            })
        );
    };

    // Función para vaciar manualmente (ej: botón "Vaciar")
    const vaciarCarrito = () => {
        setItems([]);
    };

    // ==========================================
    // ¡LA PIEZA FALTANTE! 🧩
    // ==========================================
    const finalizarCompra = () => {
        // 1. REGISTRAR VENTA EN ANALÍTICA
        try {
            const hoy = new Date().toLocaleDateString();
            const key = `analytics_${hoy}`;
            // Leemos lo que hay y sumamos 1 venta
            const datos = JSON.parse(localStorage.getItem(key)) || { visitas: 0, ventas: 0 };
            datos.ventas += 1;
            localStorage.setItem(key, JSON.stringify(datos));
        } catch (error) {
            console.error("Error al registrar estadística de venta", error);
        }

        // 2. VACIAR CARRITO
        setItems([]);
    };

    const calcularTotal = () => {
        return items.reduce((total, item) => total + item.subtotal, 0);
    };

    const obtenerCantidadTotal = () => {
        return items.reduce((total, item) => total + item.cantidad, 0);
    };

    const value = {
        items,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        finalizarCompra, // <--- Exportamos la nueva función mágica
        calcularTotal,
        obtenerCantidadTotal
    };

    return (
        <CarritoContext.Provider value={value}>
            {children}
        </CarritoContext.Provider>
    );
};