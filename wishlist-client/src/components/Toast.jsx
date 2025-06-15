// src/components/Toast.jsx
import React, { useEffect, useState, createContext, useContext } from 'react';

// Contexto para o Toast
export const ToastContext = createContext(null);

// Hook personalizado para usar o Toast
export function useToast() {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Componente Toast para exibir mensagens
function Toast() {
  const { toast, hideToast } = useToast();

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000); // Esconde o toast após 3 segundos
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast.show) return null;

  const bgColor = toast.type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg transition-opacity duration-300 ${toast.show ? 'opacity-100' : 'opacity-0'} z-50`}
      role="alert"
    >
      <div className="flex items-center">
        {toast.type === 'success' ? (
          // Ícone de sucesso (check-circle)
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        ) : (
          // Ícone de erro (exclamation-circle)
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"></path>
          </svg>
        )}
        <span>{toast.message}</span>
        <button onClick={hideToast} className="ml-4 text-white hover:text-gray-200">
          {/* Ícone de fechar (X) */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Toast;