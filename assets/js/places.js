const DATA_URL = "assets/data/places.json";

function priceLabel(n) {
  if (n === 1) return "€";
  if (n === 2) return "€€";
  return "€€€";
}

function cardTemplate(p, isFav) {
  const safeName = p.name.replaceAll('"', "&quot;");
  return `
    <article class="card" data-id="${p.id}">
      <img class="card-media" src="${p.image}" alt="${safeName}" loading="lazy" />
      <div class="card-body">
        <div class="card-title">
          <h3>${p.name}</h3>
          <button class="fav ${isFav ? "is-on" : ""}" data-fav="${p.id}" type="button" aria-label="Ulubione">
            ❤
          </button>
        </div>

        <div class="tagrow">
          <span class="tag">${p.category}</span>
          <span class="tag">${priceLabel(p.price)}</span>
          <span class="tag">⭐ ${p.rating.toFixed(1)}</span>
        </div>

        <p class="muted small">${p.address}</p>

        <div class="card-actions">
          <a class="btn btn-ghost" href="place.html?id=${encodeURIComponent(p.id)}">Szczegóły</a>
        </div>
      </div>
    </article>
  `;
}

function applyFilters(places, state) {
  const q = state.q.trim().toLowerCase();
  const cat = state.category;
  const price = state.price;
  const favOnly = state.favoritesOnly;

  const favSet = new Set(getFavorites());

  let result = places.filter(p => {
    const matchesQ = !q || (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );

    const matchesCat = (cat === "all") || (p.category === cat);
    const matchesPrice = (price === "all") || (String(p.price) === String(price));
    const matchesFav = !favOnly || favSet.has(p.id);

    return matchesQ && matchesCat && matchesPrice && matchesFav;
  });

 
  switch (state.sort) {
    case "rating_asc":
      result.sort((a,b) => a.rating - b.rating);
      break;
    case "name_asc":
      result.sort((a,b) => a.name.localeCompare(b.name, "pl"));
      break;
    case "name_desc":
      result.sort((a,b) => b.name.localeCompare(a.name, "pl"));
      break;
    default:
      result.sort((a,b) => b.rating - a.rating);
  }

  return result;
}

function readQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") || "",
    favoritesOnly: params.get("favorites") === "1"
  };
}

async function loadPlaces() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error("Nie udało się wczytać danych.");
  return res.json();
}

function bindCardEvents(container) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav]");
    if (!btn) return;

    const id = btn.getAttribute("data-fav");
    const nowOn = toggleFavorite(id);
    btn.classList.toggle("is-on", nowOn);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("placesGrid");
  const resultCount = document.getElementById("resultCount");

  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const priceSelect = document.getElementById("priceSelect");
  const sortSelect = document.getElementById("sortSelect");
  const filtersForm = document.getElementById("filtersForm");
  const resetBtn = document.getElementById("resetBtn");

  const qp = readQueryParams();

  
  searchInput.value = qp.q;

  let state = {
    q: qp.q,
    category: "all",
    price: "all",
    sort: "rating_desc",
    favoritesOnly: qp.favoritesOnly
  };

  try {
    const places = await loadPlaces();

    const render = () => {
      const filtered = applyFilters(places, state);
      const favSet = new Set(getFavorites());

      grid.innerHTML = filtered
        .map(p => cardTemplate(p, favSet.has(p.id)))
        .join("");

      resultCount.textContent = `Wyniki: ${filtered.length} ${state.favoritesOnly ? "(tylko ulubione)" : ""}`;
    };

    render();
    bindCardEvents(grid);

    filtersForm.addEventListener("submit", (e) => {
      e.preventDefault();
      state = {
        ...state,
        q: searchInput.value,
        category: categorySelect.value,
        price: priceSelect.value,
        sort: sortSelect.value
      };

      
      const params = new URLSearchParams();
      if (state.q.trim()) params.set("q", state.q.trim());
      if (state.favoritesOnly) params.set("favorites", "1");
      history.replaceState(null, "", `?${params.toString()}`);

      render();
    });

    resetBtn.addEventListener("click", () => {
      searchInput.value = "";
      categorySelect.value = "all";
      priceSelect.value = "all";
      sortSelect.value = "rating_desc";

      state = { ...state, q: "", category:"all", price:"all", sort:"rating_desc" };
      const params = new URLSearchParams();
      if (state.favoritesOnly) params.set("favorites", "1");
      history.replaceState(null, "", params.toString() ? `?${params.toString()}` : window.location.pathname);

      render();
    });


    window.addEventListener("focus", render);
  } catch (err) {
    grid.innerHTML = `<div class="card pad" style="grid-column: 1 / -1;">
      <h2>Błąd</h2>
      <p class="muted">${String(err.message || err)}</p>
    </div>`;
    resultCount.textContent = "Błąd wczytywania.";
  }
});
