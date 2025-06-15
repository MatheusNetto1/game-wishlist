// src/pages/WishlistPage.jsx
import { useEffect, useState } from 'react';
import WishlistGameCard from '../components/WishlistGameCard.jsx';
import Loader from '../components/Loader.jsx';
import { fetchWishlist, removeGameFromWishlist } from '../services/api.js'; // Importa as funções da API
import { useToast } from '../components/Toast.jsx'; // Importa o hook useToast

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetchWishlist();
      setWishlist(res);
      if (res.length === 0) {
        showToast('Sua lista de desejos está vazia.', 'info');
      }
    } catch (error) {
      console.error("Erro ao buscar wishlist:", error);
      showToast('Erro ao carregar sua wishlist. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  // Função para remover do WishlistGameCard
  const handleRemove = async (itemId) => {
    console.log("Tentando remover jogo da wishlist com ID:", itemId);
    try {
      await removeGameFromWishlist(itemId);
      console.log("Jogo removido com sucesso, recarregando wishlist.");
      showToast('Jogo removido da wishlist!', 'success');
      loadWishlist(); // Recarrega a wishlist após a remoção
    } catch (error) {
      console.error("Erro ao remover da wishlist:", error);
      const errorMessage = error.response?.data?.detail || 'Erro ao remover jogo da wishlist. Tente novamente.';
      showToast(errorMessage, 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center">Minha Lista de Desejos</h1>
      {wishlist.length === 0 && !loading ? (
        <div className="text-center text-gray-600 text-xl py-10">
          Sua lista de desejos está vazia. Adicione alguns jogos!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wishlist.map((item) => (
            // Usa o novo componente WishlistGameCard
            <WishlistGameCard key={item.id} game={item} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
