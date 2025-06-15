// src/components/Header.jsx
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-xl font-bold">Game Wishlist</h1>
        <div className="space-x-6 text-lg">
          <Link to="/" className={pathname === '/' ? 'underline' : 'hover:underline'}>
            Buscar Jogos
          </Link>
          <Link to="/wishlist" className={pathname === '/wishlist' ? 'underline' : 'hover:underline'}>
            Minha Wishlist
          </Link>
        </div>
      </nav>
    </header>
  );
}