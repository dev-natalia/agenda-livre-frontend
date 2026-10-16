import { fetchAudiences, fetchCategories, fetchUnits } from "../api/public.js";

function validItems(data) {
  const results = Array.isArray(data?.results) ? data.results : [];
  return results.filter(
    (item) => item && typeof item.id === "string" && item.id !== "" && typeof item.name === "string" && item.name.trim() !== "",
  );
}

// Mantém a opção "todas" (primeira, fixa no HTML) e troca só as opções vindas da API.
export function fillSelect(select, items) {
  select.querySelectorAll("option[data-dynamic]").forEach((option) => option.remove());
  for (const item of items) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    option.dataset.dynamic = "";
    select.append(option);
  }
}

const FAILURE_LABELS = [
  ["unit", "as unidades"],
  ["category", "as categorias"],
  ["audience", "os públicos-alvo"],
];

function failureMessage(failed) {
  const names = FAILURE_LABELS.filter(([key]) => failed[key]).map(([, label]) => label);
  if (names.length === 0) return "";
  const text = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} e ${names.at(-1)}`;
  return `Não foi possível carregar ${text}.`;
}

// Sem bloquear o formulário nem mover o foco; cada filtro falha de forma independente.
export async function initFilterOptions({
  unitSelect,
  categorySelect,
  audienceSelect = null,
  statusEl,
  getUnits = fetchUnits,
  getCategories = fetchCategories,
  getAudiences = fetchAudiences,
}) {
  const [units, categories, audiences] = await Promise.allSettled([
    getUnits(),
    getCategories(),
    audienceSelect ? getAudiences() : Promise.resolve(null),
  ]);
  const failed = {
    unit: units.status === "rejected",
    category: categories.status === "rejected",
    audience: audiences.status === "rejected",
  };

  if (!failed.unit) fillSelect(unitSelect, validItems(units.value));
  if (!failed.category) fillSelect(categorySelect, validItems(categories.value));
  if (audienceSelect && !failed.audience) fillSelect(audienceSelect, validItems(audiences.value));
  statusEl.textContent = failureMessage(failed);
  return failed;
}
