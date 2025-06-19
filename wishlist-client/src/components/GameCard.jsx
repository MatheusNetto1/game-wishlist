// src/components/GameCard.jsx
import { useToast } from './Toast.jsx';
import { addGameToWishlist } from '../services/api.js';

function GameCard({ game }) {
  const { showToast } = useToast();

  const handleAddToWishlist = async () => {
    console.log("Tentando adicionar jogo à wishlist:", game.title, "ID:", game.id);
    try {
      if (typeof game.id === 'undefined' || game.id === null) {
        showToast('Erro: ID do jogo não encontrado para adicionar à wishlist.', 'error');
        console.error("Erro: game.id está indefinido ou nulo.", game);
        return;
      }

      await addGameToWishlist(game.id);
      console.log("Jogo adicionado com sucesso:", game.title);
      showToast('Jogo adicionado à wishlist!', 'success');
    } catch (err) {
      console.error("Erro ao adicionar jogo à wishlist:", err);
      const errorMessage = err.response?.data?.detail || 'Erro ao adicionar jogo. Por favor, tente novamente.';
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div
      data-testid="game-card"
      className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-200 ease-in-out"
    >
      <img
        src={game.thumbnail}
        alt={game.title}
        className="w-full h-48 object-cover object-center"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/400x200/cccccc/333333?text=Imagem+Nao+Disponivel";
        }}
      />
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1 truncate">{game.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{game.platform}</p>
        <a
          href={game.game_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline block mb-3 text-sm"
        >
          Ver no site
        </a>
        <button
          onClick={handleAddToWishlist}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          Adicionar à Wishlist
        </button>
      </div>
    </div>
  );
}

export default GameCard;