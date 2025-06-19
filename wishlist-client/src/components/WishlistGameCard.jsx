// src/components/WishlistGameCard.jsx
import { useToast } from './Toast.jsx';

function WishlistGameCard({ game, onRemove }) {
  const { showToast } = useToast();

  const handleRemoveFromWishlist = async () => {
    console.log("Tentando remover jogo da wishlist com ID:", game.id);
    try {
      await onRemove(game.id);
      console.log("Jogo removido com sucesso.");
    } catch (err) {
      console.error("Erro ao remover jogo da wishlist:", err);
      const errorMessage = err.response?.data?.detail || 'Erro ao remover jogo da wishlist.';
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-200 ease-in-out"
      data-testid="wishlist-card"
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
          onClick={handleRemoveFromWishlist}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          Remover da Wishlist
        </button>
      </div>
    </div>
  );
}

export default WishlistGameCard;