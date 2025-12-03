import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { FaHamburger, FaShoppingCart, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaHome, FaUtensils, FaChartLine, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { obtenerCantidadTotal } = useCarrito();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/cerrar menú

  const cantidadItems = obtenerCantidadTotal();

  const handleLogout = () => {
    logout();
    setIsOpen(false); // Cierra el menú al salir
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* LOGO */}
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 no-underline hover:text-blue-100 transition-colors z-50 relative" onClick={closeMenu}>
            <FaHamburger className="text-yellow-400" size={28} /> 
            <span>Comida al Paso</span>
          </Link>

          {/* ============================== */}
          {/* VISTA DE ESCRITORIO (Desktop)  */}
          {/* ============================== */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-white hover:text-blue-200 no-underline font-medium flex items-center gap-1">
              <FaHome /> Inicio
            </Link>
            <Link to="/products" className="text-white hover:text-blue-200 no-underline font-medium flex items-center gap-1">
              <FaUtensils /> Productos
            </Link>
            
            {user?.is_staff && (
              <Link to="/dashboard" className="text-white hover:text-blue-200 no-underline font-medium flex items-center gap-1">
                <FaChartLine /> Dashboard
              </Link>
            )}

            {isAuthenticated && (
              <Link to="/carrito" className="text-white hover:text-blue-200 relative no-underline transition-transform hover:scale-110 ml-4">
                <FaShoppingCart size={22} />
                {cantidadItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm border border-white">
                    {cantidadItems}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-blue-400 pl-4 ml-2">
                <span className="text-sm flex items-center gap-2 font-medium">
                  <FaUser className="text-blue-200" />
                  Hola, {user?.username}
                </span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-md flex items-center gap-2 text-sm font-bold border-none">
                  <FaSignOutAlt /> Salir
                </button>
              </div>
            ) : (
              <div className="flex gap-3 ml-4">
                <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 no-underline font-bold text-sm flex items-center gap-2">
                  <FaSignInAlt /> Ingresar
                </Link>
                <Link to="/register" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 no-underline font-bold text-sm border border-blue-700 flex items-center gap-2">
                  <FaUserPlus /> Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* ============================== */}
          {/* VISTA MÓVIL (Celular)          */}
          {/* ============================== */}
          <div className="md:hidden flex items-center gap-4 z-50 relative">
             {isAuthenticated && (
              <Link to="/carrito" className="text-white hover:text-blue-200 relative no-underline" onClick={closeMenu}>
                <FaShoppingCart size={24} />
                {cantidadItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm border border-white">
                    {cantidadItems}
                  </span>
                )}
              </Link>
            )}
            {/* Botón Hamburguesa */}
            <button onClick={toggleMenu} className="text-white focus:outline-none p-1">
              {isOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL (Overlay) */}
      <div className={`fixed inset-0 bg-blue-900 z-40 transform transition-transform duration-300 ease-in-out md:hidden pt-24 px-6 flex flex-col gap-4 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <Link to="/" className="text-white text-xl py-3 border-b border-blue-700 flex items-center gap-3" onClick={closeMenu}>
          <FaHome /> Inicio
        </Link>
        <Link to="/products" className="text-white text-xl py-3 border-b border-blue-700 flex items-center gap-3" onClick={closeMenu}>
          <FaUtensils /> Productos
        </Link>
        
        {user?.is_staff && (
          <Link to="/dashboard" className="text-white text-xl py-3 border-b border-blue-700 flex items-center gap-3" onClick={closeMenu}>
            <FaChartLine /> Dashboard
          </Link>
        )}

        {isAuthenticated ? (
          <div className="mt-4 flex flex-col gap-4">
            <span className="text-blue-200 text-lg flex items-center gap-2 justify-center">
              <FaUser /> {user?.username}
            </span>
            <button onClick={handleLogout} className="bg-red-500 text-white py-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2 w-full">
              <FaSignOutAlt /> Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <Link to="/login" className="bg-white text-blue-600 py-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2 w-full" onClick={closeMenu}>
              <FaSignInAlt /> Iniciar Sesión
            </Link>
            <Link to="/register" className="bg-blue-800 text-white py-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2 w-full border border-blue-500" onClick={closeMenu}>
              <FaUserPlus /> Crear Cuenta
            </Link>
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;