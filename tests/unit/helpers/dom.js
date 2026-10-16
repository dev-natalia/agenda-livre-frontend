import { readFileSync } from "node:fs";

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
          <label for="filter-audience">Público-alvo</label>
          <select id="filter-audience" name="audience"><option value="">Todos os públicos</option></select>
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
    audience: document.getElementById("filter-audience"),
    period: document.getElementById("filter-period"),
    optionsStatus: document.getElementById("filter-options-status"),
    content: document.getElementById("upcoming-content"),
    status: document.getElementById("upcoming-status"),
  };
}

// Monta em jsdom o trecho de explorar.html usado pela página Explorar (mesmos ids e atributos).
export function mountExploreDom() {
  document.body.innerHTML = `
    <main id="main-content" tabindex="-1">
      <h1>Explorar atividades</h1>
      <form id="explore-form" role="search" aria-label="Pesquisar atividades" action="explorar.html" method="get">
        <label for="search-q">Buscar por nome da atividade</label>
        <input id="search-q" type="search" name="q" maxlength="100">
        <label for="filter-unit">Unidade</label>
        <select id="filter-unit" name="unit" aria-describedby="filter-options-status"><option value="">Todas as unidades</option></select>
        <label for="filter-category">Categoria</label>
        <select id="filter-category" name="category" aria-describedby="filter-options-status"><option value="">Todas as categorias</option></select>
        <label for="filter-audience">Público-alvo</label>
        <select id="filter-audience" name="audience" aria-describedby="filter-options-status"><option value="">Todos os públicos</option></select>
        <label for="filter-period">Quando?</label>
        <select id="filter-period" name="period">
          <option value="any">Qualquer data</option>
          <option value="today">Hoje</option>
          <option value="week">Próximos 7 dias</option>
          <option value="month">Este mês</option>
        </select>
        <button type="submit" id="explore-submit">Filtrar</button>
        <button type="button" id="explore-clear">Limpar filtros</button>
        <p id="filter-options-status" role="status"></p>
      </form>
      <section aria-labelledby="results-heading">
        <h2 id="results-heading" tabindex="-1">Resultados</h2>
        <p id="results-summary"></p>
        <div id="results-status" role="status" aria-live="polite" class="visually-hidden"></div>
        <div id="results-content" class="card-grid"></div>
        <nav id="results-pagination" aria-label="Paginação" hidden></nav>
      </section>
    </main>`;
  const $ = (id) => document.getElementById(id);
  return {
    form: $("explore-form"),
    term: $("search-q"),
    unit: $("filter-unit"),
    category: $("filter-category"),
    audience: $("filter-audience"),
    period: $("filter-period"),
    submit: $("explore-submit"),
    clear: $("explore-clear"),
    optionsStatus: $("filter-options-status"),
    heading: $("results-heading"),
    summary: $("results-summary"),
    status: $("results-status"),
    content: $("results-content"),
    nav: $("results-pagination"),
  };
}

// Monta em jsdom o trecho de atividade.html usado pela página de detalhes (mesmos ids e atributos).
export function mountDetailsDom() {
  document.body.innerHTML = `
    <main id="main-content" tabindex="-1">
      <a id="details-back" class="details-back" href="explorar.html">← Voltar para atividades</a>
      <div id="details-status" class="visually-hidden" role="status" aria-live="polite"></div>
      <div id="details-content" class="activity-details"></div>
    </main>`;
  const $ = (id) => document.getElementById(id);
  return { back: $("details-back"), status: $("details-status"), content: $("details-content") };
}

// Monta em jsdom o <main> real de contato.html (mesmos ids e atributos, sem cópia que possa divergir).
export function mountContactDom() {
  const html = readFileSync("contato.html", "utf-8");
  const main = /<main[\s\S]*?<\/main>/.exec(html);
  document.body.innerHTML = main ? main[0] : "";
  const $ = (id) => document.getElementById(id);
  return {
    form: $("contact-form"),
    name: $("contact-name"),
    email: $("contact-email"),
    subject: $("contact-subject"),
    message: $("contact-message"),
    summary: $("contact-summary"),
    clear: $("contact-clear"),
    confirmation: $("contact-confirmation"),
    back: $("contact-back"),
  };
}
