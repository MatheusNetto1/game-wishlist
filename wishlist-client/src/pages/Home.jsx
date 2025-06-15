// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import GameCard from '../components/GameCard';
import Loader from '../components/Loader';
import api from '../services/api';
import { getStoreFromURL } from "../utils/getStoreFromURL";

export default function Home() {
  const [gamesByStore, setGamesByStore] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await api.get('/search-games?platform=pc');
        const grouped = {};

        res.data.forEach((game) => {
          const store = getStoreFromURL(game.game_url);
          if (!grouped[store]) grouped[store] = [];
          grouped[store].push(game);
        });

        setGamesByStore(grouped);
      } catch (error) {
        console.error("Erro ao buscar jogos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Jogos Gratuitos por Loja</h1>
      {Object.entries(gamesByStore).map(([store, games]) => (
        <div key={store} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{store}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
