// Monta em jsdom o trecho de index.html usado pela página inicial (mesmos ids e atributos).
export function mountHomeDom() {
  document.body.innerHTML = `
    <main id="main-content" tabindex="-1">
      <section class="quick-search" aria-labelledby="quick-search-title">
        <h2 id="quick-search-title">O que você procura?</h2>
        <form id="quick-search-form" action="explorar.html" method="get">
          <label for="search-q">Buscar por nome da atividade</label>
          <input id="search-q" type="search" name="q" maxlength="100">
          <label for="filter-unit">Unidade</label>
          <select id="filter-unit" name="unit"><option value="">Todas as unidades</option></select>
          <label for="filter-category">Categoria</label>
          <select id="filter-category" name="category"><option value="">Todas as categorias</option></select>
          <label for="filter-period">Quando?</label>
          <select id="filter-period" name="period">
            <option value="any">Qualquer data</option>
            <option value="today">Hoje</option>
            <option value="week">Próximos 7 dias</option>
            <option value="month">Este mês</option>
          </select>
          <button type="submit">Explorar</button>
          <p id="filter-options-status" class="visually-hidden" role="status"></p>
        </form>
      </section>
      <section class="upcoming" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title">Próximas atividades</h2>
        <a href="explorar.html">Ver todas</a>
        <div id="upcoming-status" role="status" aria-live="polite" class="visually-hidden"></div>
        <div id="upcoming-content" class="card-grid"></div>
      </section>
    </main>`;
  return {
    form: document.getElementById("quick-search-form"),
    term: document.getElementById("search-q"),
    unit: document.getElementById("filter-unit"),
    category: document.getElementById("filter-category"),
    period: document.getElementById("filter-period"),
    optionsStatus: document.getElementById("filter-options-status"),
    content: document.getElementById("upcoming-content"),
    status: document.getElementById("upcoming-status"),
  };
}
