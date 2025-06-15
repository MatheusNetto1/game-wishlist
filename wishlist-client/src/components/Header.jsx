// src/components/Header.jsx
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const { pathname } = useLocation();

  return (
    <header className="bg-gray-800 text-white p-4 shadow-lg sticky top-0 z-10">
      <nav className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-extrabold mb-2 sm:mb-0">Game Wishlist</h1>
        <div className="flex space-x-6 text-lg">
          <Link
            to="/"
            className={`font-medium ${pathname === '/' ? 'text-blue-400 underline' : 'hover:text-blue-300 transition-colors duration-200'}`}
          >
            Jogos
          </Link>
          <Link
            to="/wishlist"
            className={`font-medium ${pathname === '/wishlist' ? 'text-blue-400 underline' : 'hover:text-blue-300 transition-colors duration-200'}`}
          >
            Wishlist
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;