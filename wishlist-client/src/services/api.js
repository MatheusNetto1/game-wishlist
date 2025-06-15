// src/services/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8000'; // A URL base para sua API FastAPI

export async function fetchGames(params = {}) {
  try {
    const response = await axios.get(`${BASE_URL}/search-games`, { params });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar jogos na API:", error);
    throw error; // Re-lança o erro para ser capturado no componente
  }
}

export async function addGameToWishlist(gameId) {
  try {
    // CORREÇÃO: Passar 'null' explicitamente como o corpo da requisição
    // para garantir que nenhum corpo JSON vazio ({}) seja enviado.
    const response = await axios.post(`${BASE_URL}/wishlist/from-freetogame?id=${gameId}`, null);
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar jogo à wishlist:", error);
    throw error; // Re-lança o erro para ser capturado no componente
  }
}

export async function fetchWishlist() {
  try {
    const response = await axios.get(`${BASE_URL}/wishlist`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar wishlist:", error);
    throw error; // Re-lança o erro para ser capturado no componente
  }
}

export async function removeGameFromWishlist(itemId) {
  try {
    const response = await axios.delete(`${BASE_URL}/wishlist/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao remover jogo da wishlist:", error);
    throw error; // Re-lança o erro para ser capturado no componente
  }
}
