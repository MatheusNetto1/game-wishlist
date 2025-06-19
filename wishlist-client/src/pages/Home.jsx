// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import GameCard from '../components/GameCard.jsx';
import Loader from '../components/Loader.jsx';
import { fetchGames } from '../services/api.js';
import { getStoreFromURL } from '../utils/getStoreFromURL.js';
import { useToast } from '../components/Toast.jsx';

function Home() {
  const [gamesByStore, setGamesByStore] = useState({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      try {
        const res = await fetchGames({ platform: 'pc' });
        const grouped = {};

        if (res.length === 0) {
          showToast('Nenhum jogo gratuito encontrado para PC.', 'info');
        }

        res.forEach((game) => {
          const store = getStoreFromURL(game.game_url);
          if (!grouped[store]) grouped[store] = [];
          grouped[store].push(game);
        });

        setGamesByStore(grouped);
      } catch (error) {
        console.error("Erro ao buscar jogos:", error);
        showToast('Erro ao carregar jogos. Tente novamente mais tarde.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center">Jogos Gratuitos Atualmente</h1>
      {Object.keys(gamesByStore).length === 0 ? (
        <div className="text-center text-gray-600 text-xl py-10">
          Nenhum jogo encontrado no momento.
        </div>
      ) : (
        Object.entries(gamesByStore).map(([store, games]) => (
          <section key={store} className="mb-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6 border-b-2 pb-3 border-blue-200">{store}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {games.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default Home;