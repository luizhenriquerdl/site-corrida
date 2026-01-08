const state = {
  events: [],
  filtered: [],
  page: 1,
  perPage: 9,
  filters: { search: "", state: "", city: "", distance: "", monthYear: "" }
};

// Elements
const el = {
  year: document.getElementById("year"),
  homeView: document.getElementById("home-view"),
  detailsView: document.getElementById("details-view"),
  sobreView: document.getElementById("sobre-view"),
  contatoView: document.getElementById("contato-view"),
  eventsList: document.getElementById("eventsList"),
  stats: document.getElementById("stats"),
  pagination: document.getElementById("pagination"),
  backToHome: document.getElementById("backToHome"),
  eventDetails: document.getElementById("eventDetails"),

  search: document.getElementById("search"),
  stateSelect: document.getElementById("state"),
  citySelect: document.getElementById("city"),
  distanceSelect: document.getElementById("distance"),
  monthYearInput: document.getElementById("monthYear"),
  clearFilters: document.getElementById("clearFilters")
};

el.year.textContent = new Date().getFullYear();

// Simple router
function route() {
  const hash = location.hash || "#/";
  const [_, path, param] = hash.split("/");
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

  if (path === "" || path === undefined) {
    el.homeView.classList.add("active");
  } else if (path === "event" && param) {
    el.detailsView.classList.add("active");
    renderDetails(decodeURIComponent(param));
  } else if (path === "sobre") {
    el.sobreView.classList.add("active");
  } else if (path === "contato") {
    el.contatoView.classList.add("active");
  } else {
    el.homeView.classList.add("active");
  }
}
window.addEventListener("hashchange", route);

// Load data
async function loadEvents() {
  const res = await fetch("events.json");
  const data = await res.json();
  // Normalize date strings to Date objects
  state.events = data.map(e => ({ ...e, dateObj: new Date(e.date) }))
                     .sort((a, b) => a.dateObj - b.dateObj);
  initFilters();
  applyFilters();
}

// Filters init
function initFilters() {
  const states = Array.from(new Set(state.events.map(e => e.state))).sort();
  el.stateSelect.innerHTML = `<option value="">Todos</option>` + states.map(s => `<option value="${s}">${s}</option>`).join("");

  el.search.addEventListener("input", debounce(() => {
    state.filters.search = el.search.value.trim().toLowerCase();
    state.page = 1;
    applyFilters();
  }, 200));

  el.stateSelect.addEventListener("change", () => {
    state.filters.state = el.stateSelect.value;
    state.page = 1;
    populateCities();
    applyFilters();
  });

  el.citySelect.addEventListener("change", () => {
    state.filters.city = el.citySelect.value;
    state.page = 1;
    applyFilters();
  });

  el.distanceSelect.addEventListener("change", () => {
    state.filters.distance = el.distanceSelect.value;
    state.page = 1;
    applyFilters();
  });

  el.monthYearInput.addEventListener("change", () => {
    state.filters.monthYear = el.monthYearInput.value; // YYYY-MM
    state.page = 1;
    applyFilters();
  });

  el.clearFilters.addEventListener("click", () => {
    state.filters = { search: "", state: "", city: "", distance: "", monthYear: "" };
    el.search.value = "";
    el.stateSelect.value = "";
    el.citySelect.innerHTML = `<option value="">Todas</option>`;
    el.citySelect.disabled = true;
    el.distanceSelect.value = "";
    el.monthYearInput.value = "";
    state.page = 1;
    applyFilters();
  });
}

function populateCities() {
  const st = state.filters.state;
  const cities = Array.from(new Set(state.events.filter(e => !st || e.state === st).map(e => e.city))).sort();
  el.citySelect.innerHTML = `<option value="">Todas</option>` + cities.map(c => `<option value="${c}">${c}</option>`).join("");
  el.citySelect.disabled = cities.length === 0;
}

// Apply filters
function applyFilters() {
  const { search, state: st, city, distance, monthYear } = state.filters;

  state.filtered = state.events.filter(e => {
    const matchesSearch =
      !search ||
      e.name.toLowerCase().includes(search) ||
      e.city.toLowerCase().includes(search) ||
      e.state.toLowerCase().includes(search);

    const matchesState = !st || e.state === st;
    const matchesCity = !city || e.city === city;
    const matchesDistance = !distance || String(e.distanceKm) === String(distance);
    const matchesMonthYear =
      !monthYear ||
      (e.date.slice(0, 7) === monthYear); // compare YYYY-MM

    return matchesSearch && matchesState && matchesCity && matchesDistance && matchesMonthYear;
  });

  renderList();
  renderPagination();
}

function renderList() {
  const start = (state.page - 1) * state.perPage;
  const end = start + state.perPage;
  const pageItems = state.filtered.slice(start, end);

  el.stats.textContent = `${state.filtered.length} corrida(s) encontrada(s)`;

  if (pageItems.length === 0) {
    el.eventsList.innerHTML = `<div class="card"><div class="card-title">Nenhum resultado</div><div class="card-sub">Ajuste os filtros ou tente outra busca.</div></div>`;
    return;
  }

  el.eventsList.innerHTML = pageItems.map(e => `
    <article class="card">
      <div class="card-title">${e.name}</div>
      <div class="card-sub">${e.city}, ${e.state}</div>
      <div class="card-meta">
        <span class="badge">${formatDate(e.date)}</span>
        <span class="badge">${e.distanceKm} km</span>
        ${e.price ? `<span class="badge">R$ ${e.price.toFixed(2)}</span>` : ``}
      </div>
      <div class="card-actions">
        <a class="btn" href="#/event/${encodeURIComponent(e.id)}">Detalhes</a>
        ${e.url ? `<a class="btn secondary" href="${e.url}" target="_blank" rel="noopener noreferrer">Site oficial</a>` : ``}
      </div>
    </article>
  `).join("");
}

function renderPagination() {
  const total = state.filtered.length;
  const pages = Math.ceil(total / state.perPage) || 1;

  const prevDisabled = state.page <= 1;
  const nextDisabled = state.page >= pages;

  el.pagination.innerHTML = `
    <button class="page-btn" ${prevDisabled ? "disabled" : ""} id="prevPage">Anterior</button>
    <span>Página ${state.page} de ${pages}</span>
    <button class="page-btn" ${nextDisabled ? "disabled" : ""} id="nextPage">Próxima</button>
  `;

  const prev = document.getElementById("prevPage");
  const next = document.getElementById("nextPage");
  if (prev) prev.onclick = () => { if (state.page > 1) { state.page--; renderList(); renderPagination(); } };
  if (next) next.onclick = () => {
    const totalPages = Math.ceil(state.filtered.length / state.perPage);
    if (state.page < totalPages) { state.page++; renderList(); renderPagination(); }
  };
}

function renderDetails(id) {
  const event = state.events.find(e => String(e.id) === String(id));
  if (!event) {
    el.eventDetails.innerHTML = `<div class="details-header"><h3>Evento não encontrado</h3></div>`;
    return;
  }

  el.eventDetails.innerHTML = `
    <div class="details-header">
      <h3>${event.name}</h3>
      ${event.url ? `<a class="btn" href="${event.url}" target="_blank" rel="noopener">Inscreva-se</a>` : ``}
    </div>
    <div class="card-sub">${event.city}, ${event.state}</div>

    <div class="details-grid">
      <div class="details-item">
        <h4>Data</h4>
        <div>${formatDate(event.date)}</div>
      </div>
      <div class="details-item">
        <h4>Distâncias</h4>
        <div>${Array.isArray(event.distancesKm) ? event.distancesKm.join(" km, ") + " km" : event.distanceKm + " km"}</div>
      </div>
      <div class="details-item">
        <h4>Preço</h4>
        <div>${event.price ? "R$ " + event.price.toFixed(2) : "Consultar"}</div>
      </div>
      <div class="details-item">
        <h4>Organização</h4>
        <div>${event.organizer || "—"}</div>
      </div>
      <div class="details-item">
        <h4>Altimetria</h4>
        <div>${event.elevation || "—"}</div>
      </div>
      <div class="details-item">
        <h4>Observações</h4>
        <div>${event.notes || "—"}</div>
      </div>
    </div>
  `;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
}

function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

el.backToHome.addEventListener("click", () => { location.hash = "#/"; });

// Init
route();
loadEvents();
