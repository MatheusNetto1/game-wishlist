// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import Toast, { ToastContext } from './components/Toast.jsx'; // Importa o Toast e o Contexto

function App() {
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    // O provedor do contexto do Toast envolve toda a aplicação para que os componentes possam usá-lo
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Routes>
        </div>
        <Toast />
      </div>
    </ToastContext.Provider>
  );
}

export default App;