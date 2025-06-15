// src/components/GameCard.jsx
import axios from 'axios';

export default function GameCard({ game }) {
  const addToWishlist = async () => {
    try {
      await axios.post('http://localhost:8000/wishlist/from-freetogame?id=' + game.id);
      alert('Jogo adicionado à wishlist!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao adicionar.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <img src={game.thumbnail} alt={game.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1">{game.title}</h3>
        <p className="text-sm text-gray-500 mb-2">{game.platform}</p>
        <a href={game.game_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline block mb-2">Ver no site</a>
        <button onClick={addToWishlist} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
          Adicionar à wishlist
        </button>
      </div>
    </div>
  );
}