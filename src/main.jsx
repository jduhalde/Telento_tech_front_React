import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Estilos
import './index.css'; // Tus estilos de Tailwind/CSS
import 'bootstrap/dist/css/bootstrap.min.css'; // Requerimiento #3: Bootstrap
import 'react-toastify/dist/ReactToastify.css'; // Requerimiento #3: Estilos de notificaciones

// Contextos y Providers
import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import { HelmetProvider } from 'react-helmet-async'; // Requerimiento #3: SEO
import { ToastContainer } from 'react-toastify'; // Requerimiento #3: Componente de notificaciones

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <CarritoProvider>
            <App />
            {/* Contenedor para las notificaciones flotantes */}
            <ToastContainer position="bottom-right" theme="colored" />
          </CarritoProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);