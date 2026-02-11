const DATA_URL = "assets/data/places.json";

function getIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function priceLabel(n) {
  if (n === 1) return "€";
  if (n === 2) return "€€";
  return "€€€";
}

async function loadPlaces() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error("Nie udało się wczytać danych.");
  return res.json();
}

function initMap(lat, lng, name) {
  const map = L.map("map", { scrollWheelZoom: false }).setView([lat, lng], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();

  return map;
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = getIdFromQuery();

  const placeName = document.getElementById("placeName");
  const placeMeta = document.getElementById("placeMeta");
  const placeImage = document.getElementById("placeImage");
  const placeDesc = document.getElementById("placeDesc");
  const placeHours = document.getElementById("placeHours");
  const placeAddress = document.getElementById("placeAddress");
  const favToggle = document.getElementById("favToggle");

  if (!id) {
    placeName.textContent = "Brak ID miejsca.";
    return;
  }

  try {
    const places = await loadPlaces();
    const p = places.find(x => x.id === id);

    if (!p) {
      placeName.textContent = "Nie znaleziono miejsca.";
      return;
    }

   
    placeName.textContent = p.name;
    placeMeta.textContent = `${p.category} • ${priceLabel(p.price)} • ⭐ ${p.rating.toFixed(1)}`;
    placeImage.src = p.image;
    placeImage.alt = p.name;
    placeDesc.textContent = p.description;
    placeHours.textContent = p.hours;
    placeAddress.textContent = p.address;

  
    const favSet = new Set(getFavorites());
    const setFavBtn = (on) => {
      favToggle.textContent = on ? "❤ Usuń z ulubionych" : "❤ Dodaj do ulubionych";
      favToggle.classList.toggle("btn-ghost", !on);
    };
    setFavBtn(favSet.has(p.id));

    favToggle.addEventListener("click", () => {
      const on = toggleFavorite(p.id);
      setFavBtn(on);
    });

    // map
    initMap(p.lat, p.lng, p.name);
  } catch (err) {
    placeName.textContent = "Błąd ładowania.";
    placeMeta.textContent = String(err.message || err);
  }
});
