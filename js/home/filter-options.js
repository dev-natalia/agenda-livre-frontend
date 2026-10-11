import { fetchCategories, fetchUnits } from "../api/public.js";

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

function failureMessage(failed) {
  if (failed.unit && failed.category) return "Não foi possível carregar as unidades e as categorias.";
  if (failed.unit) return "Não foi possível carregar as unidades.";
  if (failed.category) return "Não foi possível carregar as categorias.";
  return "";
}

// Sem bloquear o formulário nem mover o foco; cada filtro falha de forma independente.
export async function initFilterOptions({
  unitSelect,
  categorySelect,
  statusEl,
  getUnits = fetchUnits,
  getCategories = fetchCategories,
}) {
  const [units, categories] = await Promise.allSettled([getUnits(), getCategories()]);
  const failed = { unit: units.status === "rejected", category: categories.status === "rejected" };

  if (!failed.unit) fillSelect(unitSelect, validItems(units.value));
  if (!failed.category) fillSelect(categorySelect, validItems(categories.value));
  statusEl.textContent = failureMessage(failed);
  return failed;
}
