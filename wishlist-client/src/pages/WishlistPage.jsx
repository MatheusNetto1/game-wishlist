// src/pages/WishlistPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import GameCard from '../components/GameCard';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    const res = await axios.get('http://localhost:8000/wishlist');
    setWishlist(res.data);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Minha Wishlist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map((item) => (
          <GameCard key={item.id} game={item} />
        ))}
      </div>
    </div>
  );
}