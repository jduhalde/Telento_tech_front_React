import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// 🔥 CORRECCIÓN FINAL: Pegamos el link de Railway aquí también
const API_URL = 'https://telentotechbackreact-production.up.railway.app/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay token al iniciar
  useEffect(() => {
    const access = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (access && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (username, password) => {
    try {
      console.log("Intentando conectar a:", `${API_URL}/token/`); // Debug para consola
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        if (response.status === 401) return { success: false, error: 'Usuario o contraseña incorrectos' };
        return { success: false, error: 'Error en el servidor' };
      }

      const data = await response.json();

      // Guardar tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Guardar datos básicos del usuario
      // (Como no tenemos endpoint de /user/ profile, usamos el nombre localmente)
      // Ajuste para que seas admin inmediatamente si te llamas "admin"
      const userData = { 
          username, 
          is_staff: username.toLowerCase() === 'admin' 
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);

      return { success: true };

    } catch (error) {
      console.error("Error de login:", error);
      return { success: false, error: 'Error de conexión con el servidor (Revisa tu internet)' };
    }
  };

  // Register
  const register = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Error al crear la cuenta' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};