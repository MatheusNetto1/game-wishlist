// src/services/api.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000, // 10 segundos
});

export async function fetchGames(params = {}) {
  try {
    const response = await axiosInstance.get('/search-games', { params });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar jogos na API:", error);
    throw error;
  }
}

export async function addGameToWishlist(gameId) {
  try {
    const response = await axiosInstance.post('/wishlist/from-freetogame', {
      game_id: gameId,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar jogo à wishlist:", error);
    throw error;
  }
}

export async function fetchWishlist() {
  try {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar wishlist:", error);
    throw error;
  }
}

export async function removeGameFromWishlist(itemId) {
  try {
    const response = await axiosInstance.delete(`/wishlist/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao remover jogo da wishlist:", error);
    throw error;
  }
}
