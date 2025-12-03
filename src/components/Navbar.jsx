import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
// Requisito #3: React Icons en la navegación
import { FaHamburger, FaShoppingCart, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaHome, FaUtensils, FaChartLine } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { obtenerCantidadTotal } = useCarrito();
  const navigate = useNavigate();
  const cantidadItems = obtenerCantidadTotal();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // 'sticky top-0 z-50' hace que la barra se quede fija al bajar
    <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* LOGO: Texto blanco explícito y sin subrayado */}
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 no-underline hover:text-blue-100 transition-colors">
            <FaHamburger className="text-yellow-400" size={28} /> 
            <span>Comida al Paso</span>
          </Link>

          <div className="flex items-center gap-6">
            {/* ENLACES: Agregamos 'text-white no-underline' para vencer a Bootstrap */}
            <Link to="/" className="text-white hover:text-blue-200 no-underline font-medium flex items-center gap-1 transition-colors">
              <FaHome /> Inicio
            </Link>
            
            <Link to="/products" className="text-white hover:text-blue-200 no-underline font-medium flex items-center gap-1 transition-colors">
              <FaUtensils /> Productos
            </Link>

            {isAuthenticated && (
              <Link to="/carrito" className="text-white hover:text-blue-200 relative no-underline transition-transform hover:scale-110">
                <FaShoppingCart size={22} />
                {cantidadItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm border border-white">
                    {cantidadItems}
                  </span>
                )}
              </Link>
            )}

            {user?.is_staff && (
              <Link to="/dashboard" className="text-white hover:text-blue-200 no-underline font-medium flex items-center gap-1">
                <FaChartLine /> Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-blue-400 pl-4 ml-2">
                <span className="text-sm flex items-center gap-2 font-medium">
                  <FaUser className="text-blue-200" />
                  Hola, {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-md transition-colors flex items-center gap-2 text-sm font-bold border-none cursor-pointer"
                >
                  <FaSignOutAlt /> Salir
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 no-underline font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
                >
                  <FaSignInAlt /> Ingresar
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 no-underline font-bold text-sm shadow-sm transition-colors flex items-center gap-2 border border-blue-700"
                >
                  <FaUserPlus /> Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;