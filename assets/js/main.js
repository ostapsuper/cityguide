const STORAGE_KEY = "cityguide_favorites";

function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFavorites(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  updateFavBadge();
}

function toggleFavorite(id) {
  const favs = new Set(getFavorites());
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  setFavorites([...favs]);
  return favs.has(id);
}

function updateFavBadge() {
  const badge = document.getElementById("favCount");
  if (!badge) return;
  badge.textContent = String(getFavorites().length);
}

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function bindFavoritesButton() {
  const btn = document.getElementById("favoritesBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
  
    window.location.href = "places.html?favorites=1";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  updateFavBadge();
  bindFavoritesButton();
});
