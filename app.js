<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Batch Cooking — Libro</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="topbar">
    <h1>Batch Cooking — Libro</h1>

    <nav class="tabs" aria-label="Secciones">
      <button id="tabBatches" class="active" type="button">Batches</button>
      <button id="tabRecipes" type="button">Recetas</button>
      <button id="tabSearch" type="button">Buscar</button>
    </nav>

    <div class="actions">
      <label class="fileBtn">
        Importar JSON
        <input id="importFile" type="file" accept="application/json" />
      </label>
    </div>
  </header>

  <main class="layout">
    <section id="sectionBatches">
      <div class="gridHeader">
        <h2>Batches</h2>
        <p class="muted">Preparaciones base (con ingredientes, pasos y recetas asociadas).</p>
      </div>
      <div id="batchesGrid" class="gridCards"></div>
    </section>

    <section id="sectionRecipes" class="hidden">
      <div class="gridHeader">
        <h2>Recetas</h2>
        <p class="muted">Recetas finales (asociadas a uno o varios batches).</p>
      </div>
      <div id="recipesGrid" class="gridCards"></div>
    </section>

    <section id="sectionSearch" class="hidden">
      <div class="gridHeader">
        <h2>Buscar por ingredientes</h2>
        <p class="muted">Escribe ingredientes separados por coma (ej.: albondigas, cebolla).</p>
      </div>

      <div class="searchBox">
        <input id="searchIngredients" placeholder="Ej.: albondigas, cebolla" />
        <button id="searchBtn" type="button">Buscar</button>
      </div>

      <div class="twoCols">
        <div class="card">
          <h3>Las puedo hacer</h3>
          <ul id="searchCan"></ul>
        </div>
        <div class="card">
          <h3>Casi (faltan)</h3>
          <ul id="searchAlmost"></ul>
        </div>
      </div>
    </section>

    <aside class="detail">
      <div id="detailEmpty" class="empty">
        <h3>Detalle</h3>
        <p class="muted">Importa un JSON y selecciona un batch o receta.</p>
      </div>
      <div id="detailPanel" class="hidden"></div>
    </aside>
  </main>

  <script src="app.js"></script>
</body>
</html>
