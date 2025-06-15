// utils/getStoreFromURL.js
export function getStoreFromURL(url) {
  if (url.includes("steampowered.com")) return "Steam";
  if (url.includes("epicgames.com")) return "Epic Games";
  if (url.includes("roblox.com")) return "Roblox";
  if (url.includes("battle.net")) return "Battle.net";
  if (url.includes("origin.com")) return "Origin";
  if (url.includes("xbox.com")) return "Xbox";
  if (url.includes("playstation.com")) return "PlayStation";
  if (url.includes("gog.com")) return "GOG";
  if (url.includes("store.ubi.com")) return "Ubisoft";
  return "Outros";
}