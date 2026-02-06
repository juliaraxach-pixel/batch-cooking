let DATA = { batches: [], recipes: [] };

const tabBatches = document.getElementById("tabBatches");
const tabRecipes = document.getElementById("tabRecipes");
const tabSearch  = document.getElementById("tabSearch");

const sectionBatches = document.getElementById("sectionBatches");
const sectionRecipes = document.getElementById("sectionRecipes");
const sectionSearch  = document.getElementById("sectionSearch");

const norm = (s) => (s || "").trim().toLowerCase();

function showTab(which) {
  const isB = which === "batches";
  const isR = which === "recipes";
  const isS = which === "search";

  tabBatches.classList.toggle("active", isB);
  tabRecipes.classList.toggle("active", isR);
  tabSearch.classList.toggle("active", isS);

  sectionBatches.classList.toggle("hidden", !isB);
  sectionRecipes.classList.toggle("hidden", !isR);
  sectionSearch.classList.toggle("hidden", !isS);
}

tabBatches.onclick = () => showTab("batches");
tabRecipes.onclick = () => showTab("recipes");
tabSearch.onclick  = () => showTab("search");

function batchesMap() {
  return new Map(DATA.batches.map(b => [b.id, b]));
}

function recipeMissing(recipe) {
  const bmap = batchesMap();
  const available = new Set();

  (recipe.batchIds || []).forEach(id => {
    const b = bmap.get(id);
    (b?.ingredients || []).forEach(i => available.add(norm(i)));
  });

  return (recipe.ingredients || []).filter(i => !available.has(norm(i)));
}

function cardHTML({ title, img, meta, pills }) {
  const safeImg = img || "https://picsum.photos/600/400?blur=1";
  return `
    <article class="cardTile">
      <img class="cardImg" src="${safeImg}" alt="">
      <div class="cardBody">
        <h3 class="cardTitle">${title}</h3>
        <p class="cardMeta">${meta || ""}</p>
        ${pills?.length ? `<div class="pills">${pills.map(p => `<span class="pill">${p}</span>`).join("")}</div>` : ""}
      </div>
    </article>`;
}

function render() {
  const bmap = batchesMap();

  const batchesGrid = document.getElementById("batchesGrid");
  batchesGrid.innerHTML = (DATA.batches || []).map(b => {
    const linked = (DATA.recipes || []).filter(r => (r.batchIds || []).includes(b.id));
    const meta = `${(b.ingredients||[]).length} ingredientes · ${linked.length} receta(s) asociada(s)`;
    const pills = linked.slice(0,6).map(r => r.name);
    return `<div data-type="batch" data-id="${b.id}">${cardHTML({ title:b.name, img:b.photo, meta, pills })}</div>`;
  }).join("") || `<p class="muted">Importa un JSON para ver tu libro.</p>`;

  const recipesGrid = document.getElementById("recipesGrid");
  recipesGrid.innerHTML = (DATA.recipes || []).map(r => {
    const batchNames = (r.batchIds || []).map(id => bmap.get(id)?.name).filter(Boolean);
    const miss = recipeMissing(r);
    const meta = `${batchNames.length} batch(es) · faltan ${miss.length} ingrediente(s)`;
    const pills = batchNames.slice(0,6);
    return `<div data-type="recipe" data-id="${r.id}">${cardHTML({ title:r.name, img:r.photo, meta, pills })}</div>`;
  }).join("") || `<p class="muted">Importa un JSON para ver tu libro.</p>`;

  document.querySelectorAll('[data-type="batch"]').forEach(el => el.onclick = () => openBatch(el.dataset.id));
  document.querySelectorAll('[data-type="recipe"]').forEach(el => el.onclick = () => openRecipe(el.dataset.id));
}

function showDetail(html) {
  document.getElementById("detailEmpty").classList.add("hidden");
  const panel = document.getElementById("detailPanel");
  panel.classList.remove("hidden");
  panel.innerHTML = html;
}

function openBatch(id) {
  const b = (DATA.batches || []).find(x => x.id === id);
  if (!b) return;

  const linked = (DATA.recipes || []).filter(r => (r.batchIds || []).includes(b.id));

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
  const bmap = batchesMap();
  const r = (DATA.recipes || []).find(x => x.id === id);
  if (!r) return;

  const batches = (r.batchIds || []).map(x => bmap.get(x)).filter(Boolean);
  const miss = recipeMissing(r);

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
      <h4>Ingredientes extra</h4>
      <ul>${(r.ingredients||[]).map(i => `<li>${i}</li>`).join("") || "<li>—</li>"}</ul>
    </div>
    <div class="detailSection">
      <h4>Faltan</h4>
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

  showTab("recipes");
}

// BUSCAR (clicable)
function parseSearch(text){
  return (text || "").split(",").map(x => norm(x)).filter(Boolean);
}

function doSearch() {
  const wanted = new Set(parseSearch(document.getElementById("searchIngredients").value));
  const canUl = document.getElementById("searchCan");
  const almostUl = document.getElementById("searchAlmost");
  canUl.innerHTML = "";
  almostUl.innerHTML = "";

  if (!wanted.size) {
    canUl.innerHTML = `<li class="muted">Escribe ingredientes y pulsa Buscar.</li>`;
    almostUl.innerHTML = `<li class="muted">—</li>`;
    return;
  }

  (DATA.recipes || []).forEach(r => {
    const available = new Set();
    const bmap = batchesMap();

    (r.batchIds || []).forEach(id => {
      const b = bmap.get(id);
      (b?.ingredients || []).forEach(i => available.add(norm(i)));
    });
    wanted.forEach(i => available.add(i));

    const missing = (r.ingredients || []).map(norm).filter(i => !available.has(i));

    if (missing.length === 0) {
      canUl.innerHTML += `<li><a class="link" href="#" data-open-recipe="${r.id}">${r.name}</a></li>`;
    } else if (missing.length <= 5) {
      almostUl.innerHTML += `<li><a class="link" href="#" data-open-recipe="${r.id}">${r.name}</a> — faltan: ${missing.join(", ")}</li>`;
    }
  });

  if (!canUl.innerHTML) canUl.innerHTML = `<li class="muted">Ninguna receta completa con esos ingredientes.</li>`;
  if (!almostUl.innerHTML) almostUl.innerHTML = `<li class="muted">No hay “casi” con hasta 5 faltantes.</li>`;

  document.querySelectorAll("[data-open-recipe]").forEach(a => {
    a.onclick = (e) => { e.preventDefault(); openRecipe(a.dataset.openRecipe); };
  });
}

document.getElementById("searchBtn").onclick = doSearch;
document.getElementById("searchIngredients").addEventListener("keydown", (e) => {
  if (e.key === "Enter") doSearch();
});

// IMPORTAR JSON (AQUÍ ESTABA TU PROBLEMA: ahora sí renderiza)
document.getElementById("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const parsed = JSON.parse(await file.text());
  if (!parsed.batches || !parsed.recipes) return alert("JSON inválido: faltan batches/recipes");

  DATA = parsed;
  render();
  alert("Libro cargado ✅");
});

render();
