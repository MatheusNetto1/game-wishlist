// src/services/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export async function fetchGames(params = {}) {
  const response = await axios.get(`${BASE_URL}/search-games`, { params });
  return response.data;
}

export async function fetchWishlist() {
  const response = await axios.get(`${BASE_URL}/wishlist`);
  return response.data;
}

export async function addGameToWishlist(gameId) {
  return axios.post(`${BASE_URL}/wishlist/from-freetogame?id=${gameId}`);
}