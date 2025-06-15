// src/services/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export async function fetchGames(params = {}) {
  try {
    const response = await axios.get(`${BASE_URL}/search-games`, { params });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar jogos na API:", error);
    throw error;
  }
}

export async function addGameToWishlist(gameId) {
  try {
    const response = await axios.post(`${BASE_URL}/wishlist/from-freetogame`, {
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
    const response = await axios.get(`${BASE_URL}/wishlist`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar wishlist:", error);
    throw error;
  }
}

export async function removeGameFromWishlist(itemId) {
  try {
    const response = await axios.delete(`${BASE_URL}/wishlist/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao remover jogo da wishlist:", error);
    throw error;
  }
}