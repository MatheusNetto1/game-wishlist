// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WishlistPage from './pages/WishlistPage';
import Header from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-4 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;