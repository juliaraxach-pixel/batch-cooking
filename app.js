const KEY = "cookbook_v1";
const norm = (s) => (s || "").trim().toLowerCase();

function load() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : { batches: [], recipes: [] };
}
function save(state) { localStorage.setItem(KEY, JSON.stringify(state)); }

const tabBatches = document.getElementById("tabBatches");
const tabRecipes = document.getElementById("tabRecipes");
const sectionBatches = document.getElementById("sectionBatches");
const sectionRecipes = document.getElementById("sectionRecipes");

function showTab(which) {
  const isB = which === "batches";
  tabBatches.classList.toggle("active", isB);
  tabRecipes.classList.toggle("active", !isB);
  sectionBatches.classList.toggle("hidden", !isB);
  sectionRecipes.classList.toggle("hidden", isB);
}
tabBatches.onclick = () => showTab("batches");
tabRecipes.onclick = () => showTab("recipes");

function batchesById(state) {
  const m = new Map();
  state.batches.forEach(b => m.set(b.id, b));
  return m;
}

function recipeMissing(recipe, state) {
  const bmap = batchesById(state);
  const available = new Set();
  (recipe.batchIds || []).forEach(id => {
    const b = bmap.get(id);
    (b?.ingredients || []).forEach(i => available.add(norm(i)));
  });
  return (recipe.ingredients || []).filter(i => !available.has(norm(i)));
}

function cardHTML({title, img, meta, pills}) {
  const safeImg = img || "https://picsum.photos/600/400?blur=1";
  return `
    <article class="card">
      <img class="cardImg" src="${safeImg}" alt="">
      <div class="cardBody">
        <h3 class="cardTitle">${title}</h3>
        <p class="cardMeta">${meta || ""}</p>
        ${pills?.length ? `<div class="pills">${pills.map(p => `<span class="pill">${p}</span>`).join("")}</div>` : ""}
      </div>
    </article>`;
}

function render() {
  const state = load();
  const bmap = batchesById(state);

  // BATCHES GRID
  const batchesGrid = document.getElementById("batchesGrid");
  batchesGrid.innerHTML = state.batches.map(b => {
    const linked = state.recipes.filter(r => (r.batchIds || []).includes(b.id));
    const pills = linked.slice(0,6).map(r => r.name);
    const meta = `${(b.ingredients||[]).length} ingredientes · ${linked.length} receta(s) asociada(s)`;
    return `<div data-type="batch" data-id="${b.id}">${cardHTML({title:b.name, img:b.photo, meta, pills})}</div>`;
  }).join("") || `<p class="muted">Importe un JSON para ver su libro.</p>`;

  // RECIPES GRID
  const recipesGrid = document.getElementById("recipesGrid");
  recipesGrid.innerHTML = state.recipes.map(r => {
    const batchNames = (r.batchIds || []).map(id => bmap.get(id)?.name).filter(Boolean);
    const miss = recipeMissing(r, state);
    const meta = `${batchNames.length} batch(es) · faltan ${miss.length} ingrediente(s)`;
    const pills = batchNames.slice(0,6);
    return `<div data-type="recipe" data-id="${r.id}">${cardHTML({title:r.name, img:r.photo, meta, pills})}</div>`;
  }).join("") || `<p class="muted">Importe un JSON para ver su libro.</p>`;

  // Click handlers
  document.querySelectorAll('[data-type="batch"]').forEach(el => el.onclick = () => openBatch(el.dataset.id));
  document.querySelectorAll('[data-type="recipe"]').forEach(el => el.onclick = () => openRecipe(el.dataset.id));
}

function openBatch(id) {
  const state = load();
  const b = state.batches.find(x => x.id === id);
  if (!b) return;

  const linked = state.recipes.filter(r => (r.batchIds || []).includes(b.id));

  showDetail(`
    <h3>${b.name}</h3>
    <img class="detailImg" src="${b.photo || "https://picsum.photos/800/500?blur=1"}" alt="">
    <div class="detailSection">
      <h4>Ingredientes</h4>
      <ul>${(b.ingredients||[]).map(i => `<li>${i}</li>`).join("") || "<li>—</li>"}</ul>
    </div>
    <div class="detailSection">
      <h4>Pasos</h4>
      <pre>${b.steps || "—"}</pre>
    </div>
    <div class="detailSection">
      <h4>Recetas asociadas</h4>
      <ul>
        ${linked.map(r => `<li><a class="link" href="#" data-open-recipe="${r.id}">${r.name}</a></li>`).join("") || "<li>—</li>"}
      </ul>
    </div>
  `);

  document.querySelectorAll("[data-open-recipe]").forEach(a => {
    a.onclick = (e) => { e.preventDefault(); openRecipe(a.dataset.openRecipe); showTab("recipes"); };
  });
}

function openRecipe(id) {
  const state = load();
  const bmap = new Map(state.batches.map(b => [b.id, b]));
  const r = state.recipes.find(x => x.id === id);
  if (!r) return;

  const batches = (r.batchIds || []).map(x => bmap.get(x)).filter(Boolean);
  const miss = recipeMissing(r, state);

  showDetail(`
    <h3>${r.name}</h3>
    <img class="detailImg" src="${r.photo || "https://picsum.photos/800/500?blur=1"}" alt="">
    <div class="detailSection">
      <h4>Batches asociados</h4>
      <ul>
        ${batches.map(b => `<li><a class="link" href="#" data-open-batch="${b.id}">${b.name}</a></li>`).join("") || "<li>—</li>"}
      </ul>
    </div>
    <div class="detailSection">
      <h4>Ingredientes extra (fuera del batch)</h4>
      <ul>${(r.ingredients||[]).map(i => `<li>${i}</li>`).join("") || "<li>—</li>"}</ul>
    </div>
    <div class="detailSection">
      <h4>Faltan (según batches asociados)</h4>
      <ul>${miss.map(i => `<li>${i}</li>`).join("") || "<li>Nada</li>"}</ul>
    </div>
    <div class="detailSection">
      <h4>Pasos</h4>
      <pre>${r.steps || "—"}</pre>
    </div>
  `);

  document.querySelectorAll("[data-open-batch]").forEach(a => {
    a.onclick = (e) => { e.preventDefault(); openBatch(a.dataset.openBatch); showTab("batches"); };
  });
}

function showDetail(html) {
  document.getElementById("detailEmpty").classList.add("hidden");
  const panel = document.getElementById("detailPanel");
  panel.classList.remove("hidden");
  panel.innerHTML = html;
}

// Import / Export
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([localStorage.getItem(KEY) || "{}"], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mi-libro-batchcooking.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const parsed = JSON.parse(await file.text());
  if (!parsed.batches || !parsed.recipes) return alert("JSON inválido: falta batches/recipes");
  save(parsed);
  render();
});

render();
