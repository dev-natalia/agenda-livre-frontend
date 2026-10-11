import { PERIODS, normalizeTerm } from "../home/search-criteria.js";
import { initFilterOptions } from "../home/filter-options.js";

const DROPPED_MESSAGE = "Um dos filtros do endereço não está mais disponível e foi desconsiderado.";
const PERIOD_KEYS = PERIODS.map((period) => period.key);

function hasOption(select, value) {
  return [...select.options].some((option) => option.value === value);
}

// Nenhum listener de input/change consulta a API: o rascunho só vira critério aplicado em "Filtrar".
export function initSearchForm({
  form,
  termInput,
  unitSelect,
  categorySelect,
  periodSelect,
  clearButton,
  noticeEl,
  onApply,
  onClear,
  getUnits,
  getCategories,
}) {
  const pending = { unit: "", category: "" };
  const touched = { unit: false, category: false };

  unitSelect.addEventListener("change", () => (touched.unit = true));
  categorySelect.addEventListener("change", () => (touched.category = true));

  // Com a lista indisponível, o critério vindo do endereço vale até a pessoa mexer no campo.
  function selectValue(select, key) {
    return select.value || (!touched[key] && pending[key]) || "";
  }

  function getDraft() {
    const period = PERIOD_KEYS.includes(periodSelect.value) ? periodSelect.value : "any";
    return {
      term: normalizeTerm(termInput.value),
      unit: selectValue(unitSelect, "unit"),
      category: selectValue(categorySelect, "category"),
      period,
    };
  }

  function setCriteria(criteria) {
    termInput.value = criteria.term ?? "";
    periodSelect.value = PERIOD_KEYS.includes(criteria.period) ? criteria.period : "any";
    pending.unit = criteria.unit ?? "";
    pending.category = criteria.category ?? "";
    touched.unit = false;
    touched.category = false;
    unitSelect.value = hasOption(unitSelect, pending.unit) ? pending.unit : "";
    categorySelect.value = hasOption(categorySelect, pending.category) ? pending.category : "";
  }

  // Carrega unidades e categorias e concilia com o que veio do endereço.
  async function loadOptions() {
    const failed = await initFilterOptions({
      unitSelect,
      categorySelect,
      statusEl: noticeEl,
      getUnits,
      getCategories,
    });
    const dropped = { unit: false, category: false };
    for (const [key, select] of [
      ["unit", unitSelect],
      ["category", categorySelect],
    ]) {
      if (!pending[key]) continue;
      if (hasOption(select, pending[key])) {
        select.value = pending[key];
      } else if (!failed[key]) {
        dropped[key] = true;
        pending[key] = "";
      }
    }
    if (dropped.unit || dropped.category) noticeEl.textContent = DROPPED_MESSAGE;
    return { failed, dropped };
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onApply(getDraft());
  });
  clearButton.addEventListener("click", () => onClear());

  return { getDraft, setCriteria, loadOptions };
}
